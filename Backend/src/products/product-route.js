const express = require('express');
const router  = express.Router();
const controller = require("./product-controller");

router.get('/', controller.getProducts);

module.exports = router;