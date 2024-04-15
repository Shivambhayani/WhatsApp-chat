const sequelize = require("../../config/db.js");
const Sequelize = require("sequelize");
const User = require("../user/model.js");
const Message = require("../message/model.js");

const MessageReply = sequelize.define(
  "MessageReplys",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    messageId: {
      type: Sequelize.BIGINT,
      references: {
        model: "Messages",
        key: "id",
      },
      onDelete: "CASCADE", // Delete replies when the referenced message is deleted
    },
    conversation: {
      type: Sequelize.STRING(1023),
      validate: {
        len: {
          args: [0, 1023],
          msg: "conversion cannot exceed 1000 characters",
        },
      },
    },
    senderId: {
      type: Sequelize.BIGINT,
      references: {
        model: "Users",
        key: "id",
      },
    },
    receiverId: {
      type: Sequelize.BIGINT,
      references: {
        model: "Users",
        key: "id",
      },
    },
    groupId: {
      type: Sequelize.BIGINT,
      references: {
        model: "Groups",
        key: "id",
      },
    },
    sent_At: { type: Sequelize.DATE },
    seen_At: { type: Sequelize.DATE },
    delivred: { type: Sequelize.BOOLEAN },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  }
);
Message.hasMany(MessageReply, { foreignKey: "messageId" });
MessageReply.belongsTo(Message, { foreignKey: "messageId" });

// MessageReply.belongsTo(Message, { foreignKey: "messageId" }); // A reply belongs to a message
// MessageReply.belongsTo(User, { as: "sender", foreignKey: "senderId" });
// MessageReply.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
// MessageReply.sync();
module.exports = MessageReply;
