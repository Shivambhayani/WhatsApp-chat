const express = require("express");
const {
  createGroup,
  addMemberToGroup,
  updateGroupDetails,
  deleteGroupWithMessages,
  removeUserFromGroups,
  promoteToAdmin,
  groupChats,
  getAll,
  deleteGroupMessage,
  editGroupMessages,
} = require("./controller");
const upload = require("../../middlewares/multer.js");
const { protected } = require("../../middlewares/auth.js");
const router = express.Router();

// create new group
router.use(protected);

router.post("/newGroup", upload.single("group_pic"), createGroup);
router.post("/removeUsers", removeUserFromGroups);
router.post("/addMember", addMemberToGroup);
router.post("/admin", promoteToAdmin);
router.post("/:id", upload.single("fileurl"), groupChats);

router.patch("/rename/:id", upload.single("group_pic"), updateGroupDetails);
router.patch("/:id", editGroupMessages);

router.delete("/:id", deleteGroupWithMessages);
router.delete("/message/:id", deleteGroupMessage);

router.get("/:id", getAll);

module.exports = router;
