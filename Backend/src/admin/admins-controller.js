// Insert models here
const models = require("../../models")

// Functions for CRUD


// async function createAdmin(req, res) {
//     const admins = await models['Admin'].create({
//         username: req.body.username,
//         password: req.body.password
//     })
//     res.send(admins)
// }


async function getAdmins(req, res) {
    const {username,password} = req.body
    const response = await models['Admin'].findOne({where:{username,password}})
    res.send(response)
}

// async function getOneAdmin(req, res) {
//     const {username, password} = req.body 
//     const response = await models['Admin'].findOne({where: {username, password}})
//     res.send(response)
// }

// Exporting
module.exports = {
    // createAdmin,
    getAdmins,
    // getOneAdmin
}