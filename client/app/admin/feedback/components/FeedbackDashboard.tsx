"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"
import { FeedbackHeader } from "./FeedbackHeader" 
import { FeedbackTabs } from "./FeedbackTabs" 
import { ReplyDialog } from "./dialogs/ReplyDialog" 
import { DeleteDialog } from "./dialogs/DeleteDialog" 
import { UserDetailsDialog } from "./dialogs/UserDetailsDialog" 
import type { Feedback, UserDetails } from "@/types/feedback"
import { getUserId } from "@/lib/auth"

export function FeedbackDashboard() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all feedbacks
  useEffect(() => {
    fetchFeedbacks()
  }, [])

  // Filter feedbacks when search term or status filter changes
  useEffect(() => {
    filterFeedbacks()
  }, [searchTerm, statusFilter, feedbacks])

  const fetchFeedbacks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://localhost:7265/api/Feedback/GetFeedbacks")
      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks")
      }
      const data = await response.json()
      setFeedbacks(data)
    } catch (error) {
      console.error("Error fetching feedbacks:", error)
      toast.error("Failed to load feedback data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterFeedbacks = () => {
    let filtered = [...feedbacks]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (feedback) =>
          feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((feedback) => feedback.status === statusFilter)
    }

    setFilteredFeedbacks(filtered)
  }

  const handleViewUserDetails = async (userId: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        `https://localhost:7265/api/User/get-user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'accept': '*/*'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Unauthorized access. Please login again.")
          return
        }
        if (response.status === 404) {
          toast.error("User not found")
          return
        }
        throw new Error('Failed to fetch user details')
      }

      const data = await response.json()
      if (data) {
        setUserDetails(data)
        setUserDetailsDialogOpen(true)
      } else {
        toast.error("No user details available")
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      toast.error("Failed to fetch user details. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!selectedFeedback || !replyMessage.trim()) {
      toast.warning("Please enter a reply message.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        "https://localhost:7265/api/Feedback/ReplyFeedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "accept": "*/*"
          },
          body: JSON.stringify({
            userId: selectedFeedback.userId,
            email: selectedFeedback.email,
            subject: `Re: ${selectedFeedback.subject}`,
            message: replyMessage
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send reply")
      }

      // Update the feedback status locally
      const updatedFeedbacks = feedbacks.map((feedback) => {
        if (feedback.id === selectedFeedback.id) {
          return { ...feedback, status: "replied" as const }
        }
        return feedback
      })

      setFeedbacks(updatedFeedbacks)
      setReplyDialogOpen(false)
      setReplyMessage("")
      toast.success(`Reply sent to ${selectedFeedback.email} successfully.`)
    } catch (error) {
      console.error("Error sending reply:", error)
      toast.error("Failed to send reply. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return

    setIsSubmitting(true)
    try {
      // API call logic here...
      const updatedFeedbacks = feedbacks.filter((feedback) => feedback.id !== selectedFeedback.id)
      setFeedbacks(updatedFeedbacks)
      setDeleteDialogOpen(false)
      toast.success("Feedback deleted successfully.")
    } catch (error) {
      toast.error("Failed to delete feedback. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    try {
      // API call logic here...
      const updatedFeedbacks = feedbacks.map((feedback) => {
        if (feedback.id === feedbackId) {
          return { ...feedback, status: newStatus as "new" | "replied" | "resolved" | "archived" }
        }
        return feedback
      })

      setFeedbacks(updatedFeedbacks)
      toast.success(`Feedback status updated to ${newStatus}.`)
    } catch (error) {
      toast.error("Failed to update status. Please try again later.")
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
      case "replied":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
      case "resolved":
        return "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium"
      case "archived":
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <FeedbackHeader />

      <FeedbackTabs
        feedbacks={filteredFeedbacks}
        isLoading={isLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        fetchFeedbacks={fetchFeedbacks}
        onReply={(feedback) => {
          setSelectedFeedback(feedback)
          setReplyDialogOpen(true)
        }}
        onDelete={(feedback) => {
          setSelectedFeedback(feedback)
          setDeleteDialogOpen(true)
        }}
        onViewUser={handleViewUserDetails}
        onStatusChange={handleStatusChange}
        getStatusBadgeClass={getStatusBadgeClass}
        formatDate={formatDate}
      />

      {/* Dialogs */}
      <ReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        feedback={selectedFeedback}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
        onSubmit={handleReplySubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteFeedback}
        isSubmitting={isSubmitting}
      />

      <UserDetailsDialog
        open={userDetailsDialogOpen}
        onOpenChange={setUserDetailsDialogOpen}
        userDetails={userDetails}
        formatDate={formatDate}
      />

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
    </div>
  )
}
