const sequelize = require("../../config/db.js");

const Sequelize = require("sequelize");
const User = require("../user/model.js");
const Group = require("../group/model.js");
const UserGroup = sequelize.define(
  "UserGroup",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    groupId: {
      type: Sequelize.BIGINT,
      references: {
        model: "Groups",
        key: "id",
      },
    },
    userId: {
      type: Sequelize.BIGINT,
      references: {
        model: "Users",
        key: "id",
      },
    },
    role: { type: Sequelize.INTEGER }, // for admin or not,
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true, // Allow null to enable soft delete
    },
  },
  {
    paranoid: true,
  }
);
UserGroup.belongsTo(User, { foreignKey: "userId" }); // A user can belong to many groups (through UserGroup)
UserGroup.belongsTo(Group, { foreignKey: "groupId" }); // A group can have many users (through UserGroup)

module.exports = UserGroup;
