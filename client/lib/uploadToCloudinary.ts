// Client-side Cloudinary upload helper

export async function uploadToCloudinary(file: File) {
    try {
      // Create the form data for Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset")
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "")
  
      // Upload directly to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      )
  
      if (!response.ok) {
        throw new Error("Failed to upload image to Cloudinary")
      }
  
      const data = await response.json()
  
      // Return the secure URL and public_id
      return {
        url: data.secure_url,
        publicId: data.public_id,
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      throw error
    }
  }
  