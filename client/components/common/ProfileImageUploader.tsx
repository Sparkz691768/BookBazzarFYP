"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { getUserId } from "@/lib/auth"
import { ImageUpload } from "./ImageUpload"

interface ProfileImageUploaderProps {
  currentImage?: string
  userName: string
  onImageUpdated: (newImagePath: string) => void
}

export function ProfileImageUploader({ currentImage, userName, onImageUpdated }: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    try {
      setIsUploading(true)
      setError(undefined)

      // First upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const { url, publicId } = await uploadResponse.json()

      // Then update the user profile with the new image URL
      const userId = getUserId()

      const profileFormData = new FormData()
      profileFormData.append("Name", userName)
      profileFormData.append("Address", "") // Send empty value as shown in the API example
      profileFormData.append("ContactNo", "") // Send empty value as shown in the API example
      profileFormData.append("ProfileImage", url) // Send the Cloudinary URL instead of the file

      const response = await axios.put(`https://localhost:7265/update-profile/${userId}`, profileFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "*/*",
        },
      })

      // Update the UI with the new image
      onImageUpdated(url)
      toast.success("Profile picture updated successfully")
    } catch (error) {
      console.error("Error updating profile picture:", error)
      setError(error instanceof Error ? error.message : "Failed to update profile picture")
      toast.error(error instanceof Error ? error.message : "Failed to update profile picture")
    } finally {
      setIsUploading(false)
    }
  }

  return <ImageUpload currentAvatar={currentImage} name={userName} onFileChange={handleFileChange} error={error} />
}
