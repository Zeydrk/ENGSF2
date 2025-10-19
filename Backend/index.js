// Importing
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');
require('dotenv').config();



// importing routes here
const adminsRoutes = require('./src/admin/admins-routes')
const productRoutes = require('./src/products/product-route')
const packageRoutes = require('./src/packages/package-route')
const sellerRoutes = require('./src/sellers/seller-route')

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.text());

// Enter routes here
app.get('/', (req,res) => {
    res.send("Test")
})



app.use('/admins', require('./src/admin/admins-routes'))

app.use('/admins',adminsRoutes);
app.use('/products', productRoutes);
app.use('/packages', packageRoutes);
app.use('/sellers', sellerRoutes);



// Server feedback
app.listen(3000, () => {
    console.log(`Server has started at http://localhost:3000`)
})