const express = require('express');
const router = express.Router();
const controller = require('./admins-controller');

// Routes
// router.post('/', controller.createAdmin);
router.get('/', controller.getAdmins);

module.exports = router;