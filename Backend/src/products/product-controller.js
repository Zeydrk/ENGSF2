const models = require("../../models");

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
    const { product_Name, product_Price } = req.body;
    const newProduct = await models["Products"].create({ product_Name, product_Price });
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
    const { id, product_Name, product_Price } = req.body;
    const product = await models["Products"].findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.product_Name = product_Name;
    product.product_Price = product_Price;
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