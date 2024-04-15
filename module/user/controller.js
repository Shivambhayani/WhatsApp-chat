const { generateToken, sendToken } = require("../../middlewares/auth.js");
const { uploadCloudinary } = require("../../utills/fileUpload.js");
const bcrypt = require("bcryptjs");
const service = require("./service.js");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

// neccesary data send
const senatizeUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    about: user.about,
    mobile: user.mobile,
  };
};

exports.signUp = async (req, res, next) => {
  try {
    // console.log(req);
    const { name, email, password, mobile, about } = req.body;
    const existingUser = await service.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "Email already exists!",
      });
    }
    console.log(req.file);
    if (!req.file) {
      throw new Error("Image file is missing");
    }

    // Generate a temporary entityId (e.g., UUID)
    const entityId = uuidv4();

    const imageLocalPath = req?.file?.path;
    console.log("localPath =>>", imageLocalPath);
    const image = await uploadCloudinary(imageLocalPath, "user", entityId);
    console.log("image ===>", image);
    if (!image) {
      return res.status(500).json({
        status: "fail",
        message: "Failed to upload image",
      });
    }

    // create User
    const user = await service.create({
      name,
      email,
      password,
      mobile,
      about,
      image: image?.url || "", // not complasary
    });
    const token = generateToken(user.id);
    const userWithoutSensitiveData = senatizeUser(user);
    sendToken(userWithoutSensitiveData, token, 201, res);
  } catch (error) {
    // return res.status(400).json({
    //   status: "fail",
    //   message: error.message,
    // });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await service.findOne({ where: { email } });

    if (!user || user.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "user not found!",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "Wrong password" });
    }

    const token = generateToken(user.id);
    if (!token || token.length === 0) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized!",
      });
    }

    const userWithoutSensitiveData = senatizeUser(user);
    sendToken(userWithoutSensitiveData, token, 200, res);
  } catch (error) {
    // return res.status(400).json({
    //   status: "fail",
    //   message: error.message,
    // });

    next(error);
  }
};

// query

exports.allUsers = async (req, res, next) => {
  try {
    const keyword = req.query.search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${req.query.search}%` } },
            { email: { [Op.iLike]: `%${req.query.search}%` } },
          ],
        }
      : {};
    const user = await service.findAll({
      where: {
        [Op.and]: [keyword, { id: { [Op.ne]: req.user.id } }],
      },
    });
    // .findAll({ id: { [Op.ne]: req.user.id } });
    if (user.length === 0) {
      return res.status(404).json({
        status: "fail",
        data: "No result found",
      });
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  // Clear the token cookie
  res.clearCookie("token");

  // Send a response indicating successful logout
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};
