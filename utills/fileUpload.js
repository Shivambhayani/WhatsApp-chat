const fs = require("fs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploadCloudinary = async (localFilePath, profileType, entityId) => {
  try {
    if (!localFilePath || !profileType) return null;

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

    // Create the folder if it doesn't exist
    await cloudinary.api.create_folder(folderName);

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName, // Folder
      resource_type: "auto",
    });

    // console.log(`file uploaded ${response.url}`);

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    fs.unlinkSync(localFilePath); // remove the locally saved  tempory file as the upload operations got failed

    return null;
  }
};

exports.deleteFileFromCloudinary = async (fileUrl) => {
  try {
    // Extract the public ID from the file URL
    const publicId = extractPublicId(fileUrl);

    // Delete the file from Cloudinary using its public ID
    const deletionResponse = await cloudinary.uploader.destroy(publicId);

    // Return the deletion response
    return deletionResponse;
  } catch (error) {
    // Handle errors
    console.error("Error deleting file from Cloudinary:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};

const extractPublicId = (fileUrl) => {
  // Extract the public ID from the Cloudinary file URL
  const publicId = fileUrl.split("/").pop().split("/").pop().split(".")[0];
  return publicId;
};
