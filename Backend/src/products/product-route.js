const express = require('express');
const router  = express.Router();
const controller = require("./product-controller");

router.get('/', controller.getProducts);
router.post('/create', controller.addProduct);
router.post('/delete', controller.deleteProduct);
router.post('/update', controller.updateProduct);
router.get('/search', controller.searchProduct);
router.get('/price', controller.priceSort);
router.get('/stock', controller.stockSort);
router.get('/expiry', controller.expirySort);
router.get('/:id', controller.getProductById);

module.exports = router;