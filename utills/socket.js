// const http = require("http");
const socketIO = require("socket.io");

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server);

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.IO not initialized");
    }
    return io;
  },
};
