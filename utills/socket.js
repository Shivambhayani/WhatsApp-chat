// // const http = require("http");
const socketIo = require("socket.io");

function configureSocket(server) {
  const io = socketIo(server, {
    connectionStateRecovery: {},
    cors: "*",
  });

  io.on("connection", (socket) => {
    console.log("connected");
    socket.emit("message", "Welcome");

    socket.on("chat message", (msg) => {
      //   console.log("message: " + msg);
      io.emit("chat message", msg); // Broadcast message to all connected clients
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
}

module.exports = configureSocket;
