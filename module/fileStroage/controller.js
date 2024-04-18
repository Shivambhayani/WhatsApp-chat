const service = require("./service.js");
const {
  uploadCloudinary,
  deleteFileFromCloudinary,
} = require("../../utills/fileUpload.js");
const { v4: uuidv4 } = require("uuid");
const { formatFileSize } = require("../../utills/constant.js");

// tetsting function
exports.uploadFilec = async (req, res, next) => {
  try {
    const { messageId } = req.body;
    const imageLocalPath = req?.file?.path;
    console.log("localPath =>>", imageLocalPath);
    const entityId = uuidv4();
    // Upload file to Cloudinary
    const cloudinaryResponse = await uploadCloudinary(
      imageLocalPath,
      "files",
      entityId
    );
    console.log(cloudinaryResponse);

    if (!cloudinaryResponse) {
      throw new Error("Failed to upload file to Cloudinary");
    }

    const fileSize = formatFileSize(req.file.size);

    const file = await service.create({
      messageId: messageId,
      filename: req.file.originalname,
      type: req.file.mimetype,
      filesize: fileSize,
      fileurl: cloudinaryResponse.url,
      sent_At: new Date(),
      delivered: true,
    });

    res.status(201).json({ status: "success", data: file });
  } catch (error) {
    next(error);
  }
};

// this function for uploading files this function can used  one to one chat or group chat
exports.uploadFileToCloudinary = async (req, message) => {
  if (!req.file) {
    throw new Error("No file provided");
  }

  const imageLocalPath = req.file.path;
  // console.log("localPath =>>", imageLocalPath);
  const entityId = uuidv4();

  // Upload file to Cloudinary
  const cloudinaryResponse = await uploadCloudinary(
    imageLocalPath,
    "files",
    entityId
  );

  if (!cloudinaryResponse) {
    throw new Error("Failed to upload file to Cloudinary");
  }

  const fileSize = formatFileSize(req.file.size);
  // Process file upload
  const fileData = {
    messageId: message.id,
    filename: req.file.originalname,
    type: req.file.mimetype,
    filesize: fileSize,
    fileurl: cloudinaryResponse.url,
    sent_At: new Date(),
    delivered: true,
  };

  // Save file information to database
  await service.create(fileData);
};

//  Delete file

exports.deleteFiles = async (req, res, next) => {
  try {
    // Find the file to delete from the database
    const fileToDelete = await service.findOne({
      where: { id: req.params.id },
    });

    if (!fileToDelete) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    // Delete the file from Cloudinary
    await deleteFileFromCloudinary(fileToDelete.fileurl);

    await service.destroy({
      where: { id: req.params.id },
    });

    res.status(200).json({
      status: "success",
      message: "file Deleted!",
      data: fileToDelete,
    });
  } catch (error) {
    next(error);
  }
};
