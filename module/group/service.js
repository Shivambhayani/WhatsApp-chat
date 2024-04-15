const Group = require("./model");

exports.create = async (data) => {
  return Group.create(data);
};

exports.findAll = async (data) => {
  return Group.findAll(data);
};

exports.findOne = async (data) => {
  return Group.findOne(data);
};

exports.destroy = async (data) => {
  return Group.destroy(data);
};

exports.update = async (data, query) => {
  return await Group.update(data, query);
};

exports.findByPk = async (data) => {
  return Group.findByPk(data);
};
