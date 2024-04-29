// // const http = require("http");
// const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const socketIo = require("socket.io");
const { generateToken, authenticateSocket } = require("../middlewares/auth");
const messageService = require("../module/message/service");
const {
  findPendingMessagesForUser,
  updateDeliveryStatus,
} = require("../module/message/controller");
const UserGroup = require("../module/user_groups/service");

// function generateToken(userId) {
//   return jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// }

function configureSocket(server) {
  const io = socketIo(server, {
    connectionStateRecovery: {},
    cors: "*",
  });
  const clients = {};
  const groups = {};
  const groupMessageDeliveryStatus = {};
  io.on("connection", async (socket) => {
    console.log("connected");
    socket.emit("greeting", "Welcome 😀");

    socket.on("login", (data) => {
      const { userId } = data;
      const token = generateToken(userId);
      console.log(token);
    });

    socket.on("join", async (data) => {
      try {
        const { groupId } = data;
        const userId = await authenticateSocket(data);
        if (!userId) {
          socket.disconnect(true);
          console.log("Socket authentication failed");
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
        console.log("Error in socket auth", error);
      }
    });

    socket.on(
      "sendMessage",
      async ({ senderId, recipientId, message, groupId }) => {
        // Create a new message record in the database
        const newMessage = await messageService.create({
          conversation: message,
          senderId: senderId,
          receiverId: recipientId,
          groupId: groupId || null,
          sent_At: new Date(),
          delivred: false, // Assuming the message is not yet delivered
        });
        // Check if the message was successfully created
        if (newMessage) {
          console.log("Message saved to the database:", newMessage.toJSON());
        } else {
          console.error("Failed to save message to the database");
          return;
        }
        if (groupId) {
          // Group chat
          if (!groups[groupId] || !groups[groupId].includes(senderId)) {
            console.log(
              `Sender ${senderId} or recipient ${recipientId} is not a member of group ${groupId}`
            );
            return; // Do not send the message if either sender or recipient is not in the group
          }
          console.log(
            `Message sent from ${senderId} to group ${groupId}: ${message}`
          );
          socket.broadcast
            .to(groupId)
            .emit("receiveMessage", { senderId, message }); //sender not recive message
          // Track the delivery status for the group message
          // groupMessageDeliveryStatus[newMessage.id] = {
          //   groupId: groupId,
          //   recipients: [],
          // };
          console.log(`Message received by ${recipientId}: ${message}`);
          // await updateDeliveryStatus(newMessage.id, true);
        } else if (!groupId) {
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
            console.log(newMessage.id);
            socket
              .to(recipientClient.socketId)
              .emit("receiveMessage", { senderId, message });
            await updateDeliveryStatus(newMessage.id, true);
            console.log(`Message received by ${recipientId}: ${message}`);
          }
        }
      }
    );
    socket.on("getAllMessage", async (data) => {
      try {
        const { userId, groupId } = data;
        // const allMessages = await messageService.findAndCountAll({
        //   limit: 10,
        //   offset: 3,
        //   order: [["createdAt", "DESC"]], // Assuming messages are sorted by creation date
        // });
        let messages;
        if (groupId) {
          // Fetch messages for a specific group chat
          messages = await messageService.findAll({
            where: {
              groupId: groupId,
            },
            order: [["createdAt", "DESC"]],
          });
        } else {
          // Fetch messages for a one-to-one chat
          messages = await messageService.findAll({
            where: {
              [Op.or]: [{ senderId: userId }, { receiverId: userId }],
              groupId: null, // Exclude group messages
            },
            order: [["createdAt", "DESC"]],
          });
        }
        socket.emit("allMessages", messages);
      } catch (error) {
        console.error("Error getting all messages:", error);
        socket.emit("error", "Error fetching messages");
      }
    });
    socket.on("updateMessage", async (data) => {
      try {
        const { messageId, conversation } = data;
        // console.log(messageId, newData);
        const [rowsAffected, updatedMessage] = await messageService.update(
          { conversation },
          {
            where: {
              id: messageId,
              groupId: null,
            },
            returning: true,
          }
        );

        // Broadcast the updated message to all connected clients
        io.emit("messageUpdated", updatedMessage[0]);
      } catch (error) {
        console.error("Error updating message:", error);
        // Optionally, emit an error event to the client
        socket.emit("updateMessageError", "Error updating message");
      }
    });
    socket.on("addMemberToGroup", async ({ adminId, userIdToAdd, groupId }) => {
      try {
        // Check if the user is an admin of the group
        const isAdmin = await checkAdminStatus(adminId, groupId);
        if (!isAdmin) {
          socket.emit("addMemberToGroupError", {
            message: "Only admins can add members to the group.",
          });
          return;
        }

        // Now you can add the new member to the group
        await addMemberToGroup(userIdToAdd, groupId);
        socket.emit("memberAddedToGroup", {
          userId: userIdToAdd,
          groupId: groupId,
        });
      } catch (error) {
        console.error("Error adding member to group:", error.message);
        socket.emit("addMemberToGroupError", {
          message: "Error adding member to group.",
        });
      }
    });
    socket.on("removeMember", async ({ adminId, memberId, groupId }) => {
      try {
        // Check if the user initiating the removal is an admin
        const isAdmin = await checkAdminStatus(adminId, groupId);
        if (!isAdmin) {
          // If the user is not an admin, emit an error event to the client
          socket.emit(
            "removeMemberError",
            "You do not have permission to remove members from this group."
          );
          return;
        }

        // If the user is an admin, proceed with removing the member from the group
        const message = await removeMember(adminId, memberId, groupId);

        // Emit a success event to the client
        socket.emit("memberRemoved", message);
      } catch (error) {
        // If an error occurs, emit an error event to the client
        socket.emit("removeMemberError", error.message);
      }
    });

    // Delete msg
    socket.on("delete", async (data) => {
      try {
        const { senderId, messageId, groupId } = data;
        const idsArray =
          typeof messageId === "string" ? messageId.split(",") : messageId;
        const deleteMsg = await messageService.destroy({
          where: {
            senderId: senderId,
            [Op.or]: [
              { id: idsArray }, // Delete messages with specific IDs
              { groupId: groupId || null }, // Delete messages in a specific group or individual messages
            ],
          },
        });

        socket.emit("deleteMsg", deleteMsg);
      } catch (error) {
        console.error("error:", error);
      }
    });
    // Upon user reconnection, check for pending messages and emit them to the user
    socket.on("reConnect", async ({ userId, groupId }) => {
      const pendingMessages = await findPendingMessagesForUser(userId, groupId);
      pendingMessages.forEach(async (message) => {
        socket.emit("receiveMessage", message);
        const messageRecipients = groups[groupId] || [];
        console.log("Message recipients:", messageRecipients);
        console.log(
          "Group message delivery status:",
          groupMessageDeliveryStatus
        );
        if (messageRecipients && messageRecipients.length > 0) {
          const messageSeenByAll = messageRecipients.every(
            (recipientId) =>
              recipientId !== message.senderId && // Exclude the sender
              groupMessageDeliveryStatus[groupId]?.[message.id]?.includes(
                recipientId
              ),
            console.log("group", groupMessageDeliveryStatus[groupId])
          );
          console.log("staus", groupMessageDeliveryStatus);
          if (
            groupMessageDeliveryStatus[groupId] &&
            groupMessageDeliveryStatus[groupId][message.id]
          ) {
            console.log(groupMessageDeliveryStatus[groupId][message.id]);
          } else {
            console.log("Delivery status not found for message:", message.id);
          }
          console.log("seen", messageSeenByAll);
          // Update delivery status only if the message has been seen by all recipients except the current user
          if (messageSeenByAll && !message.delivred) {
            await updateDeliveryStatus(message.id, true);

            console.log("Delivery status updated for message:", message.id);
          }
        }
      });
    });
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

// check admin
async function checkAdminStatus(adminId, groupId) {
  const admin = await UserGroup.findOne({
    where: { userId: adminId, groupId: groupId, role: 1 },
  });
  return !!admin; // Convert to boolean
}
async function addMemberToGroup(userIdToAdd, groupId) {
  await UserGroup.create({ userId: userIdToAdd, groupId: groupId, role: 0 });
}
async function removeMember(adminId, memberId, groupId) {
  // Check if the user initiating the removal is an admin
  const isAdmin = await checkAdminStatus(adminId, groupId);
  if (!isAdmin) {
    throw new Error(
      "You do not have permission to remove members from this group."
    );
  }

  // Now you can proceed with removing the member
  await UserGroup.destroy({
    where: { userId: memberId, groupId: groupId },
  });
  return "Member removed successfully.";
}
module.exports = configureSocket;
