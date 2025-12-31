"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import { CheckCircle, Loader2, XCircle, ShoppingBag, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

const API_BASE = "https://localhost:7265"

type VerifyState = "verifying" | "success" | "failed"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [state, setState] = useState<VerifyState>("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const data = searchParams.get("data")
    if (!data) {
      setState("failed")
      setMessage("No payment data received from eSewa.")
      return
    }
    verifyPayment(data)
  }, [searchParams])

  const verifyPayment = async (encodedData: string) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/Payment/VerifyPayment?data=${encodeURIComponent(encodedData)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            accept: "*/*",
          },
        }
      )
      if (response.status === 200) {
        setState("success")
        setMessage(response.data || "Payment verified successfully.")
      } else {
        setState("failed")
        setMessage("Payment could not be verified.")
      }
    } catch (error) {
      setState("failed")
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data || "Payment verification failed.")
      } else {
        setMessage("An unexpected error occurred during verification.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {state === "verifying" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Verifying Payment</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Please wait while we confirm your payment with eSewa…
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {state === "success" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
            {/* Green top banner */}
            <div className="bg-green-500 px-8 pt-10 pb-16 flex flex-col items-center text-white text-center relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Payment Successful!</h1>
              <p className="text-green-100 text-sm">Your order has been confirmed.</p>
              {/* Wave cutout */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-slate-900 rounded-t-[50%]" />
            </div>

            <div className="px-8 pb-8 -mt-2">
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl p-4 mb-6 text-center">
                <p className="text-green-700 dark:text-green-400 text-sm">{message}</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  Payment verified by eSewa
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  Order status updated to Completed
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  Confirmation email sent to you
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={() => router.push("/profile?tab=orders")}
                >
                  <ShoppingBag className="h-4 w-4" />
                  View My Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => router.push("/")}
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}

        {state === "failed" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
            {/* Red top banner */}
            <div className="bg-red-500 px-8 pt-10 pb-16 flex flex-col items-center text-white text-center relative">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <XCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Verification Failed</h1>
              <p className="text-red-100 text-sm">We couldn't confirm your payment.</p>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-slate-900 rounded-t-[50%]" />
            </div>

            <div className="px-8 pb-8 -mt-2">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl p-4 mb-6 text-center">
                <p className="text-red-700 dark:text-red-400 text-sm">{message}</p>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                If money was deducted from your account, please contact our support team with your eSewa transaction reference.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full gap-2"
                  onClick={() => router.push("/profile?tab=orders")}
                >
                  <ShoppingBag className="h-4 w-4" />
                  View My Orders
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => router.push("/")}
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* eSewa branding */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          Powered by <span className="font-semibold text-green-600">eSewa</span> · Secure Digital Payments
        </p>
      </div>
    </div>
  )
}