const express = require("express");
const router = express.Router();
const { signUp, login, logout, allUsers } = require("./controller.js");
const upload = require("../../middlewares/multer.js");
const { protected } = require("../../middlewares/auth.js");

// router.get("/", "check !!");
router.post("/signUp", upload.single("image"), signUp);

router.post("/login", login);

router.use(protected);
router.post("/logout", logout);
router.get("/All", allUsers);
module.exports = router;
