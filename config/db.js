const Sequelize = require("sequelize");
const dotenv = require("dotenv");
const cls = require("cls-hooked");
const { cl } = require("../utills/service");
dotenv.config({
  path: "../.env",
});
const env = process.env.NODE_ENV || "development";
// console.log(env);
const config = require("./config")[env];
cl("config----->", config);

const namespace = cls.createNamespace("chatapp-namespace");
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

module.exports = sequelize;
