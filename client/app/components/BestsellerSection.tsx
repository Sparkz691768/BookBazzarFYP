"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, AlertCircle, ImageOff, Sparkles, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

const API_BASE = "https://localhost:7265/api/Book"

interface Book {
  bookId: string
  title: string
  author: string
  description: string
  price: number
  offerPrice: number | null
  offerStartDate: string | null
  offerEndDate: string | null
  coverImagePath: string | null
  genre: string
  language: string
  publisher: string
  publicationDate: string
  stock: number
  isbn: string
  sellerId: string
  sellerName: string
}

// ✅ Accepts `now` as a parameter so server and client use the same value
function isOfferActive(book: Book, now: Date): boolean {
  if (!book.offerPrice) return false
  if (book.offerStartDate && book.offerEndDate) {
    return now >= new Date(book.offerStartDate) && now <= new Date(book.offerEndDate)
  }
  return true
}

function getImageUrl(coverImagePath: string | null): string {
  return coverImagePath ?? "/placeholder.svg"
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export default function BestsellerSection() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  // ✅ Store `now` in state so it's only set on the client, preventing SSR/client mismatch
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // ✅ Set `now` only on the client after mount
    setNow(new Date())
  }, [])

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        setLoading(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`${API_BASE}/GetPopularBooks`, {
          headers: { accept: "*/*" },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`Failed to fetch books (${res.status})`)

        const data = await res.json()
        setBooks(Array.isArray(data) && data.length > 0 ? data : [])
      } catch (err: any) {
        console.error("Error fetching popular books:", err)
        setError(err instanceof Error ? err.message : "Failed to load bestsellers")
      } finally {
        setLoading(false)
      }
    }

    fetchPopularBooks()
  }, [])

  const handleImageError = (bookId: string) =>
    setImageErrors((prev) => ({ ...prev, [bookId]: true }))

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="text-primary font-medium">Loading bestsellers...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  if (books.length === 0) {
    return (
      <motion.div
        className="text-center py-12 border border-dashed border-primary/20 rounded-xl bg-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h3 className="font-medium text-foreground">No bestselling books available</h3>
        <p className="text-foreground/60 mt-1">Check back soon for our latest bestsellers!</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {books.map((book) => {
        // ✅ Only compute offer status after client mount; default false on server
        const offerActive = now ? isOfferActive(book, now) : false
        const isHovered = hoveredId === book.bookId

        return (
          <motion.div
            key={book.bookId}
            variants={{itemVariants}}  // ✅ Fixed: was variants={{itemVariants}} (wrong object shorthand)
            onMouseEnter={() => setHoveredId(book.bookId)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Link href={`/book/${book.bookId}`} className="block h-full">
              <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                <Card className="h-full overflow-hidden transition-all duration-200 border-0 shadow-sm hover:shadow-xl bg-white">
                  <CardContent className="p-4 flex flex-col h-full relative">
                    {/* Cover Image */}
                    <motion.div
                      className="relative mb-4 aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-accent/10"
                      initial={{ borderRadius: "0.75rem" }}
                      whileHover={{ borderRadius: "1rem" }}
                    >
                      <motion.div
                        animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full"
                      >
                        {imageErrors[book.bookId] ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="h-12 w-12 text-foreground/20" />
                          </div>
                        ) : (
                          <img
                            src={getImageUrl(book.coverImagePath)}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(book.bookId)}
                          />
                        )}
                      </motion.div>

                      {/* Bestseller Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground gap-1 shadow-lg">
                          <Sparkles className="h-3 w-3" />
                          Bestseller
                        </Badge>
                      </motion.div>

                      {/* Hover Overlay */}
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                          style={{ zIndex: 5 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>

                    {/* Book Info */}
                    <motion.div
                      className="flex-1 flex flex-col gap-2"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.h3
                        className="font-semibold line-clamp-2 text-foreground text-sm"
                        whileHover={{ color: "#4682c8" }}
                      >
                        {book.title}
                      </motion.h3>
                      <p className="text-xs text-foreground/60 line-clamp-1">{book.author}</p>

                      {/* Price */}
                      <motion.div
                        className="mt-auto pt-3 flex items-center gap-2"
                        animate={isHovered ? { y: -2 } : { y: 0 }}
                      >
                        <span className="font-bold text-primary text-sm">
                          Rs. {offerActive ? book.offerPrice : book.price}
                        </span>
                        {offerActive && (
                          <motion.span
                            className="text-xs text-foreground/40 line-through"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            Rs. {book.price}
                          </motion.span>
                        )}
                      </motion.div>

                      {/* Offer Badge */}
                      {offerActive && (
                        <motion.div
                          className="mt-2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge variant="secondary" className="bg-accent/20 text-accent text-xs gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Special Offer
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}