const models = require("../../models");

async function getProducts(req, res) {
    const products = await models["Products"].findAll();
    res.send(products);
}
async function addProduct(req,res){
    const {product_Name, product_Price} = req.body;
    await models['Products'].create({
        product_Name,
        product_Price
    })
}
async function deleteProduct(req,res){

}
async function updateProduct(req,res) {
    
}
module.exports = {
    getProducts,
    addProduct
}