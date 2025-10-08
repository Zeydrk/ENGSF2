const models = require("../../models");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

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
    const { product_Name, product_Price ,product_Stock, product_Expiry} = req.body;
    const newProduct = await models["Products"].create({ product_Name, product_Price ,product_Stock, product_Expiry});
      const baseUrl = process.env.APP_URL || 'https://yourdomain.com';
    const qrValue = `${baseUrl}/products/${product.id}`;

    // generate SVG string
    const svgString = await QRCode.toString(qrValue, { type: 'svg', margin: 1 });

    // ensure folder exists
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    // unique filename
    const fileName = `qr_product_${product.id}_${Date.now()}.svg`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // save SVG file
    fs.writeFileSync(filePath, svgString, 'utf8');

    // public path that your Express will serve: '/uploads/qrcodes/qr_...svg'
    const publicPath = `/uploads/qrcodes/${fileName}`;

    // update product record with qr metadata
    await product.update({ qrCodeValue: qrValue, qrCodePath: publicPath });

    res.status(201).json(newProduct);
  } catch (err) {
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

module.exports = {
    getProducts,
    addProduct,
    deleteProduct,
    updateProduct
}