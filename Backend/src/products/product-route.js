const express = require('express');
const router  = express.Router();
const controller = require("./product-controller");

router.get('/', controller.getProducts);
router.post('/create', controller.addProduct);
router.post('/delete', controller.deleteProduct);
router.post('/update', controller.updateProduct);

module.exports = router;