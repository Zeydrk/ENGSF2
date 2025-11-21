// Importing
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');
const passport = require('passport');
const session = require('express-session');

require('dotenv').config();
require('./src/accounts/middleware/accounts-middleware')

// importing routes here
const adminsRoutes = require('./src/admin/admins-routes')
const productRoutes = require('./src/products/product-route')
const packageRoutes = require('./src/packages/package-route')
const sellerRoutes = require('./src/sellers/seller-route')
// for testing
const accountsRoutes = require('./src/accounts/accounts-routes')


// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.text());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: true,
    // cookie:{
    //     maxAge: 24 * 60 * 60 * 1000  //supposed to be a day
    // }
}))
app.use(passport.initialize());
app.use(passport.session());


// Enter routes here
app.get('/', (req,res) => {
    res.send("Test")
})

app.use('/admins', require('./src/admin/admins-routes'))

app.use('/admins',adminsRoutes);
app.use('/products', productRoutes);
app.use('/packages', packageRoutes);
app.use('/sellers', sellerRoutes);

app.use('/accounts', accountsRoutes);



// Server feedback
app.listen(3000, () => {
    console.log(`Server has started at http://localhost:3000`)
})