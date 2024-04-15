const sequelize = require("../../config/db.js");
const Sequelize = require("sequelize");

const Group = sequelize.define(
  "Group",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    group_pic: { type: Sequelize.STRING },

    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Group;
