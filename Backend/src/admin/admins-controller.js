// Insert models here
const jwt = require('jsonwebtoken');
const models = require("../../models")
const nodemailer = require('nodemailer');

// insert mailer here
// const transporter = require("../mailer/mailer")
require('dotenv').config();
// Functions for CRUD


async function createAdmin(req, res) {
    const admins = await models['Admin'].create({
        email: req.body.email,
        password: req.body.password
    })
    res.send(admins)
}


async function getAdmins(req, res) {
    if (req.isAuthenticated()){
       res.send({
            status: 200,
            message: "Successfully logined",
       })
    }
    else{
        res.status(401).send("error 401: Unauthorized")
    }
}



// async function loginRole(req,res){
//     if(req.user.role === "admin"){
//         res.send({
//             status: 200,
//             message:"Welcome Admin"})
//     }
//     else if (req.user.role === 'seller'){
//         res.send({
//             status: 200,
//             message:"Welcome Seller"})
//     }
//     else{
//         res.send("An error occured")
//     }
// }


// This is so bad, try to upgrade this later
async function forgotPassword(req, res) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    
    })
    const email = req.body.email;
    const admin = await models['Admin'].findOne({ where: { email } });
    if (!admin) {
        return res.send(null);
    }
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"Admin Support" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click below to reset your password (valid for 1 hour):</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.send(admin);

}

// Another one, this is so bad, try to upgrade this later
async function resetPassword(req,res) {
    const token = req.body.token;
    const newPassword = req.body.password;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await models['Admin'].findByPk(decoded.id);


    // updating password
    await admin.update({ password: newPassword }, { where: { id: admin.id } });
    res.send("Password has been reset");
    
}


// Exporting
module.exports = {
    createAdmin,
    getAdmins,
    forgotPassword,
    resetPassword,
    // getOneAdmin
}