const express = require('express');
const router = express.Router();
const controller = require('./admins-controller');
const passport = require('./middleware/admin-middleware.js');
const registerMiddleware = require("./middleware/register-middleware.js")

// Routes
router.post('/', registerMiddleware ,controller.createAdmin);
<<<<<<< HEAD
<<<<<<< HEAD

router.get('/test', (req,res) => {
    console.log(req.session.id)
    req.sessionStore.get(req.session.id, (err, sessionData)=>{
        if(err){
            console.log(err)
        }
        console.log(sessionData)
    })

    res.send("Hi")
})
<<<<<<< HEAD
=======
>>>>>>> parent of 9f16310 (currently doing the session store)
=======

>>>>>>> parent of 2ece87f (sync with main)
=======
>>>>>>> parent of 9f16310 (currently doing the session store)
// Changed to post because we are sending username and password in the body
router.post('/login',passport.authenticate('local'),controller.getAdmins);
// forgot password emailers
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/', controller.resetPassword);

module.exports = router;