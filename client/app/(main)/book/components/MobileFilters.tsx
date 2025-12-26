"use client"

import type { Dispatch, SetStateAction } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"

interface MobileFiltersProps {
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
  setIsFilterOpen: Dispatch<SetStateAction<boolean>>
}

export function MobileFilters({
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
  setIsFilterOpen,
}: MobileFiltersProps) {
  const handleApplyFilters = async () => {
    await handleSearch()
    setIsFilterOpen(false)
  }

  return (
    <SheetContent side="left" className="w-[85vw] sm:w-[385px] bg-white p-6 rounded-lg shadow-lg">
      <SheetHeader>
        <SheetTitle>Search & Filter Books</SheetTitle>
        <SheetDescription>Find your next favorite book with our advanced filters</SheetDescription>
      </SheetHeader>
      <div className="py-6 space-y-6">
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
        <div className="flex gap-2 pt-4">
          <SheetClose asChild>
            <Button onClick={handleApplyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
          </SheetClose>
          <Button
            variant="outline"
            onClick={() => {
              resetSearch()
              setIsFilterOpen(false)
            }}
            className="border-gray-300"
          >
            Reset
          </Button>
        </div>
      </div>
    </SheetContent>
  )
}
