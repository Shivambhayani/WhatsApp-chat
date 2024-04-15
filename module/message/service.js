const Message = require("./model.js");

exports.create = async (data) => {
  return Message.create(data);
};

exports.findOne = async (data) => {
  return Message.findOne(data);
};

exports.findByPk = async (data) => {
  return Message.findByPk(data);
};

exports.findAll = async (data) => {
  return Message.findAll(data);
};

exports.destroy = async (data) => {
  return Message.destroy(data);
};

exports.update = async (data, query) => {
  return await Message.update(data, query);
};
