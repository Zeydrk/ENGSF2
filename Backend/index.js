// Importing
const express = require('express')
const app = express()

<<<<<<< Updated upstream
=======
// importing routes here
const adminsRoutes = require('./src/admin/admins-routes')
const productRoutes = require('./src/products/product-route')

// Middleware
>>>>>>> Stashed changes
app.use(express.json())

// Enter routes here
app.get('/', (req,res) => {
    res.send("Test")
})
<<<<<<< Updated upstream


app.use('/admins', require('./src/admin/admins-routes'))
=======
app.use('/admins',adminsRoutes);
app.use('/products', productRoutes);
>>>>>>> Stashed changes


// Server feedback
app.listen(3000, () => {
    console.log(`Server has started at http://localhost:3000`)
})