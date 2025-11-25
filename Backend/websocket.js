// test-websocket.js
console.log('🟢 STEP 2: Testing WebSocket server...');

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// WebSocket setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('WebSocket server is working!');
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('✅ WebSocket server started on port 3000');
  console.log('✅ Go to: http://localhost:3000');
});

// Error handling
server.on('error', (error) => {
  console.log('❌ Server error:', error.message);
});