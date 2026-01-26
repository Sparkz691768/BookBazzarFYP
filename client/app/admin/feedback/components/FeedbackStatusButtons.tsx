"use client"

import { Button } from "@/components/ui/button"

interface FeedbackStatusButtonsProps {
  currentStatus: string
  onStatusChange: (status: "new" | "replied" | "resolved" | "archived") => void
}

export function FeedbackStatusButtons({ currentStatus, onStatusChange }: FeedbackStatusButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant={currentStatus === "new" ? "default" : "outline"} onClick={() => onStatusChange("new")}>
        New
      </Button>
      <Button
        size="sm"
        variant={currentStatus === "replied" ? "default" : "outline"}
        onClick={() => onStatusChange("replied")}
      >
        Replied
      </Button>
      <Button
        size="sm"
        variant={currentStatus === "resolved" ? "default" : "outline"}
        onClick={() => onStatusChange("resolved")}
      >
        Resolved
      </Button>
      <Button
        size="sm"
        variant={currentStatus === "archived" ? "default" : "outline"}
        onClick={() => onStatusChange("archived")}
      >
        Archived
      </Button>
    </div>
  )
}
