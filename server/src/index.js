const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello from signaling server');
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Tell the client its own socket ID
  socket.emit('me', socket.id);

  // Listen for offer-signals from initiators
  socket.on('offer', (payload) => {
    const { callFromUserSocketId, callToUserSocketId, offerSignal } = payload;
    console.log(
      `Offer received from ${callFromUserSocketId} → ${callToUserSocketId}`
    );
    // Forward that offer only to the intended recipient
    if (callToUserSocketId) {
      io.to(callToUserSocketId).emit('offer', payload);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
