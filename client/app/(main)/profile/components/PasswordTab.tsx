"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, X, AlertTriangle, Shield, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface PasswordTabProps {
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export function PasswordTab({ onUpdatePassword }: PasswordTabProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) {
      setPasswordStrength("weak")
      return
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const strength = (hasUpperCase ? 1 : 0) + (hasLowerCase ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecialChars ? 1 : 0)

    if (strength <= 2) setPasswordStrength("weak")
    else if (strength === 3) setPasswordStrength("medium")
    else setPasswordStrength("strong")
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value
    setNewPassword(newPass)
    if (newPass) checkPasswordStrength(newPass)
    else setPasswordStrength(null)
  }

  const handleUpdatePassword = async () => {
    setError("")
    setSuccessMessage("")

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (passwordStrength === "weak") {
      setError("Please choose a stronger password with uppercase, lowercase, numbers, and special characters")
      return
    }

    try {
      setIsUpdating(true)
      await onUpdatePassword(currentPassword, newPassword)
      // Reset form after successful update
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordStrength(null)
      setSuccessMessage("Your password has been updated successfully!")
    } catch (err) {
      setError("Failed to update password. Please check your current password and try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "strong":
        return "bg-blue-500"
      default:
        return "bg-gray-200"
    }
  }

  const getPasswordRequirements = () => {
    if (!newPassword) return null

    const requirements = [
      {
        label: "At least 8 characters",
        met: newPassword.length >= 8,
        icon: newPassword.length >= 8 ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />,
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(newPassword),
        icon: /[A-Z]/.test(newPassword) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />,
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(newPassword),
        icon: /[a-z]/.test(newPassword) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />,
      },
      {
        label: "Contains number",
        met: /\d/.test(newPassword),
        icon: /\d/.test(newPassword) ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />,
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        icon: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <X className="h-3.5 w-3.5" />
        ),
      },
    ]

    return (
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="text-xs font-medium text-blue-800 mb-2">Password Requirements:</h4>
        <ul className="space-y-1.5">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center gap-2 text-xs">
              <span
                className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${req.met ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-500"}`}
              >
                {req.icon}
              </span>
              <span className={req.met ? "text-blue-700" : "text-red-600"}>{req.label}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-blue-900">Security Settings</CardTitle>
            <CardDescription className="text-blue-600">
              Update your password to keep your account secure
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-blue-200 bg-blue-50">
            <Check className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-600">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-blue-700 font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="border-blue-200 focus-visible:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Separator className="bg-blue-100" />

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-blue-700 font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                className="border-blue-200 focus-visible:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {passwordStrength && (
              <div className="mt-3 space-y-1">
                <div className="text-xs flex justify-between">
                  <span className="text-blue-700">Password strength:</span>
                  <span
                    className={
                      passwordStrength === "weak"
                        ? "text-red-500 font-medium"
                        : passwordStrength === "medium"
                          ? "text-yellow-600 font-medium"
                          : "text-blue-600 font-medium"
                    }
                  >
                    {passwordStrength}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={{
                      width: passwordStrength === "weak" ? "33%" : passwordStrength === "medium" ? "66%" : "100%",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {getPasswordRequirements()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-blue-700 font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="border-blue-200 focus-visible:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> Passwords do not match
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Passwords match
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-blue-100 p-6">
        <Button
          onClick={handleUpdatePassword}
          disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
