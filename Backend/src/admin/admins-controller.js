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
    const admins = await models['Admin'].findAll()
    res.send(admins)
}

// Exporting
module.exports = {
    // createAdmin,
    getAdmins
}