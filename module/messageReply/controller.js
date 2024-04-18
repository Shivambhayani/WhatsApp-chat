const service = require("./service.js");
const userGroupService = require("../user_groups/service.js");
const { Op } = require("sequelize");

// whatsApp nested message reply like
exports.createdMessageReplay = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { messageId, conversation, replyToId, groupId, receiverId } =
      req.body;

    let replyToIdValue = null;
    let receiverIds = []; // Initialize receiverIds as an empty array

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

    // If groupId is provided, fetch receiverIds from group members
    if (groupId) {
      const groupMembers = await userGroupService.findAll({
        where: { groupId },
        attributes: ["userId"],
      });
      receiverIds = groupMembers.map((member) => member.userId);
    } else {
      // If it's a one-to-one chat, include the provided receiverId
      if (!receiverId) {
        return res
          .status(400)
          .json({ error: "Receiver ID is required for one-to-one messages" });
      }
      receiverIds.push(receiverId);
    }

    const messageReplyData = {
      messageId,
      conversation,
      senderId,
      // Include replyToId if provided
      ...(replyToId && { replyToId: replyToIdValue }),
      // Include groupId if provided
      ...(groupId && { groupId }),
      // Include receiverIds if it's a group chat
      ...(groupId && { receiverIds }),
      // Include receiverId if it's a one-to-one chat
      ...(receiverId && { receiverId }),
      sent_At: new Date(),
      delivred: true,
    };

    const messageReply = await service.create(messageReplyData);

    res.status(201).json({ status: "success", data: messageReply });
  } catch (error) {
    next(error);
  }
};

// message whrerclause function' same logic so create function
const getMessageReplyWhereCaluse = async (messageReplyId, userId, service) => {
  const messageReply = await service.findOne({
    where: {
      id: messageReplyId,
      groupId: { [Op.not]: null }, // Check if groupId is not null (i.e., if it exists)
    },
  });

  let whereClause = {
    id: messageReplyId,
    senderId: userId,
    groupId: null,
  };

  // If the associated message belongs to a group chat, update as a group chat
  if (messageReply) {
    whereClause = {
      id: messageReplyId,
      senderId: userId,
      groupId: messageReply.groupId,
    };
  }

  return whereClause;
};

exports.editMessageReplies = async (req, res, next) => {
  try {
    const messageReplyId = req.params.id;
    console.log(messageReplyId);

    // Check if the associated message belongs to a group chat

    const whereClause = await getMessageReplyWhereCaluse(
      messageReplyId,
      req.user.id,
      service
    );

    const [updatedRowsCount, updatedMessageReplies] = await service.update(
      req.body,
      {
        where: whereClause,
        returning: true,
      }
    );

    // If no rows were affected by the update, return error
    if (updatedRowsCount === 0) {
      return res.status(403).json({
        status: "fail",
        error: "You are not authorized to edit these message replies",
      });
    }

    // If the message replies were updated successfully, return success response
    return res.status(203).json({
      status: "success",
      message: "Message replies updated successfully",
      data: updatedMessageReplies, // Return all updated message replies
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessageReplies = async (req, res, next) => {
  try {
    const messageReplyId = req.params.id;

    // Construct whereClause using the function
    const whereClause = await getMessageReplyWhereCaluse(
      messageReplyId,
      req.user.id,
      service
    );

    const deletedRowsCount = await service.destroy({
      where: whereClause,
    });

    // If no rows were affected by the delete operation, return error
    if (deletedRowsCount === 0) {
      return res.status(403).json({
        status: "fail",
        error: "You are not authorized to delete this message reply",
      });
    }

    // If the message reply was deleted successfully, return success response
    return res.status(203).json({
      status: "success",
      message: " deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
