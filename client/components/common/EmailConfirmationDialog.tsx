"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface EmailConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  email: string
  onResendEmail?: () => Promise<void>
}

export function EmailConfirmationDialog({
  isOpen,
  onClose,
  email,
  onResendEmail,
}: EmailConfirmationDialogProps) {
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    if (!onResendEmail) return
    
    setIsResending(true)
    try {
      await onResendEmail()
      toast.success("Confirmation email resent successfully!")
    } catch (error) {
      toast.error("Failed to resend confirmation email. Please try again.")
      console.error("Error resending email:", error)
    } finally {
      setIsResending(false)
    }
  }

  const handleGoToLogin = () => {
    router.push("/login")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold mt-4">Verify your email</DialogTitle>
          <DialogDescription className="text-center">
            We've sent a verification email to <span className="font-medium">{email}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Check your inbox</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click the verification link in the email we sent to activate your account.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Don't see the email?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your spam folder or click the button below to resend the verification email.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleGoToLogin} 
            className="sm:w-auto w-full"
          >
            Go to login
          </Button>
          
          {onResendEmail && (
            <Button 
              onClick={handleResendEmail} 
              disabled={isResending}
              className="sm:w-auto w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend email"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
