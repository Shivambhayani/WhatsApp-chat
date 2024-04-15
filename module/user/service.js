const User = require("./model.js");

exports.create = async (data) => {
  return User.create(data);
};

exports.findOne = async (data) => {
  return User.findOne(data);
};

exports.findAll = async (data) => {
  return User.findAll(data);
};

exports.findByPk = async (data) => {
  return User.findByPk(data);
};
