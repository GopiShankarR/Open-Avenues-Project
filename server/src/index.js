const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

const PORT = process.env.PORT || 8080;

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('me', socket.id);

  socket.on('offer', (payload) => {
    io.to(payload.callToUserSocketId).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.callToUserSocketId).emit('answer', payload);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
