// insert required packages
const express = require('express')
const router = express.Router()

// insert controller
const controller = require('./accounts-controller')

router.post('/register', controller.createAccount)
router.post('/register2', controller.createAccount2)

module.exports = router