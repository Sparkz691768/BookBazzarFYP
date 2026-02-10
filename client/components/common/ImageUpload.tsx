"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"

interface UserAvatarUploadProps {
  currentAvatar?: string
  name: string
  onFileChange: (file: File | null) => void
  error?: string
  isUploading?: boolean
}

export function ImageUpload({ currentAvatar, name, onFileChange, error, isUploading = false }: UserAvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Create a preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Pass the file to parent component
      onFileChange(file)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-24 w-24 border-4 border-background">
        <AvatarImage src={previewUrl || currentAvatar} alt={name} />
        <AvatarFallback className="text-2xl">{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="relative">
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <Label
          htmlFor="avatar"
          className={`flex items-center gap-1 cursor-pointer text-sm ${isUploading ? "text-muted-foreground" : "text-primary hover:underline"}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3" />
              Change Photo
            </>
          )}
        </Label>
        {error && <p className="text-xs text-destructive mt-1 text-center">{error}</p>}
      </div>
    </div>
  )
}
