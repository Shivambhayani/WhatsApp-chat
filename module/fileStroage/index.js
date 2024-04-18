const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/multer.js");
const { uploadFilec, deleteFiles } = require("./controller.js");

router.post("/upload", upload.single("fileurl"), uploadFilec);
router.delete("/:id", deleteFiles);

module.exports = router;
