import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { promises as fsPromises } from "fs"

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Function to upload files to Cloudinary
export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null // Ensure the file path is provided

    // Ensure the file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("File does not exist:", localFilePath)
      return null
    }

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect resource type (image, video, etc.)
    })

    console.log("File uploaded to Cloudinary:", response.secure_url) // Log the URL

    // Clean up the local file (asynchronous)
    await fsPromises.unlink(localFilePath)

    return {
      url: response.secure_url, 
      publicId: response.public_id, // Return the publicId for possible future deletions
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error) // Log any errors

    // Ensure cleanup of local file if upload fails (asynchronous)
    if (localFilePath && fs.existsSync(localFilePath)) {
      await fsPromises.unlink(localFilePath)
    }

    return null // Return null if the upload failed
  }
}

// Function to delete an image from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return false

    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return false
  }
}
