"use client"

import type { Dispatch, SetStateAction } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DesktopFiltersProps {
  searchTitle: string
  setSearchTitle: Dispatch<SetStateAction<string>>
  searchAuthor: string
  setSearchAuthor: Dispatch<SetStateAction<string>>
  searchGenre: string
  setSearchGenre: Dispatch<SetStateAction<string>>
  sortBy: string
  setSortBy: Dispatch<SetStateAction<string>>
  genres: string[]
  handleSearch: () => Promise<void>
  resetSearch: () => void
}

export function DesktopFilters({
  searchTitle,
  setSearchTitle,
  searchAuthor,
  setSearchAuthor,
  searchGenre,
  setSearchGenre,
  sortBy,
  setSortBy,
  genres,
  handleSearch,
  resetSearch,
}: DesktopFiltersProps) {
  return (
    <div className="hidden md:block w-full md:w-64 lg:w-72 shrink-0">
      <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-4">
        <h2 className="text-lg font-semibold mb-6">Search & Filters</h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Book Title</label>
            <Input
              placeholder="Search by title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="border-gray-300 focus-visible:ring-blue-600"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Author</label>
            <Input
              placeholder="Search by author..."
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              className="border-gray-300 focus-visible:ring-blue-600"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Genre</label>
            <Select value={searchGenre || "all"} onValueChange={setSearchGenre}>
              <SelectTrigger className="border-gray-300 focus:ring-blue-600">
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Sort By</label>
            <Select value={sortBy || "relevance"} onValueChange={setSortBy}>
              <SelectTrigger className="border-gray-300 focus:ring-blue-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="title-asc">Title: A to Z</SelectItem>
                <SelectItem value="title-desc">Title: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-2">
            <Button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700">
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={resetSearch} className="w-full border-gray-300">
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
