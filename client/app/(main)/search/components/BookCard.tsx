"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, ShoppingCart, Loader2, BookOpen, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import axios from "axios"
import { isAuthenticated, getUserId } from "@/lib/auth"
import { useRouter } from "next/navigation"

// ─── Type ─────────────────────────────────────────────────────────────────────
// Matches GET /api/Book/FilterBooks response exactly

export interface Book {
  bookId: string
  title: string
  description: string
  stock: number
  author: string
  genre: string
  language: string
  isbn: string
  publisher: string
  publicationDate: string
  price: number
  offerPrice: number | null
  offerStartDate: string | null
  offerEndDate: string | null
  coverImagePath: string | null
  sellerId: string
  sellerName: string
}

interface BookCardProps {
  book: Book
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token")

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookCard({ book }: BookCardProps) {
  const router = useRouter()
  const [addingToCart, setAddingToCart]       = useState(false)
  const [addingToWishlist, setAddingToWishlist] = useState(false)
  const [inWishlist, setInWishlist]           = useState(false)

  const discount = book.offerPrice
    ? Math.round(((book.price - book.offerPrice) / book.price) * 100)
    : 0

  const isOutOfStock = book.stock === 0

  // ── Add to wishlist ────────────────────────────────────────────────────────

  const addToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated()) { toast.info("Please login to add books to your wishlist"); router.push("/login"); return }

    try {
      setAddingToWishlist(true)
      const userId = getUserId()
      await axios.post(
        `https://localhost:7265/api/Book/AddToWishlist?userId=${userId}&bookId=${book.bookId}`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } },
      )
      setInWishlist(true)
      toast.success("Added to wishlist!")
    } catch (err: any) {
      const msg: string = err.response?.data || "Failed to add to wishlist"
      msg.toLowerCase().includes("already")
        ? toast.info("Already in your wishlist")
        : toast.error(msg)
    } finally {
      setAddingToWishlist(false)
    }
  }

  // ── Add to cart ────────────────────────────────────────────────────────────

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated()) { toast.info("Please login to add items to your cart"); router.push("/login"); return }
    if (isOutOfStock) { toast.error("This book is out of stock"); return }

    try {
      setAddingToCart(true)
      const userId = getUserId()
      await axios.post(
        `https://localhost:7265/api/Cart/AddToCart/${userId}`,
        { bookId: book.bookId, quantity: 1 },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            accept: "*/*",
          },
        },
      )
      toast.success("Added to cart!")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg: string = err.response?.data || "Failed to add to cart"
        if (msg.toLowerCase().includes("already")) toast.info("Already in your cart")
        else if (msg.toLowerCase().includes("stock")) toast.error("Insufficient stock")
        else toast.error(msg)
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      setAddingToCart(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Link href={`/book/${book.bookId}`} className="block h-full">
      <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-slate-100">

        {/* ── Cover ── */}
        <div className="relative aspect-[2/3] bg-slate-100 overflow-hidden">
          {book.coverImagePath ? (
            <img
              src={book.coverImagePath}
              alt={book.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
              <BookOpen className="h-14 w-14 text-slate-300" />
              <p className="text-xs text-slate-400 px-4 text-center line-clamp-2">{book.title}</p>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" />{discount}% OFF
              </Badge>
            )}
            {isOutOfStock && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">Out of Stock</Badge>
            )}
          </div>

          {/* Hover action buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
            <Button
              size="icon"
              variant="ghost"
              className={`h-9 w-9 rounded-full bg-white/95 hover:bg-white shadow ${inWishlist ? "text-red-500" : "text-slate-600 hover:text-red-500"}`}
              onClick={addToWishlist}
              disabled={addingToWishlist || inWishlist}
              title="Add to wishlist"
            >
              {addingToWishlist
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500" : ""}`} />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full bg-white/95 hover:bg-white shadow text-slate-600 hover:text-blue-600"
              onClick={addToCart}
              disabled={addingToCart || isOutOfStock}
              title={isOutOfStock ? "Out of stock" : "Add to cart"}
            >
              {addingToCart
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ShoppingCart className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors text-sm">
              {book.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">by {book.author}</p>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {book.genre && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0">
                  {book.genre}
                </Badge>
              )}
              {book.language && (
                <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200 px-1.5 py-0">
                  {book.language}
                </Badge>
              )}
            </div>

            {/* Seller */}
            {book.sellerName && (
              <p className="text-xs text-slate-400 mt-1.5 truncate">Sold by {book.sellerName}</p>
            )}
          </div>

          {/* Price */}
          <div className="pt-1 border-t border-slate-100">
            {book.offerPrice ? (
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-900 text-base">Rs. {book.offerPrice}</span>
                <span className="text-xs text-slate-400 line-through">Rs. {book.price}</span>
              </div>
            ) : (
              <span className="font-bold text-slate-900 text-base">Rs. {book.price}</span>
            )}
            {/* Stock indicator */}
            {!isOutOfStock && book.stock <= 5 && (
              <p className="text-xs text-amber-600 font-medium mt-0.5">Only {book.stock} left!</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}