const models = require("../../models");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const {Op} = require('sequelize');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'qrcodes')

async function getProducts(req, res) {
  try {
    let {page,limit} = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 7;

    const offset = (page - 1) * limit;
    const {count, rows} = await models["Products"].findAndCountAll({
      limit,
      offset,
      where:{isArchived: false},
      order: [['product_Name', 'ASC']],
    })
    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count/limit),
      currentPage: page,
      products: rows,
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function archivedProducts(req,res){
  try {
    let {page,limit} = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 7;

    const offset = (page - 1) * limit;
    const {count, rows} = await models["Products"].findAndCountAll({
      limit,
      offset,
      where:{isArchived: true},
      order: [['product_Name', 'ASC']],
    })
    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count/limit),
      currentPage: page,
      products: rows,
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function archiveAddBack(req,res){
  try{
    const {id} = req.body;

    if(!id){
      return res.status(400).json({message:"Product ID is required."})
    }
    const product = await models['Products'].findByPk(id);

    if(!product){
      return res.status(404).json({message:"Product not found"})
    }
    
    product.isArchived = false;
    await product.save();

    return res.status(200).json({message:"Product added successfully."});
  }
  catch(err){
    console.error("Adding error:", err);
    return res.status(500).json({message:"Internal server error."})
  }
}

async function archiveProduct(req, res) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required." });
    }
    const product = await models['Products'].findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }
    
    product.isArchived = true;
    await product.save();

    return res.status(200).json({ message: "Product archived successfully." });
  } catch (err) {
    console.error("Archive error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function addProduct(req, res) {
  try {
    const { product_Name,product_Description, product_RetailPrice, product_BuyingPrice,product_Category, product_Stock, product_Expiry } = req.body;
    
    const existing = await models["Products"].findOne({
      where: { product_Name: product_Name.trim() },
    });

    if (existing) {
      return res.status(400).json({ message: "Product name already exists" });
    }
    const newProduct = await models["Products"].create({
      product_Name,
      product_Description,
      product_RetailPrice,
      product_BuyingPrice,
      product_Stock,
      product_Category,
      product_Expiry
    });
    
    const today = new Date();
    const expiry = new Date(product_Expiry);
    const diff = (expiry - today) / (1000 * 60 * 60 * 24);

    if (expiry < today) {
      return res.status(400).json({ message: "Cannot add expired product." });
    } else if (diff <= 5) {
      return res.status(400).json({ message: "Product expires too soon (within 5 days)." });
    }
    
    const baseUrl = process.env.APP_URL || 'http://localhost:5173';
    const qrValue = `${baseUrl}/products/${newProduct.id}`;
    const svgString = await QRCode.toString(qrValue, { type: 'svg', margin: 1 });

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    const fileName = `qr_product_${newProduct.id}_${Date.now()}.svg`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, svgString, 'utf8');

    const publicPath = `/uploads/qrcodes/${fileName}`;
    await newProduct.update({
      product_QrCodeValue: qrValue,
      product_QrCodePath: publicPath
    });

    res.status(201).json(newProduct);

  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.body;
    const product = await models["Products"].findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.product_Stock <= 0) {
      await models["Products"].destroy({ where: { id } });
      
      return res.status(200).json({ message: "Product deleted successfully" });
    } else {
      return res.status(400).json({ message: "Product still has stock." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id, product_Name, product_RetailPrice, product_BuyingPrice,product_Description,product_Category, product_Stock, product_Expiry } = req.body;
    
    // Get old product data before update (ONLY FOR STOCK COMPARISON)
    const oldProduct = await models["Products"].findByPk(id);
    if (!oldProduct) return res.status(404).json({ message: "Product not found" });

    const product = await models["Products"].findByPk(id);
    
    product.product_Name = product_Name;
    product.product_RetailPrice = product_RetailPrice;
    product.product_BuyingPrice = product_BuyingPrice;
    product.product_Description = product_Description;
    product.product_Category = product_Category; 
    product.product_Stock = product_Stock;
    product.product_Expiry = product_Expiry;
    await product.save();

    // Check if stock decreased and log to admin activity
    if (oldProduct && product_Stock < oldProduct.product_Stock) {
      const stockDiff = oldProduct.product_Stock - product_Stock;
      
      // Log to admin activity
      await models.AdminLogActivity.create({
        adminId: req.user?.id || 1,
        productId: id,
        action: 'STOCK_DECREASE',
        details: `Stock decreased from ${oldProduct.product_Stock} to ${product_Stock} (${stockDiff} units)`
      });
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await models["Products"].findByPk(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: err.message });
  }
}

async function searchProduct(req, res){
  try {
    const {query} = req.query;
    const search = await models['Products'].findAll({
         where: {
          product_Name: { [Op.like]: `%${query}%` },
          isArchived: false
} })
    res.status(200).json(search.map(p => p.toJSON()));
  }
  catch(err){
    console.error("Error fetching product name")
    res.status(500).json({ error : err.message})
  }
}

async function searchArchiveProduct(req, res){
  try {
    const {query} = req.query;
    const search = await models['Products'].findAll({
      where: {
          product_Name: { [Op.like]: `%${query}%` },
          isArchived: true
}
, })
    res.status(200).json(search);
  }
  catch(err){
    console.error("Error fetching arhchived product name")
    res.status(500).json({ error : err.message})
  }
}

async function categoryArchiveSort(req,res){
  try{
    const sort = req.query.sort;
    const sortedCategory = await models['Products'].findAll({
      where: {product_Category: {[Op.eq]: `${sort}`},
              isArchived:true},
      order: [['product_Name', 'ASC']],
    })
    res.status(200).json(sortedCategory);
  }
  catch (err){
    console.error("Error finding Category");
    res.status(500).json({error: err.message});
  }
}

async function categorySort(req,res){
  try{
    const sort = req.query.sort;
    const sortedCategory = await models['Products'].findAll({
      where: {product_Category: {[Op.eq]: `${sort}`},
              isArchived:false},
      order: [['product_Name', 'ASC']],
    })
    res.status(200).json(sortedCategory);
  }
  catch (err){
    console.error("Error finding Category");
    res.status(500).json({error: err.message});
  }
}

module.exports = {
    getProducts,
    addProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    searchProduct,
    categorySort,
    archivedProducts,
    archiveProduct,
    archiveAddBack,
    searchArchiveProduct,
    categoryArchiveSort,
}