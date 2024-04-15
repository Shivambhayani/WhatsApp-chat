const service = require("./service.js");
const { uploadCloudinary } = require("../../utills/fileUpload.js");

exports.uploadFilec = async (req, res, next) => {
  try {
    const { messageId } = req.body;

    // Upload file to Cloudinary
    const cloudinaryResponse = await uploadCloudinary(
      req.file.path,
      "files",
      messageId
    );

    if (!cloudinaryResponse) {
      throw new Error("Failed to upload file to Cloudinary");
    }

    const file = await service.create({
      messageId: messageId,
      filename: req.file.originalname,
      type: req.file.mimetype,
      filesize: req.file.size,
      fileurl: cloudinaryResponse.url,
      sent_At: new Date(),
      delivered: false,
    });

    res.status(201).json({ status: "success", data: file });
  } catch (error) {
    next(error);
  }
};
