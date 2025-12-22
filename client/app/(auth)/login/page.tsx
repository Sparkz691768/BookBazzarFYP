"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Book, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Fixed request data to match API requirements
      const requestData = {
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe,
      }

      const response = await axios.post("https://localhost:7265/api/IdentityApi/login", requestData, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
      })

      // Extract token and user data from response
      const { token, userId, roles } = response.data

      // Show success toast
      toast.success("Login successful!")

      // Store token in localStorage
      localStorage.setItem("token", token)
      localStorage.setItem("userId", userId)

      // Store roles as a string if it's an array
      if (Array.isArray(roles)) {
        localStorage.setItem("roles", JSON.stringify(roles))
      } else {
        localStorage.setItem("roles", roles)
      }

      // Redirect based on role
      if (Array.isArray(roles) && roles.includes("Admin")) {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle different error formats
        let errorMessage = "Login failed. Please check your credentials and try again."

        // Check for specific error formats
        const responseData = error.response?.data

        if (responseData) {
          if (responseData.message) {
            errorMessage = responseData.message
          } else if (responseData[""] && Array.isArray(responseData[""])) {
            errorMessage = responseData[""][0]
          } else if (typeof responseData === "string") {
            errorMessage = responseData
          }
        }

        setErrors({ form: errorMessage })
        toast.error(errorMessage)
        console.error("Login error:", error.response?.data)
      } else {
        const errorMsg = "An unexpected error occurred"
        setErrors({ form: errorMsg })
        toast.error(errorMsg)
        console.error("Login error:", error)
      }
    } finally {
      setIsLoading(false)
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

      <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="relative w-full h-[500px]">
            <Image
              src="https://cdn.firstcry.com/education/2022/03/07110617/700225975.jpg"
              alt="Library illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold">Welcome back to LibraryHub</h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to continue your reading journey and access your personalized library experience.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your LibraryHub account</p>
          </div>

          {errors.form && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
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
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                Google
              </Button>
              <Button variant="outline" type="button" disabled={isLoading} className="w-full">
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
