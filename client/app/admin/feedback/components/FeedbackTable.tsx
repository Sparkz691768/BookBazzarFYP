"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Trash2, Reply, User } from "lucide-react"
import type { Feedback } from "@/types/feedback"
import { FeedbackStatusButtons } from "./FeedbackStatusButtons" 
import { FeedbackEmptyState } from "./FeedbackEmptyState" 
import { FeedbackLoadingState } from "./FeedbackLoadingState"

interface FeedbackTableProps {
  feedbacks: Feedback[]
  isLoading: boolean
  onReply: (feedback: Feedback) => void
  onDelete: (feedback: Feedback) => void
  onViewUser: (userId: string) => void
  onStatusChange: (feedbackId: string, newStatus: "new" | "replied" | "resolved" | "archived") => void
  getStatusBadgeClass: (status: string) => string
  formatDate: (dateString: string) => string
}

export function FeedbackTable({
  feedbacks,
  isLoading,
  onReply,
  onDelete,
  onViewUser,
  onStatusChange,
  getStatusBadgeClass,
  formatDate,
}: FeedbackTableProps) {
  // State to track the currently expanded feedback
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)

  const toggleExpand = (id: string, event: React.MouseEvent) => {
    // Stop propagation to prevent double-triggering
    event.stopPropagation()
    
    // Close if clicking the same row, open if clicking a different row
    setExpandedFeedback(expandedFeedback === id ? null : id)
  }

  if (isLoading) {
    return <FeedbackLoadingState />
  }

  if (feedbacks.length === 0) {
    return <FeedbackEmptyState />
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Subject</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback) => (
            <React.Fragment key={feedback.id}>
              <TableRow 
                className={`cursor-pointer hover:bg-muted/50 ${
                  expandedFeedback === feedback.id ? 'bg-muted/30' : ''
                }`}
                onClick={(e) => toggleExpand(feedback.id!, e)}
              >
                <TableCell className="font-medium">{feedback.subject}</TableCell>
                <TableCell>{feedback.email}</TableCell>
                <TableCell>
                  <span className={getStatusBadgeClass(feedback.status!)}>{feedback.status}</span>
                </TableCell>
                <TableCell>{formatDate(feedback.createdAt!)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent row expansion
                        onReply(feedback)
                      }}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewUser(feedback.userId)
                      }}
                    >
                      <User className="h-4 w-4 mr-1" />
                      User
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(feedback)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedFeedback === feedback.id && (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <Card className="border-0 shadow-none rounded-none">
                      <CardContent className="pt-4 bg-muted/30">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Message</h4>
                            <p className="mt-1 whitespace-pre-wrap p-3 bg-white rounded-md">{feedback.message}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Change Status</h4>
                            <FeedbackStatusButtons
                              currentStatus={feedback.status!}
                              onStatusChange={(status) => onStatusChange(feedback.id!, status)}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4 bg-muted/30">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedFeedback(null)
                          }}
                        >
                          Close
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onReply(feedback)
                            }}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
