const express = require("express");
const router = express.Router();

router.get("/check", (req, res) => {
  res.send("Health check");
  console.log("good");
});

router.use("/users", require("../module/user"));
router.use("/message", require("../module/message"));
router.use("/messageReplay", require("../module/messageReply"));
router.use("/group", require("../module/group"));
router.use("/groupchat", require("../module/user_groups"));
router.use("/file", require("../module/fileStroage"));

module.exports = router;
