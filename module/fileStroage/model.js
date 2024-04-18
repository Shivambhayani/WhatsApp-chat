const sequelize = require("../../config/db");
const Sequelize = require("sequelize");
const Message = require("../message/model");

const FileStore = sequelize.define(
  "FileStore",
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
    },

    filename: { type: Sequelize.STRING },
    type: { type: Sequelize.STRING }, //pdf,doc etc
    filesize: { type: Sequelize.STRING },
    fileurl: { type: Sequelize.STRING },
    sent_At: { type: Sequelize.DATE },
    seen_At: { type: Sequelize.DATE },
    delivered: { type: Sequelize.BOOLEAN },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = FileStore;
