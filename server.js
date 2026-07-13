const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const initSockets = require('./network/socketHandler');
const ludoMap = require('./ludoMap'); 

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// 1. Fire up Database Connection
connectDB();

// 2. Fire up Real-time Socket Listener
initSockets(server);

// 3. Simple API Route to prove Map Matrix is loaded and active
app.get('/api/map', (req, res) => {
  res.json({ message: "Ludo map layout loaded successfully", matrix: ludoMap });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Ludo Engine running on http://localhost:${PORT}`);
});