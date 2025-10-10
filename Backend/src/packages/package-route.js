const express = require('express');
const router = express.Router();
const packageController = require('./package-controller');

router.get('/', packageController.getPackage);
router.post('/create', packageController.addPackage);
router.post('/delete', packageController.deletePackage);
router.post('/update', packageController.updatePackage);
router.get('/:id', packageController.getPackageById);
router.get('/sellers/list', packageController.getSellers); // Add this route

module.exports = router;