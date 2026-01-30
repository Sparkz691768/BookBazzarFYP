"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Feedback } from "@/types/feedback"

interface ReplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback: Feedback | null
  replyMessage: string
  setReplyMessage: (message: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function ReplyDialog({
  open,
  onOpenChange,
  feedback,
  replyMessage,
  setReplyMessage,
  onSubmit,
  isSubmitting,
}: ReplyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Reply to Feedback</DialogTitle>
          <DialogDescription>
            {feedback && (
              <div className="mt-2">
                <p className="text-sm font-medium">From: {feedback.email}</p>
                <p className="text-sm font-medium">Subject: {feedback.subject}</p>
                <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">{feedback.message}</div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Type your reply here..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={6}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
