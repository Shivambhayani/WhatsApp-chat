const express = require("express");
const router = express.Router();
const {
  sendMessage,
  recivedMessage,
  deleteMessage,
  editmesseges,
} = require("./controller");
const { protected } = require("../../middlewares/auth");

router.use(protected);

router.post("/sendMessage", sendMessage);
router.get("/getAll", recivedMessage);
router.delete("/:id", deleteMessage);
router.patch("/:id", editmesseges);
// groups
// router.post("/groups", createGroupChat);
// rename group name
// router.patch("/renameGroup",renameGroup)
// group add
// router.patch("/groupAdd",AddGroupMember)
// group remove
// router.patch('/removeFromgroup,removeFromGroup)
module.exports = router;
