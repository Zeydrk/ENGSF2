// Importing
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.get('/', (req, res) => res.send("Server Running"));

app.use('/admins', require('./src/admin/admins-routes'));
app.use('/products', require('./src/products/product-route'));
app.use('/packages', require('./src/packages/package-route'));
app.use('/sellers', require('./src/sellers/seller-route'));

// Start server
app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});