const express = require("express");
const {
  createGroup,
  addMemberToGroup,
  renameGroup,
  deleteGroup,
  removeUserFromGroup,
  promoteToAdmin,
  groupChats,
  getAll,
} = require("./controller");
const upload = require("../../middlewares/multer.js");
const { protected } = require("../../middlewares/auth.js");
const router = express.Router();

// create new group
router.use(protected);

router.post("/newGroup", upload.single("group_pic"), createGroup);
router.post("/addMember", addMemberToGroup);
router.post("/:id", groupChats);
router.post("/admin", promoteToAdmin);
router.post("/removeUser", removeUserFromGroup);
router.patch("/rename/:id", renameGroup);
router.delete("/:id", deleteGroup);

// get messages
router.get("/:id", getAll);
module.exports = router;
