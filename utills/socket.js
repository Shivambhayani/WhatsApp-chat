// // const http = require("http");
// const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");
const { generateToken } = require("../middlewares/auth");

const clients = {};
const groups = {};

// function generateToken(userId) {
//   return jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// }
// function verifyToken(token) {
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
//     console.log(decoded);
//     return decoded.userId;
//   } catch (err) {
//     console.log("verify token error", err);
//     return null;
//   }
// }

// function authenticateSocket(data, next) {
//   let token;
//   if (data.authorization?.startsWith("Bearer")) {
//     token = data.authorization?.split(" ")[1];
//     console.log("join ==>", token);
//   }
//   console.log(token);
//   const userId = verifyToken(token);
//   console.log(userId);
//   if (!userId) {
//     console.error("Socket authentication failed: Invalid token");
//     next(new Error("Authentication error"));
//     return;
//   }
//   // Attach user ID to the socket object for later use
//   data.userId = userId;
//   next();
// }

function configureSocket(server) {
  const io = socketIo(server, {
    connectionStateRecovery: {},
    cors: "*",
  });

  io.on("connection", (socket) => {
    console.log("connected");
    socket.emit("greeting", "Welcome 😀");

    socket.on("login", async (data) => {
      const { userId } = data;
      const token = generateToken(userId);
      console.log(token);
    });

    socket.on("join", async (data) => {
      try {
        const { userId, groupId } = data;
        let token;
        if (data.authorization?.startsWith("Bearer")) {
          token = data.authorization?.split(" ")[1];
          // console.log("join ==>", token);
        }

        if (!token) {
          socket.disconnect(true);
          console.log("Please provide token");
          return;
        }

        if (!clients[userId] || !clients[userId].groups) {
          clients[userId] = clients[userId] || {
            socketId: socket.id,
            online: true,
            groups: [],
          }; // Combine checks and initialization
        }
        if (!groupId) {
          socket.join(userId);
          console.log(`${userId} joined the indivual chat`);
        }

        if (groupId) {
          groups[groupId] = groups[groupId] || [];
          groups[groupId].push(userId);
          clients[userId].groups.push(groupId);
          socket.join(groupId); // Join the group room for broadcasting messages
          console.log(`${userId} joined group ${groupId}`);
          socket.emit("userJoinedGroup", { groupId });
        }

        socket.emit("userOnlineStatus", clients);
      } catch (error) {
        console.log("Error in socket auth", err);
      }
    });

    socket.on(
      "sendMessage",
      ({ senderId, recipientId, message, groupId, userId }) => {
        if (groupId) {
          // Group chat
          console.log(
            `Message sent from ${senderId} to group ${groupId}: ${message}`
          );
          socket.broadcast
            .to(groupId)
            .emit("receiveMessage", { senderId, message }); //sender not recive message
          console.log(`Message received by ${recipientId}: ${message}`);
        } else if (!groupId && userId) {
          console.log(
            `Message sent from ${senderId} to ${recipientId}: ${message}`
          );
          // Check if recipient is connected
          const recipientClient = clients[recipientId];
          if (
            recipientClient &&
            recipientClient.online &&
            recipientClient.socketId
          ) {
            // If recipient is connected, send message only to recipient
            socket
              .to(recipientClient.socketId)
              .emit("receiveMessage", { senderId, message });
            console.log(`Message received by ${recipientId}: ${message}`);
          }
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      for (const userId in clients) {
        if (clients[userId].socketId === socket.id) {
          // clients[userId].online = false;
          delete clients[userId];
          console.log(`${userId} user is offline`);
          socket.emit("userOnlineStatus", clients);

          break;
        }
      }
    });
  });

  return io;
}

module.exports = configureSocket;

const offlineMessages = {};
// Function to deliver offline messages to online users when they come online
function deliverOfflineMessages(io, clients, offlineMessages, userId) {
  const client = clients[userId];
  if (client && client.online && client.socketId) {
    const messages = offlineMessages[userId];
    if (messages && messages.length > 0) {
      messages.forEach((msg) => {
        io.to(client.socketId).emit("receiveMessage", msg);
      });
      delete offlineMessages[userId]; // Clear offline messages for the user
      console.log(`Delivered offline messages to user ${userId}`);
    }
  }
}
