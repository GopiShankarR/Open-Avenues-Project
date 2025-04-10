const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello World');
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit("me", socket.id);

  socket.on("offer", (offer) => {
    console.log(`Offer received from ${socket.id}:`, offer);
    
    socket.broadcast.emit("offer", offer);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
