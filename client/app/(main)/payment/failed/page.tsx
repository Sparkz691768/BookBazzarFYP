"use client"

import { useRouter } from "next/navigation"
import { XCircle, RefreshCw, Home, ShoppingBag, HeadphonesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
          {/* Red top banner */}
          <div className="bg-red-500 px-8 pt-10 pb-16 flex flex-col items-center text-white text-center relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Payment Failed</h1>
            <p className="text-red-100 text-sm">Your payment could not be processed.</p>
            {/* Wave cutout */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-slate-900 rounded-t-[50%]" />
          </div>

          <div className="px-8 pb-8 -mt-2">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl p-4 mb-6 text-center">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                The payment was cancelled or declined by eSewa.
              </p>
            </div>

            {/* Possible reasons */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Possible reasons:</h2>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Payment was cancelled before completion
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Insufficient balance in your eSewa wallet
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Network error during payment processing
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  Session timed out on the eSewa page
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6">
              Your order is still saved. You can go to <strong>My Orders</strong> and retry payment at any time.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push("/profile?tab=orders")}
              >
                <RefreshCw className="h-4 w-4" />
                Retry Payment
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push("/")}
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2 text-slate-500"
                onClick={() => router.push("/support")}
              >
                <HeadphonesIcon className="h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
          Powered by <span className="font-semibold text-green-600">eSewa</span> · Secure Digital Payments
        </p>
      </div>
    </div>
  )
}