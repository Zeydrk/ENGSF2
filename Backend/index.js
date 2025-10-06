// Importing
const express = require('express')
const app = express()
const cors = require('cors')

// importing routes here
const adminsRoutes = require('./src/admin/admins-routes')

// Middleware
app.use(express.json())
app.use(cors())
app.use(express.text())

// Enter routes here
app.get('/', (req,res) => {
    res.send("Test")
})
app.use('/admins',adminsRoutes)


// Server feedback
app.listen(3000, () => {
    console.log(`Server has started at http://localhost:3000`)
})