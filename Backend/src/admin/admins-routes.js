const express = require('express');
const router = express.Router();
const controller = require('./admins-controller');

// Routes
router.post('/', controller.createAdmin);
// Changed to post because we are sending username and password in the body
router.post('/login', controller.getAdmins);
// forgot password emailers
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/', controller.resetPassword);

module.exports = router;