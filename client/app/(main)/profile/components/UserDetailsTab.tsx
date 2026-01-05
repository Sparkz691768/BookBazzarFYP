"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Pencil, Save, X } from "lucide-react"
import { toast } from "react-toastify"

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserDetails {
  name: string
  email: string
  address: string
  contactNo: string
  profileImageUrl?: string   // fixed: was profileImagePath
}

interface UserDetailsTabProps {
  userDetails: UserDetails
  onSave: (details: UserDetails & { profileImage?: File }) => Promise<void>
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserDetailsTab({ userDetails, onSave }: UserDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedDetails, setEditedDetails] = useState<UserDetails>(userDetails)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    userDetails.profileImageUrl || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync if parent re-fetches user data
  useEffect(() => {
    setEditedDetails(userDetails)
    setImagePreview(userDetails.profileImageUrl || null)
  }, [userDetails])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setEditedDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB")
      return
    }

    // Just store the File object — backend handles the Cloudinary upload
    setSelectedFile(file)

    // Show a local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      // Pass the raw File to the parent — it builds FormData and calls the API
      await onSave({
        ...editedDetails,
        profileImage: selectedFile ?? undefined,
      })
      setIsEditing(false)
      setSelectedFile(null)
    } catch {
      // parent already shows the toast
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedDetails(userDetails)
    setImagePreview(userDetails.profileImageUrl || null)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    setIsEditing(false)
  }

  // Fallback avatar when no image is available
  const avatarFallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' fill='%23d1fae5'/%3E%3Ctext x='64' y='80' font-size='56' text-anchor='middle' fill='%23065f46' font-family='sans-serif'%3E${encodeURIComponent(userDetails.name.charAt(0).toUpperCase())}%3C/text%3E%3C/svg%3E`

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg border-b border-blue-100">
        <div>
          <CardTitle className="text-blue-900">Profile Information</CardTitle>
          <CardDescription className="text-blue-600">
            Manage your personal information and contact details
          </CardDescription>
        </div>

        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="border-blue-200 text-blue-700"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Profile image picker — only shown in edit mode */}
        {isEditing && (
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview || avatarFallback}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="max-w-xs"
            />
            <p className="text-xs text-blue-600">
              JPEG, PNG or WebP · max 5 MB
            </p>
          </div>
        )}

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Full Name</Label>
            {isEditing ? (
              <Input
                name="name"
                value={editedDetails.name}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <div className="mt-1 p-3 border rounded-md bg-blue-50/50">
                {userDetails.name}
              </div>
            )}
          </div>

          <div>
            <Label>Email</Label>
            {/* Email is never editable */}
            <div className="mt-1 p-3 border rounded-md bg-blue-50/50 text-blue-700">
              {userDetails.email}
            </div>
          </div>

          <div>
            <Label>Contact Number</Label>
            {isEditing ? (
              <Input
                name="contactNo"
                value={editedDetails.contactNo}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <div className="mt-1 p-3 border rounded-md bg-blue-50/50">
                {userDetails.contactNo || "Not provided"}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <Label>Address</Label>
            {isEditing ? (
              <Textarea
                name="address"
                value={editedDetails.address}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <div className="mt-1 p-3 border rounded-md bg-blue-50/50 min-h-[80px]">
                {userDetails.address || "No address provided"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}