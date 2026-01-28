"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackFilters } from "./FeedbackFilters" 
import { FeedbackTable } from "./FeedbackTable" 
import type { Feedback } from "@/types/feedback"

interface FeedbackTabsProps {
  feedbacks: Feedback[]
  isLoading: boolean
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  fetchFeedbacks: () => void
  onReply: (feedback: Feedback) => void
  onDelete: (feedback: Feedback) => void
  onViewUser: (userId: string) => void
  onStatusChange: (feedbackId: string, newStatus: "new" | "replied" | "resolved" | "archived") => void
  getStatusBadgeClass: (status: string) => string
  formatDate: (dateString: string) => string
}

export function FeedbackTabs({
  feedbacks,
  isLoading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  fetchFeedbacks,
  onReply,
  onDelete,
  onViewUser,
  onStatusChange,
  getStatusBadgeClass,
  formatDate,
}: FeedbackTabsProps) {
  return (
    <Tabs defaultValue="all" className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <TabsList>
          <TabsTrigger value="all">All Feedbacks</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="replied">Replied</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <FeedbackFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          fetchFeedbacks={fetchFeedbacks}
          isLoading={isLoading}
        />
      </div>

      <TabsContent value="all">
        <FeedbackTable
          feedbacks={feedbacks}
          isLoading={isLoading}
          onReply={onReply}
          onDelete={onDelete}
          onViewUser={onViewUser}
          onStatusChange={onStatusChange}
          getStatusBadgeClass={getStatusBadgeClass}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="new">
        <FeedbackTable
          feedbacks={feedbacks.filter((f) => f.status === "new")}
          isLoading={isLoading}
          onReply={onReply}
          onDelete={onDelete}
          onViewUser={onViewUser}
          onStatusChange={onStatusChange}
          getStatusBadgeClass={getStatusBadgeClass}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="replied">
        <FeedbackTable
          feedbacks={feedbacks.filter((f) => f.status === "replied")}
          isLoading={isLoading}
          onReply={onReply}
          onDelete={onDelete}
          onViewUser={onViewUser}
          onStatusChange={onStatusChange}
          getStatusBadgeClass={getStatusBadgeClass}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="resolved">
        <FeedbackTable
          feedbacks={feedbacks.filter((f) => f.status === "resolved")}
          isLoading={isLoading}
          onReply={onReply}
          onDelete={onDelete}
          onViewUser={onViewUser}
          onStatusChange={onStatusChange}
          getStatusBadgeClass={getStatusBadgeClass}
          formatDate={formatDate}
        />
      </TabsContent>

      <TabsContent value="archived">
        <FeedbackTable
          feedbacks={feedbacks.filter((f) => f.status === "archived")}
          isLoading={isLoading}
          onReply={onReply}
          onDelete={onDelete}
          onViewUser={onViewUser}
          onStatusChange={onStatusChange}
          getStatusBadgeClass={getStatusBadgeClass}
          formatDate={formatDate}
        />
      </TabsContent>
    </Tabs>
  )
}
