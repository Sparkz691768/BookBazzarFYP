"use client"

import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NoResultsProps {
  resetSearch: () => void
}

export function NoResults({ resetSearch }: NoResultsProps) {
  return (
    <div className="text-center py-16 bg-white rounded-lg border">
      <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium mb-2">No books found</h3>
      <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
      <Button
        variant="outline"
        onClick={resetSearch}
        className="border-blue-600 text-blue-600 hover:bg-blue-50"
      >
        Reset Filters
      </Button>
    </div>
  )
}
