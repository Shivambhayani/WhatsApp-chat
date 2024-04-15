const app = require("./app.js");
const http = require("http");
// const socketIo = require("./utills/socket");
const socketIO = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
// const service = require("./module/user/service.js");
dotenv.config({
  path: "./.env",
});
const port = process.env.PORT || 3001;

const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" },
});
// const generateMessage = (text) => {
//   return text;
// };

// io.on("connection", (socket) => {
//   // console.log(generateMessage("a user connected"));

//   socket.emit("message", "welcome to the server");
//   socket.broadcast.emit("message", "a new user joined");

// Set user online status
// socket.on("setOnlineStatus", async (userId) => {
//   try {
//     await service.findOne({ is_online: "1" }, { where: { id: userId } });
//     console.log(`User ${userId} is online`);
//   } catch (error) {
//     console.error("Error setting user online status:", error);
//   }
// });
// Set user offline status
// socket.on("setOflineStatus", async (userId) => {
//   try {
//     await service.findOne({ is_online: "0" }, { where: { id: userId } });
//     console.log(`User ${userId} is offline`);
//   } catch (error) {
//     console.error("Error setting user online status:", error);
//   }
// });

// socket.emit("countUpdated");

// socket.on("disconnect", () => {
//   io.emit("user has left");
//   console.log("user Discconnected");
// });

//   socket.on("chat message", (msg) => {
//     io.emit("chat message", msg);
//   });
// });

server.listen(port, () => {
  console.log(`💻 Server is listening on port ${port}`);
});
