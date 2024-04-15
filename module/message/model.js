const sequelize = require("../../config/db.js");
const Sequelize = require("sequelize");
const User = require("../user/model.js");
const Group = require("../group/model.js");
const FileStore = require("../fileStroage/model.js");
const MessageReply = require("../messageReply/model.js");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    conversation: {
      type: Sequelize.STRING(1023),
      validate: {
        len: {
          args: [0, 1023], // Allow up to 1000 characters
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

Message.hasMany(FileStore, { foreignKey: "messageId" }); // A message can have many attachments
FileStore.belongsTo(Message, { foreignKey: "messageId" });

// Message.belongsTo(User, { as: "sender", foreignKey: "senderId" }); // A message belongs to a sender (user)

// Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" }); // A message can have a receiver (user) (optional for private messages)

Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" }); // A message can belong to a group

// Message.sync();

module.exports = Message;
