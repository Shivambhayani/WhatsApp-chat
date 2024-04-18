const express = require("express");
const {
  createdMessageReplay,
  editMessageReplies,
  deleteMessageReplies,
} = require("./controller");
const router = express.Router();
// const MessageReply = require("./model");
const { protected } = require("../../middlewares/auth");

router.use(protected);

router.post("/replys", createdMessageReplay);
router.patch("/:id", editMessageReplies);
router.delete("/:id", deleteMessageReplies);
module.exports = router;
