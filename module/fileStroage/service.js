const fileStroage = require("./model.js");

exports.create = async (data) => {
  return fileStroage.create(data);
};

exports.findAll = async (data) => {
  return fileStroage.findAll(data);
};

exports.findOne = async (data) => {
  return fileStroage.findOne(data);
};

exports.destroy = async (data) => {
  return fileStroage.destroy(data);
};

exports.findByPk = async (data) => {
  return fileStroage.findByPk(data);
};
