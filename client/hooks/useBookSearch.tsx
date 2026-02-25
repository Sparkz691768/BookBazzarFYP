"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "react-toastify"
import { isAuthenticated } from "@/lib/auth"
import type { Book } from "@/types/book"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

const API_BASE = "https://localhost:7265/api/Book"

// ── Pure helpers (outside hook — no stale closure risk) ───────────────────────

function isOfferActive(book: Book): boolean {
  if (!book.offerPrice || !book.offerStartDate || !book.offerEndDate) return false
  const now = new Date()
  return now >= new Date(book.offerStartDate) && now <= new Date(book.offerEndDate)
}

function getEffectivePrice(book: Book): number {
  return isOfferActive(book) ? book.offerPrice! : book.price
}

function applySorting(list: Book[], method: string): Book[] {
  const sorted = [...list]
  switch (method) {
    case "price-low":  return sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b))
    case "price-high": return sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a))
    case "title-asc":  return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case "title-desc": return sorted.sort((a, b) => b.title.localeCompare(a.title))
    default:           return sorted
  }
}

function applyFilters(
  list: Book[],
  title: string,
  author: string,
  genre: string,
  sortBy: string
): Book[] {
  let results = [...list]

  if (title.trim())
    results = results.filter((b) => b.title.toLowerCase().includes(title.toLowerCase()))

  if (author.trim())
    results = results.filter((b) => b.author.toLowerCase().includes(author.toLowerCase()))

  if (genre && genre !== "all")
    results = results.filter((b) => b.genre.toLowerCase().includes(genre.toLowerCase()))

  return applySorting(results, sortBy)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBookSearch(router: AppRouterInstance) {
  const [books, setBooks]                 = useState<Book[]>([])
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [loading, setLoading]             = useState(true)
  const [genres, setGenres]               = useState<string[]>([])

  const [searchTitle, setSearchTitle]   = useState("")
  const [searchGenre, setSearchGenre]   = useState("all")
  const [searchAuthor, setSearchAuthor] = useState("")
  const [sortBy, setSortBy]             = useState("relevance")

  // Ref so callbacks always read latest books without going stale
  const booksRef = useRef<Book[]>([])

  // ── Fetch ────────────────────────────────────────────────

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true)

      const res = await fetch(`${API_BASE}/GetBooks`, {
        headers: { accept: "application/json" },
      })

      if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`)

      const data: Book[] = await res.json()

      booksRef.current = data
      setBooks(data)
      setSearchResults(data)

      const uniqueGenres = [
        ...new Set(data.map((b) => b.genre).filter(Boolean)),
      ] as string[]
      setGenres(uniqueGenres)
    } catch (err: any) {
      console.error("Error fetching books:", err)
      toast.error("Failed to load books. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  // ── Search / Filter ──────────────────────────────────────

  const handleSearch = useCallback(async () => {
    setLoading(true)
    try {
      const hasFilters =
        searchTitle.trim() ||
        searchAuthor.trim() ||
        (searchGenre && searchGenre !== "all")

      // No filters — just sort the full list
      if (!hasFilters) {
        setSearchResults(applySorting(booksRef.current, sortBy))
        return
      }

      // Try server-side filter first
      const params = new URLSearchParams()
      if (searchTitle.trim())                params.append("title",  searchTitle.trim())
      if (searchAuthor.trim())               params.append("author", searchAuthor.trim())
      if (searchGenre && searchGenre !== "all") params.append("genre", searchGenre)

      try {
        const res = await fetch(`${API_BASE}/FilterBooks?${params.toString()}`, {
          headers: { accept: "application/json" },
        })

        if (!res.ok) throw new Error("Filter API failed")

        const data: Book[] = await res.json()
        setSearchResults(applySorting(data, sortBy))
      } catch {
        // Fallback to client-side filtering
        console.warn("Filter API failed — using client-side filtering")
        setSearchResults(
          applyFilters(booksRef.current, searchTitle, searchAuthor, searchGenre, sortBy)
        )
      }
    } catch (err: any) {
      console.error("Error searching books:", err)
      toast.error("Failed to search books.")
      setSearchResults(booksRef.current)
    } finally {
      setLoading(false)
    }
  }, [searchTitle, searchAuthor, searchGenre, sortBy])

  // Re-apply sort whenever it changes
  useEffect(() => {
    if (booksRef.current.length > 0) {
      setSearchResults((prev) => applySorting([...prev], sortBy))
    }
  }, [sortBy])

  // ── Reset ────────────────────────────────────────────────

  const resetSearch = useCallback(() => {
    setSearchTitle("")
    setSearchAuthor("")
    setSearchGenre("all")
    setSortBy("relevance")
    setSearchResults(booksRef.current)
  }, [])

  // ── Wishlist ─────────────────────────────────────────────

  const addToWishlist = useCallback(async (bookId: string) => {
    if (!isAuthenticated()) {
      toast.info("Please login to add books to your wishlist.")
      router.push("/login")
      return
    }

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${API_BASE}/AddToWishlist?bookId=${bookId}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to add to wishlist")
      }

      toast.success("Book added to wishlist successfully!")
    } catch (err: any) {
      console.error("Error adding to wishlist:", err)
      toast.error(err.message || "Failed to add book to wishlist.")
    }
  }, [router])

  // ── Derived state ────────────────────────────────────────

  // Featured = books with an active offer (uses real dates)
  const featuredBooks = searchResults.filter(isOfferActive)

  // New releases = books without an active offer
  const newReleases = searchResults
    .filter((b) => !isOfferActive(b))
    .slice(0, 4)

  return {
    books,
    searchResults,
    featuredBooks,
    newReleases,
    loading,
    genres,
    searchTitle,  setSearchTitle,
    searchGenre,  setSearchGenre,
    searchAuthor, setSearchAuthor,
    sortBy,       setSortBy,
    handleSearch,
    resetSearch,
    addToWishlist,
    fetchBooks,
  }
}// Optimized search debounce
