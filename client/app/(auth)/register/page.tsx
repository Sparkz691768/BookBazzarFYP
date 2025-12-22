"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Book, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { EmailConfirmationDialog } from "@/components/common/EmailConfirmationDialog" 
import axios from "axios"

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
    Address: "",
    ContactNo: "",
    ProfileImage: null as File | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData((prev) => ({ ...prev, ProfileImage: file }))
      setImagePreview(URL.createObjectURL(file))

      // Clear any previous errors
      if (errors.ProfileImage) {
        const newErrors = { ...errors }
        delete newErrors.ProfileImage
        setErrors(newErrors)
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.FullName.trim()) newErrors.FullName = "Full Name is required"
    if (!formData.Email.trim()) {
      newErrors.Email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Email is invalid"
    }

    if (!formData.Address.trim()) newErrors.Address = "Address is required"

    if (!formData.ContactNo.trim()) {
      newErrors.ContactNo = "Contact number is required"
    } else if (!/^\d{10}$/.test(formData.ContactNo)) {
      newErrors.ContactNo = "Please enter a valid 10-digit contact number"
    }

    if (!formData.Password) {
      newErrors.Password = "Password is required"
    } else if (formData.Password.length < 8) {
      newErrors.Password = "Password must be at least 8 characters"
    }

    if (formData.Password !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = "Passwords do not match"
    }

    if (!acceptTerms) newErrors.terms = "You must accept the terms and conditions"

    // Show validation errors as toasts
    if (Object.keys(newErrors).length > 0) {
      // Show only the first error as a toast
      const firstError = Object.values(newErrors)[0]
      toast.error(firstError)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Create FormData object for multipart/form-data
      const formDataObj = new FormData()
      formDataObj.append("FullName", formData.FullName)
      formDataObj.append("Email", formData.Email)
      formDataObj.append("Password", formData.Password)
      formDataObj.append("ConfirmPassword", formData.ConfirmPassword)
      formDataObj.append("Address", formData.Address)
      formDataObj.append("ContactNo", formData.ContactNo)

      // Add profile image if selected
      if (formData.ProfileImage) {
        formDataObj.append("ProfileImage", formData.ProfileImage)
      }

      const response = await axios.post("https://localhost:7265/api/IdentityApi/register", formDataObj, {
        headers: {
          accept: "*/*",
          // Don't set Content-Type here, axios will set it correctly with boundary for multipart/form-data
        },
      })

      // Show success toast
      toast.success("Registration successful! Please check your email to verify your account.")

      // Show email confirmation dialog
      setShowConfirmationDialog(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle the specific error format where there's an empty string key with array of errors
        const responseData = error.response?.data
        let errorMessage = "Registration failed. Please try again."

        // Check if the error has the format {"": ["Error message"]}
        if (responseData && responseData[""] && Array.isArray(responseData[""])) {
          errorMessage = responseData[""][0]
        } else if (responseData?.message) {
          errorMessage = responseData.message
        }

        setErrors({ form: errorMessage })
        toast.error(errorMessage)
        console.error("Registration error:", error.response?.data)
      } else {
        const errorMsg = "An unexpected error occurred"
        setErrors({ form: errorMsg })
        toast.error(errorMsg)
        console.error("Registration error:", error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    try {
      // Implement resend email functionality
      await axios.post(
        "https://localhost:7265/api/IdentityApi/resend-confirmation-email",
        {
          email: formData.Email,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
        },
      )
      return Promise.resolve()
    } catch (error) {
      console.error("Error resending confirmation email:", error)
      return Promise.reject(error)
    }
  }

  return (
    <div className="container flex min-h-screen">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Email Confirmation Dialog */}
      <EmailConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        email={formData.Email}
        onResendEmail={handleResendEmail}
      />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="relative w-full h-[500px]">
            <Image
              src="https://cdn.firstcry.com/education/2022/03/07110617/700225975.jpg"
              alt="Reading illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold mt-8">Discover a world of knowledge</h2>
          <p className="mt-2 text-muted-foreground">
            Join LibraryHub and get access to thousands of books, events, and a community of book lovers.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground mt-2">Join LibraryHub and start your reading journey</p>
          </div>

          {errors.form && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Form fields remain the same */}
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="FullName">Full Name</Label>
              <Input
                id="FullName"
                name="FullName"
                placeholder="Enter your full name"
                value={formData.FullName}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.FullName ? "border-destructive" : ""}
              />
              {errors.FullName && <p className="text-sm text-destructive">{errors.FullName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="Email">Email</Label>
              <Input
                id="Email"
                name="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.Email}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.Email ? "border-destructive" : ""}
              />
              {errors.Email && <p className="text-sm text-destructive">{errors.Email}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="Address">Address</Label>
              <Input
                id="Address"
                name="Address"
                placeholder="Your address"
                value={formData.Address}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.Address ? "border-destructive" : ""}
              />
              {errors.Address && <p className="text-sm text-destructive">{errors.Address}</p>}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="ContactNo">Contact Number</Label>
              <Input
                id="ContactNo"
                name="ContactNo"
                type="tel"
                placeholder="98XXXXXXXX"
                value={formData.ContactNo}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.ContactNo ? "border-destructive" : ""}
              />
              {errors.ContactNo && <p className="text-sm text-destructive">{errors.ContactNo}</p>}
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <div className="grid gap-4">
                <Input
                  id="profileImage"
                  name="ProfileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={errors.ProfileImage ? "border-destructive" : ""}
                />
                {imagePreview && (
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              {errors.ProfileImage && <p className="text-sm text-destructive">{errors.ProfileImage}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="Password">Password</Label>
              <div className="relative">
                <Input
                  id="Password"
                  name="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.Password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.Password ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.Password && <p className="text-sm text-destructive">{errors.Password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="ConfirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="ConfirmPassword"
                  name="ConfirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.ConfirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.ConfirmPassword ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.ConfirmPassword && <p className="text-sm text-destructive">{errors.ConfirmPassword}</p>}
            </div>

            {/* Terms and Submit */}
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(!!checked)} />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="#" className="underline">
                  terms and conditions
                </Link>
              </Label>
            </div>
            {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
