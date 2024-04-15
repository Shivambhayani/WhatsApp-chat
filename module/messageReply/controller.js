const service = require("./service.js");

exports.createdMessageReplay = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { messageId, conversation, receiverId, replyToId } = req.body;

    // Check if replyToId is provided
    if (replyToId) {
      // Check if the message reply to which you want to reply exists
      const parentMessageReply = await service.findByPk(replyToId);
      if (!parentMessageReply) {
        return res
          .status(404)
          .json({ error: "Parent message reply not found" });
      }
      replyToIdValue = parentMessageReply.id;
    }

    const messageReply = await service.create({
      messageId,
      conversation,
      senderId,
      receiverId,
      replyToId: replyToIdValue,
      groupId: null,
      sent_At: new Date(),
      delivred: true,
    });

    res.status(201).json({ status: "success", data: messageReply });
  } catch (error) {
    next(error);
  }
};
