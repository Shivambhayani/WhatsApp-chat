const express = require("express");
const { createdMessageReplay } = require("./controller");
const router = express.Router();
// const MessageReply = require("./model");
const { protected } = require("../../middlewares/auth");

router.use(protected);
router.post("/replys", createdMessageReplay);
module.exports = router;
