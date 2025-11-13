// insert required packages
const jwt = require('jsonwebtoken')

// insert models here
const models = require('../../models')


// functions for CRUD
// not sure if I will use this for the accounts
async function createAccount(req, res) {
    const account = await models['Account'].create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactNo: req.body.contactNo
    })
    res.send(account)
}

async function createAccount2(req,res){
    const seller = await models["Seller"].create({
        seller_FName: req.body.seller_FName,
        seller_LName: req.body.seller_LName,
        seller_Email: req.body.seller_Email,
        seller_Password: req.body.seller_Password,
        seller_ContactNo: req.body.seller_ContactNo
    })
    res.send(seller)
}




async function getAccount(req,res){
    const admin = await models['Admin'].findByPk()
}

// Exporting
module.exports = {
    createAccount,
    createAccount2
}
