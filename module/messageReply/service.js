const MessageReply = require("./model.js");

exports.create = async (data) => {
  return MessageReply.create(data);
};

exports.findOne = async (data) => {
  return MessageReply.findOne(data);
};

exports.findByPk = async (data) => {
  return MessageReply.findByPk(data);
};

exports.getAll = async (data) => {
  return MessageReply.findAll(data);
};

exports.findById = async (data) => {
  return MessageReply.findById(data);
};

exports.update = async (data, query) => {
  return MessageReply.update(data, query);
};

exports.destroy = async (data) => {
  return MessageReply.destroy(data);
};
