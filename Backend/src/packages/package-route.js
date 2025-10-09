const express = require('express');
const router  = express.Router();
const controller = require("./package-controller");

router.get('/', controller.getPackage);
router.post('/create', controller.addPackage);
router.post('/delete', controller.deletePackage);
router.post('/update', controller.updatePackage);
router.get('/:id', controller.getPackageById);

module.exports = router;