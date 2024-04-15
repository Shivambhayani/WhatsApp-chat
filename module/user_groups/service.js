const UserGroup = require("./model.js");

exports.create = async (data) => {
  return UserGroup.create(data);
};

exports.findOne = async (data) => {
  return UserGroup.findOne(data);
};

exports.destroy = async (data) => {
  return UserGroup.destroy(data);
};

exports.bulkCreate = async (data) => {
  return UserGroup.bulkCreate(data);
};
exports.update = async (data, query) => {
  return await UserGroup.update(data, query);
};
