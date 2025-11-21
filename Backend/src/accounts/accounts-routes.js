// insert required packages
const express = require('express')
const router = express.Router()
const passport = require("./middleware/accounts-middleware")

// insert controller
const controller = require('./accounts-controller')

router.post('/register', controller.createAccount)
router.post('/register2', controller.createAccount2)
router.post('/login', controller.login)

module.exports = router