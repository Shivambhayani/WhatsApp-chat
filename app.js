const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const app = express();
dotenv.config({
  path: "./.env",
});
const sequelize = require("./config/db.js");

const indexRouter = require("./routes");
const { execPath } = require("process");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(indexRouter);

app.use(async (err, req, res, next) => {
  console.log({ err });
  res.status(err.status || 500).json({
    status: "fail",
    message: err.message || "Unknown Error.",
    // stack: err.stack,
  });
});

// DB connection
sequelize
  // .sync()
  .authenticate()
  .then(() => console.log("DB Connection succesfully 🎉😎"))
  .catch((e) => console.log("Error in DB Connection 😌", e));

module.exports = app;
