const express = require("express");
const router = express.Router();

router.use("/api/v1", require("./v1.js"));

// router.get("/api/v1", (req, res) => {
//   console.log("Health check");
//   res.status(200).json({ status: "Health check" });
// });

module.exports = router;
