// test-server.js
console.log('🟢 STEP 1: Testing basic server...');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Basic server is working!');
});

app.listen(3000, () => {
  console.log('✅ Basic server started on port 3000');
  console.log('✅ Go to: http://localhost:3000');
});