const models = require("../../models");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const {Op} = require('sequelize');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'qrcodes')

async function getProducts(req, res) {
  try {
    const products = await models["Products"].findAll();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addProduct(req, res) {
  try {
    const { product_Name, product_Price, product_Stock, product_Expiry } = req.body;
    const newProduct = await models["Products"].create({
      product_Name,
      product_Price,
      product_Stock,
      product_Expiry
    });
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
    const deleted = await models["Products"].destroy({ where: { id } });
    if (deleted) res.status(200).json({ message: "Product deleted successfully" });
    else res.status(404).json({ message: "Product not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const { id, product_Name, product_Price, product_Stock, product_Expiry } = req.body;
    const product = await models["Products"].findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.product_Name = product_Name;
    product.product_Price = product_Price;
    product.product_Stock = product_Stock;
    product.product_Expiry = product_Expiry;
    await product.save();

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
    const search = await models['Products'].findAll({where: {product_Name: {[Op.like]: `%${query}%` }} })
    res.status(200).json(search);
  }
  catch(err){
    console.error("Error fetching product name")
    res.status(500).json({ error : err.message})
  }
}
async function priceSort(req,res){
  try{
    const sort = req.query.sort === 'DESC' ? "DESC" : "ASC";
    const sortedPrice = await models['Products'].findAll({
      order: [['product_Price', sort]],
    })
    res.status(200).json(sortedPrice);
  }
  catch (err){
    console.error("Error finding Price");
    res.status(500).json({error: err.message});
  }
}
async function stockSort(req,res){
   try{
    const sort = req.query.sort === 'DESC' ? "DESC" : "ASC";
    const sortedStock = await models['Products'].findAll({
      order: [['product_Stock', sort]],
    })
    res.status(200).json(sortedStock);
  }
  catch (err){
    console.error("Error finding Stock");
    res.status(500).json({error: err.message});
  }
}
async function expirySort(req,res){
  try{
    const sort = req.query.sort === 'DESC' ? "DESC" : "ASC";
    const sortedExpiry = await models['Products'].findAll({
      order: [['product_Expiry', sort]],
    })
    res.status(200).json(sortedExpiry);
  }
  catch (err){
    console.error("Error finding Expiry");
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
    priceSort,
    stockSort,
    expirySort
}