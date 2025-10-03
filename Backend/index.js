// Importing
const express = require('express')
const app = express()

app.use(express.json())

// Enter routes here
app.get('/', (req,res) => {
    res.send("Test")
})


// Server feedback
app.listen(3000, () => {
    console.log(`Server has started at http://localhost:3000`)
})