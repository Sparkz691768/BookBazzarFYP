"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import { BookOpen, Loader2, SlidersHorizontal, X, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { toast, ToastContainer } from "react-toastify"
import BookCard, { Book } from "./components/BookCard"
import { isAuthenticated } from "@/lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  genre: string
  language: string
  publisher: string
  author: string
  minPrice: string
  maxPrice: string
}

const EMPTY_FILTERS: Filters = {
  genre: "", language: "", publisher: "", author: "", minPrice: "", maxPrice: "",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token")

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const searchParams  = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [inputValue, setInputValue]   = useState(searchParams.get("q") || "")
  const [books, setBooks]             = useState<Book[]>([])
  const [loading, setLoading]         = useState(true)
  const [filters, setFilters]         = useState<Filters>({
    ...EMPTY_FILTERS,
    genre: searchParams.get("genre") || "",
  })

  // Derived filter options from results
  const [genres, setGenres]         = useState<string[]>([])
  const [languages, setLanguages]   = useState<string[]>([])
  const [publishers, setPublishers] = useState<string[]>([])
  const [authors, setAuthors]       = useState<string[]>([])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // GET /api/Book/FilterBooks — all params are optional, PascalCase query keys

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery)         params.append("Title",     searchQuery)
      if (filters.author)      params.append("Author",    filters.author)
      if (filters.genre)       params.append("Genre",     filters.genre)
      if (filters.language)    params.append("Language",  filters.language)
      if (filters.publisher)   params.append("Publisher", filters.publisher)
      // Price filters map to the Price field — use min/max if your backend supports it
      // For now send Price as min boundary (adjust to your backend's contract)
      if (filters.minPrice)    params.append("minPrice",  filters.minPrice)
      if (filters.maxPrice)    params.append("maxPrice",  filters.maxPrice)

      const token = getToken()
      const res = await axios.get<Book[]>(
        `https://localhost:7265/api/Book/FilterBooks?${params.toString()}`,
        {
          headers: {
            accept: "*/*",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )

      const data = res.data || []
      setBooks(data)

      // Build filter option lists from returned data
      if (data.length > 0) {
        setGenres([...new Set(data.map((b) => b.genre).filter(Boolean))])
        setLanguages([...new Set(data.map((b) => b.language).filter(Boolean))])
        setPublishers([...new Set(data.map((b) => b.publisher).filter(Boolean))])
        setAuthors([...new Set(data.map((b) => b.author).filter(Boolean))])
      }
    } catch (err) {
      console.error("Filter error:", err)
      toast.error("Failed to fetch books. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(inputValue)
    const url = new URL(window.location.href)
    url.searchParams.set("q", inputValue)
    window.history.pushState({}, "", url.toString())
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    // Treat "all" sentinel values as cleared
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? "" : value }))
  }

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    const url = new URL(window.location.href)
    url.searchParams.delete("genre")
    window.history.pushState({}, "", url.toString())
  }

  // ── Active filter badges ───────────────────────────────────────────────────

  const activeFilters: { label: string; key: keyof Filters }[] = [
    ...(filters.genre     ? [{ label: `Genre: ${filters.genre}`,         key: "genre"     as const }] : []),
    ...(filters.language  ? [{ label: `Language: ${filters.language}`,   key: "language"  as const }] : []),
    ...(filters.publisher ? [{ label: `Publisher: ${filters.publisher}`, key: "publisher" as const }] : []),
    ...(filters.author    ? [{ label: `Author: ${filters.author}`,       key: "author"    as const }] : []),
    ...(filters.minPrice  ? [{ label: `Min: Rs.${filters.minPrice}`,     key: "minPrice"  as const }] : []),
    ...(filters.maxPrice  ? [{ label: `Max: Rs.${filters.maxPrice}`,     key: "maxPrice"  as const }] : []),
  ]

  const filterPanel = (
    <FilterOptions
      filters={filters}
      genres={genres}
      languages={languages}
      publishers={publishers}
      authors={authors}
      handleFilterChange={handleFilterChange}
      clearFilters={clearFilters}
    />
  )

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* ── Mobile filter trigger ── */}
          <div className="w-full md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilters.length > 0 && (
                    <Badge className="ml-1 bg-blue-600 text-white">{activeFilters.length}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px] bg-white overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                {filterPanel}
              </SheetContent>
            </Sheet>
          </div>

          {/* ── Desktop filter sidebar ── */}
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-800">Filters</h2>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {filterPanel}
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Search bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search by title, author, genre…"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="pl-9 border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-1.5">
                  <Search className="h-4 w-4" /> Search
                </Button>
                <Button
                  type="button" variant="outline"
                  onClick={fetchBooks}
                  disabled={loading}
                  className="gap-1.5"
                  title="Refresh"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </form>
            </div>

            {/* Active filter badges */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-500 font-medium">Active:</span>
                {activeFilters.map(({ label, key }) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  >
                    {label}
                    <button
                      onClick={() => handleFilterChange(key, "")}
                      className="ml-1 rounded-full hover:bg-blue-200 h-4 w-4 inline-flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Result count */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {searchQuery ? `Results for "${searchQuery}"` : "All Books"}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {loading ? "Searching…" : `${books.length} ${books.length === 1 ? "book" : "books"} found`}
              </p>
            </div>

            {/* Books grid */}
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3 text-blue-600">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-sm text-slate-500">Searching books…</p>
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {books.map((book) => (
                  <BookCard key={book.bookId} book={book} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No books found</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                  We couldn't find any books matching{" "}
                  {searchQuery ? `"${searchQuery}"` : "your current filters"}.
                  Try adjusting your search or clearing filters.
                </p>
                <div className="flex gap-3 justify-center">
                  {activeFilters.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => { setInputValue(""); setSearchQuery(""); clearFilters() }}
                  >
                    Show All Books
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

interface FilterOptionsProps {
  filters: Filters
  genres: string[]
  languages: string[]
  publishers: string[]
  authors: string[]
  handleFilterChange: (key: keyof Filters, value: string) => void
  clearFilters: () => void
}

function FilterOptions({
  filters, genres, languages, publishers, authors,
  handleFilterChange, clearFilters,
}: FilterOptionsProps) {

  const SelectFilter = ({
    label, filterKey, options, placeholder,
  }: {
    label: string
    filterKey: keyof Filters
    options: string[]
    placeholder: string
  }) => (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</h3>
      <Select
        value={filters[filterKey] || "all"}
        onValueChange={(v) => handleFilterChange(filterKey, v)}
      >
        <SelectTrigger className="w-full text-sm">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">All {label}s</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="space-y-5">
      <SelectFilter label="Genre"     filterKey="genre"     options={genres}     placeholder="Select genre" />
      <SelectFilter label="Language"  filterKey="language"  options={languages}  placeholder="Select language" />
      <SelectFilter label="Publisher" filterKey="publisher" options={publishers} placeholder="Select publisher" />
      <SelectFilter label="Author"    filterKey="author"    options={authors}    placeholder="Select author" />

      {/* Price range */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price Range (Rs.)</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number" placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="text-sm"
          />
          <Input
            type="number" placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <Separator />

      <Button variant="outline" onClick={clearFilters} className="w-full text-sm gap-2">
        <X className="h-3.5 w-3.5" /> Clear All Filters
      </Button>
    </div>
  )
}