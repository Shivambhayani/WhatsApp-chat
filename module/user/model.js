const bcrypt = require("bcryptjs");
const sequelize = require("../../config/db");
const Sequelize = require("sequelize");
const { mobileValidationRegex } = require("../../utills/constant.js");
const MessageReply = require("../messageReply/model.js");
const Message = require("../message/model.js");
const Group = require("../group/model.js");

const User = sequelize.define(
  "User",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,

      set(value = "") {
        if (value.length === 0) {
          throw new Error("name must be required");
        }
        this.setDataValue("name", value);
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,

      set(value) {
        if (
          !/^[\w-\.]+\+?[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value.trim())
        ) {
          throw new Error("Provide a valide email address !");
        }
        this.setDataValue("email", value);
      },
    },
    mobile: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        validator: function (val) {
          if (!mobileValidationRegex.test(val)) {
            throw new Error("Invalid mobile number format");
          } else if (val.length !== 10) {
            throw new Error("Mobile number must be 10 digits");
          }
        },
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,

      set(value) {
        if (value.length > 6) {
          const hash = bcrypt.hashSync(value, 10);
          this.setDataValue("password", hash);
        } else {
          throw new Error("Password must be more than 6 letter");
        }
      },
    },
    about: { type: Sequelize.STRING },

    image: {
      type: Sequelize.STRING,
    },
    is_online: {
      type: Sequelize.STRING,
      defaultValue: "0", // check onlie or offile status
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true, // Allow null to enable soft delete
    },
  },
  {
    paranoid: true, // enable soft deletion
  }
);

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" }); // A user can send many messages
Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });

User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" }); // A user can receive many messages
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

User.belongsToMany(Group, {
  through: "usergroups",
  foreignKey: "userId",
  as: "groups",
});
MessageReply.belongsTo(User, { as: "sender", foreignKey: "senderId" });
MessageReply.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
Group.belongsToMany(User, { through: "usergroups" });

// User.sync();
module.exports = User;
