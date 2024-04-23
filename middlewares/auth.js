const jwt = require("jsonwebtoken");
const userService = require("../module/user/service.js");

exports.generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    // console.log("decoded ==>", decoded);
    return decoded.id;
  } catch (err) {
    console.log("verify token error", err);
    return null;
  }
}

exports.authenticateSocket = async (data) => {
  try {
    let token;
    if (data.authorization?.startsWith("Bearer")) {
      token = data.authorization?.split(" ")[1];
      // console.log("join ==>", token);
    }
    // console.log(token);
    const userId = verifyToken(token);
    // console.log("UserId ==>", userId);
    if (!userId) {
      console.error("Socket authentication failed: Invalid token");

      return;
    }
    // Attach user ID to the socket object for later use
    // const user = await userService.findOne({ where: { id: userId.id } });
    data.userId = userId;
    return userId;
  } catch (error) {
    console.log("error", error);
  }
};

exports.sendToken = (user, token, statusCode, res) => {
  res.status(statusCode).json({
    status: "success",
    tokens: { token },
    data: {
      user,
    },
  });
};

exports.protected = async (req, res, next) => {
  try {
    const authorizationHeader = req.header("Authorization");
    if (!authorizationHeader) {
      return res
        .status(402)
        .json({ status: "fail", message: "No token provided!" });
    }
    const token = authorizationHeader.replace("Bearer", "").trim();
    // console.log(token);
    if (!token) {
      return res
        .status(402)
        .json({ status: "fail", message: "Invalid token provided!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    // console.log(decoded);

    const user = await userService.findOne({ where: { id: decoded.id } });

    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(402).json({ status: "fail", message: "Invalid token" });
    } else if (err.name === "TokenExpiredError") {
      return res.status(401).json({ status: "fail", message: "Token expired" });
    }
    console.error("Error verifying token:", err);
    next(err);
  }
};
