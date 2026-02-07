"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const confirmEmail = async () => {
      const userId = searchParams.get("userId")
      const token = searchParams.get("token")

      if (!userId || !token) {
        setStatus("error")
        setMessage("Invalid confirmation link. Missing required parameters.")
        return
      }

      try {
        const response = await axios.get(
          `https://localhost:7265/api/IdentityApi/confirm-email?userId=${encodeURIComponent(
            userId,
          )}&token=${encodeURIComponent(token)}`,
        )

        setStatus("success")
        setMessage("Your email has been successfully confirmed. You can now log in to your account.")
        toast.success("Email confirmed successfully!")
      } catch (error) {
        setStatus("error")
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data || "Failed to confirm email. Please try again.")
        } else {
          setMessage("An unexpected error occurred. Please try again.")
        }
        toast.error("Failed to confirm email")
        console.error("Error confirming email:", error)
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleGoToLogin = () => {
    router.push("/login")
  }

  const handleGoToHome = () => {
    router.push("/")
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
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

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === "success" && <CheckCircle className="h-12 w-12 text-blue-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Confirming your email..."}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>

        {status !== "loading" && (
          <>
            <CardContent>
              {status === "success" && (
                <p className="text-center text-muted-foreground">
                  Thank you for confirming your email address. Your account is now active.
                </p>
              )}
              {status === "error" && (
                <p className="text-center text-muted-foreground">
                  We couldn't confirm your email address. The link may have expired or is invalid.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              {status === "success" ? (
                <Button onClick={handleGoToLogin} className="w-full">
                  Go to Login
                </Button>
              ) : (
                <Button onClick={handleGoToHome} className="w-full">
                  Go to Home
                </Button>
              )}
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
