const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getAllMessage,
  deleteMessage,
  editmesseges,
} = require("./controller");
const { protected } = require("../../middlewares/auth");
const upload = require("../../middlewares/multer.js");

router.use(protected);

router.post("/sendMessage", upload.single("fileurl"), sendMessage);
router.patch("/:id", editmesseges);
router.get("/getAll", getAllMessage);
router.delete("/:id", deleteMessage);

module.exports = router;
