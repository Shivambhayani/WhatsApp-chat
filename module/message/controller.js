const service = require("./service.js");
const User = require("../user/model.js");
const userService = require("../user/service.js");
const { Op } = require("sequelize");
const MessageReply = require("../messageReply/model.js");
const { uploadFileToCloudinary } = require("../fileStroage/controller.js");
const FileStore = require("../fileStroage/model.js");

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversation, receiverId } = req.body;
    const senderId = req.user.id;

    // Check if the receiver exists
    const receiver = await userService.findOne({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let existingMessages = await service.findAll({
      where: {
        [Op.or]: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      include: [
        {
          model: MessageReply,
          include: [
            { model: User, as: "sender", attributes: ["id", "name"] },
            { model: User, as: "receiver", attributes: ["id", "name"] },
          ],
          attributes: [
            "id",
            "conversation",
            "senderId",
            "receiverId",
            "sent_At",
            "seen_At",
            "delivred",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "conversation",
        "senderId",
        "receiverId",
        "sent_At",
        "seen_At",
        "delivred",
      ],
    });

    const message = await service.create({
      conversation,
      senderId,
      receiverId,
      sent_At: new Date(),
      delivred: false,
    });

    //  file uploads in cloudnary
    if (req.file) {
      await uploadFileToCloudinary(req, message);
    }
    return res
      .status(201)
      .json({ status: "success", data: { message, existingMessages } });
  } catch (error) {
    // return res.status(500).json({ status: "error", message: error });
    next(error);
  }
};

exports.getAllMessage = async (req, res, next) => {
  try {
    const messages = await service.findAll({
      where: { groupId: null },
      include: [
        { model: User, as: "sender", attributes: ["id", "name"] },
        { model: User, as: "receiver", attributes: ["id", "name"] },
        {
          model: MessageReply, // Include message replies
          include: [
            { model: User, as: "sender", attributes: ["id", "name"] },
            { model: User, as: "receiver", attributes: ["id", "name"] },
          ],
          attributes: [
            "id",
            "messageId",
            "conversation",
            "sent_At",
            "seen_At",
            "delivred",
            "senderId",
          ],
          order: [["createdAt", "DESC"]],
        },
        {
          model: FileStore, // Include file sharing
          attributes: [
            "id",
            "messageId",
            "filename",
            "type",
            "filesize",
            "fileurl",
            "sent_At",
            "seen_At",
            "delivered",
          ],
          order: [["sent_At", "DESC"]],
        },
      ],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "conversation", "sent_At", "seen_At", "delivred"],
    });

    res.status(200).json({ status: "success", data: messages });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const messageIds = req.params.id.split(",").map((id) => parseInt(id));

    // Delete one-to-one messages where the group ID is null
    const result = await service.destroy({
      where: {
        id: messageIds,
        senderId: req.user.id,
        groupId: null,
      },
    });

    // If no rows were affected, return an error
    if (result === 0) {
      return res.status(403).json({
        status: "fail",
        error: "You are not authorized to delete these messages",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

//  edit messages

exports.editmesseges = async (req, res, next) => {
  try {
    const messageIds = req.params.id;
    const [updatedRowsCount, updatedMessages] = await service.update(req.body, {
      where: {
        id: messageIds,
        senderId: req.user.id,
        groupId: null,
      },
      returning: true, // This option is necessary to return the updated message
    });

    // If no rows were affected by the update, return error
    if (updatedRowsCount === 0) {
      return res.status(403).json({
        status: "fail",
        error: "You are not authorized to edit this message",
      });
    }

    // If the message was updated successfully, return success response
    return res.status(203).json({
      status: "success",
      message: "Message updated successfully",
      data: updatedMessages[0], // Assuming only one message is updated
    });
  } catch (error) {
    next(error);
  }
};

exports.findPendingMessagesForUser = async (userId, groupId = null) => {
  try {
    const whereCondition = groupId ? { groupId } : { receiverId: userId };
    const pendingMessages = await service.findAll({
      where: {
        ...whereCondition,
        delivred: false, // Filter messages that are not yet delivered
      },
    });
    return pendingMessages;
  } catch (error) {
    console.error("Error finding pending messages for user:", error);
    throw error;
  }
};

exports.updateDeliveryStatus = async (messageId, delivred) => {
  try {
    const [rowsAffected] = await service.update(
      { delivred },
      {
        where: {
          id: messageId,
        },
      }
    );
    return rowsAffected > 0; // Return true if the message was updated successfully
  } catch (error) {
    console.error("Error updating delivery status:", error);
    throw error;
  }
};
