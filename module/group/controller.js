const service = require("./service.js");
const UserGroupService = require("../user_groups/service.js");
const UserService = require("../user/service.js");
const { uploadCloudinary } = require("../../utills/fileUpload.js");
const { v4: uuidv4 } = require("uuid");
const MessageService = require("../message/service.js");
const moment = require("moment");

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, userIds, adminId } = req.body;

    if (!name || !userIds || !Array.isArray(userIds) || !adminId) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid request data" });
    }

    // Check if there are at least two users
    if (userIds.length < 2) {
      return res.status(400).json({
        satuts: "fail",
        message: "Group must have at least two users",
      });
    }
    // Check if adminId exists in userIds
    if (!userIds.includes(adminId)) {
      return res.status(400).json({
        status: "fail",
        message: "Admin user must be included in userIds",
      });
    }

    // Generate a temporary entityId (e.g., UUID)
    const entityId = uuidv4();

    const imageLocalPath = req?.file?.path;
    // console.log(imageLocalPath);
    const image = await uploadCloudinary(imageLocalPath, "group", entityId);

    // console.log("image ==>", image);
    // create group
    const group = await service.create({
      name,
      description,
      group_pic: image?.url || "", // not complasary
    });

    //  loop users to add in groups

    // const userGroupPromises = userIds.map(async (userId) => {
    //   const role = userId === adminId ? 1 : 0;
    //   return UserGroupService.create({ groupId: group.id, userId, role });
    // });

    if (userIds && userIds.length > 0) {
      await Promise.all(
        userIds.map((userId) =>
          UserGroupService.create({
            userId,
            groupId: group.id,
            role: userId === adminId ? 1 : 0, // Assign admin role to specified user
          })
        )
      );
    }

    res.status(201).json({
      status: "success",
      message: "Group chat created successfully",
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

exports.addMemberToGroup = async (req, res, next) => {
  try {
    const { groupId, userIds } = req.body;
    const adminId = req.user.id; // for admin check
    if (!groupId || !userIds || !Array.isArray(userIds)) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid request data" });
    }

    // Fetch the existing group
    const [group, userGroup] = await Promise.all([
      service.findByPk(groupId),
      UserGroupService.findOne({
        where: { groupId, userId: adminId, role: 1 },
      }),
    ]);

    if (!group) {
      return res
        .status(404)
        .json({ status: "fail", message: "Group not found" });
    }
    if (!userGroup) {
      return res.status(403).json({
        status: "fail",
        message: "Only admin can add members to the group",
      });
    }
    // Add new members to the group in a single database call
    // Add new members to the group and fetch their names in parallel
    const [addedMembers] = await Promise.all([
      UserGroupService.bulkCreate(
        userIds.map((userId) => ({
          userId,
          groupId,
          role: 0,
        }))
      ),
      UserService.findAll({
        where: { id: userIds },
        attributes: ["name"],
      }),
    ]);
    const addedMemberNames = addedMembers.map(
      (member) => member.name || "Unknown user"
    );

    res.status(200).json({
      status: "success",
      message: `${addedMemberNames.join(", ")} has join!`,
    });
  } catch (error) {
    next(error);
  }
};

// add multiple admin
exports.promoteToAdmin = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;
    const adminId = req.user.id;

    if (!groupId || !userId) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid request data" });
    }

    const [group, userGroup] = await Promise.all([
      service.findByPk(groupId),
      UserGroupService.findOne({
        where: { groupId, userId: adminId },
        attributes: ["role"],
      }),
    ]);

    // Check if the user making the request is an admin of the group
    if (!userGroup || userGroup.role !== 1) {
      return res.status(403).json({
        status: "fail",
        message: "Only admin users can promote other users to admin",
      });
    }

    // Update the user's role to admin within the group
    await UserGroupService.update({ role: 1 }, { where: { groupId, userId } });
    res.status(200).json({
      status: "success",
      message: "User promoted to admin successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.renameGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Check if the user making the request is the admin of the group
    const userGroup = await UserGroupService.findOne({
      where: { groupId: req.params.id, userId, role: 1 },
    });

    if (!userGroup) {
      return res
        .status(403)
        .json({ status: "fail", message: "Only admin can rename the group" });
    }
    const renamed = await service.update(req.body, {
      where: { id: req.params.id },
    });

    res.status(203).json({
      status: "success",
      message: "group name updated successfully",
      data: renamed,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeUserFromGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;
    const adminId = req.user.id;
    // Check if the user making the request is the admin of the group
    const [admin, userGroup] = await Promise.all([
      UserService.findByPk(adminId, { attributes: ["name"] }),
      UserGroupService.findOne({
        where: { groupId, userId: adminId, role: 1 },
      }),
    ]);

    if (!userGroup) {
      return res.status(403).json({
        status: "fail",
        message: "Only admin can remove users from the group",
      });
    }
    // Check if the user to be removed is a member of the group
    const [removedUser] = await Promise.all([
      UserService.findByPk(userId, { attributes: ["name"] }),
      UserGroupService.destroy({ where: { groupId, userId } }),
    ]);

    if (!removedUser) {
      return res
        .status(404)
        .json({ status: "fail", message: "User is not a member of the group" });
    }
    // Remove the user from the group
    await UserGroupService.destroy({ where: { groupId, userId } });

    res.status(200).json({
      status: "success",
      message: `${removedUser.name} (${userId}) removed from the group by admin ${admin.name}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id.split(",").map((id) => parseInt(id));

    await service.destroy({ where: { id: groupId } });

    res.status(200).json({
      status: "success",
      message: "group deleted",
    });
  } catch (error) {
    next(error);
  }
};

// group chats

exports.groupChats = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const { conversation } = req.body;

    const isMember = await UserGroupService.findOne({
      where: { userId, groupId },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    const sentAt = moment.utc().tz("Asia/Kolkata").format("LLL");
    //create a message
    const message = await MessageService.create({
      conversation,
      senderId: userId,
      groupId,
      sent_At: sentAt,
    });

    return res.status(201).json({ status: "success", data: message });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const groupId = req.params.id;

    const messages = await MessageService.findAll({
      where: { groupId },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ status: "success", data: messages });
  } catch (error) {
    next(error);
  }
};
