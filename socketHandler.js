const { Server } = require('socket.io');

// Initializes the Socket.io server layer and handles connection protocols
const initSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Enables local cross-origin requests for testing
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    // Prints a message immediately when a client opens a connection handshake
    console.log(`📡 Network Verification: Client linked successfully! Socket ID: ${socket.id}`);

    // Dynamic test event listener to prove active communication during presentation
    socket.on('ping_test', (data) => {
      console.log(`📩 Message from client: ${data.message}`);
      socket.emit('pong_test', { message: "Server handshake confirmed!" });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Network Connection terminated for client: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSockets;