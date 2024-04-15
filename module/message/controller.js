const service = require("./service.js");
const User = require("../user/model.js");
const userService = require("../user/service.js");
const { Op } = require("sequelize");
const MessageReply = require("../messageReply/model.js");

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversation, receiverId } = req.body;
    // if (!receiverId) {
    //   return res
    //     .status(404)
    //     .json({ status: "fail", message: "ReceiverId required" });
    // }
    // Check if the receiver exists
    const receiver = await userService.findOne({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let existingMessages = await service.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: req.user.id },
        ],
      },
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
      senderId: req.user.id, // Assuming sender is the authenticated user
      receiverId,
      sent_At: new Date(),
      delivred: true,
    });
    res
      .status(201)
      .json({ status: "success", data: { message, existingMessages } });
  } catch (error) {
    next(error);
  }
};

exports.recivedMessage = async (req, res, next) => {
  try {
    const message = await service.findAll({
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
          ],
          order: [["createdAt", "DESC"]],
        },
      ],

      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "conversation",
        // "senderId",
        // "receiverId",
        // "groupId",
        "sent_At",
        "seen_At",
        "delivred",
      ],
    });

    res.status(200).json({ status: "success", data: message });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id.split(",").map((id) => parseInt(id));

    await service.destroy({ where: { id: messageId } });
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
    const { messageId } = req.params;
    const message = await service.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    // const { conversation } = req.body;

    // const message = await service.findByPk(messageId);
    // // Check if the message exists
    // if (!message) {
    //   return res
    //     .status(404)
    //     .json({ status: "fail", message: "Message not found" });
    // }
    // message.conversation = conversation;

    // await message.save();
    res.status(203).json({
      status: "success",
      message: "Message updated successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
