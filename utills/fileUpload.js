const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploadCloudinary = async (localFilePath, profileType, entityId) => {
  try {
    if (!localFilePath || !profileType || !entityId) return null;

    let folderName;
    if (profileType === "user") {
      folderName = `user-profile-pics/${entityId}`;
    } else if (profileType === "group") {
      folderName = `group-profile-pics/${entityId}`;
    } else if (profileType === "files") {
      folderName = `files/${entityId}`;
    } else {
      throw new Error("Invalid profile type");
    }

    // Check if the folder exists, if not, create it
    // Create the folder if it doesn't exist
    await cloudinary.api.create_folder(folderName);

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName, // Folder name on Cloudinary
      public_id: entityId, // Using entityId as the public_id for easy retrieval
      allowedFormats: ["pdf", "jpg", "png", "gif", "mp4"],
      // transformation: [{ width: 150, height: 150, crop: "fill" }],
    });

    console.log(`file uploaded ${response.url}`);

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    fs.unlinkSync(localFilePath); // remove the locally saved  tempory file as the upload operations got failed

    return null;
  }
};
