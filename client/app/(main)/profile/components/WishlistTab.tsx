"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Trash2, Loader2, BookOpen, AlertCircle, RefreshCw } from "lucide-react"
import { getUserId } from "@/lib/auth"
import axios from "axios"
import { toast } from "react-toastify"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

// ─── Types ────────────────────────────────────────────────────────────────────
// Matches actual API response from GET /api/Book/GetWishlist
interface WishlistItem {
  wishlistId: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  addedDate: string
  // API does not return these — kept optional for future use
  coverImagePath?: string | null
  price?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token")

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  })

// ─── Component ────────────────────────────────────────────────────────────────

export function WishlistTab() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [removingIds, setRemovingIds]     = useState<string[]>([])
  const [addingIds, setAddingIds]         = useState<string[]>([])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  // GET /api/Book/GetWishlist — token carries the userId, no query param needed
  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get("https://localhost:7265/api/Book/GetWishlist", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          accept: "*/*",
        },
      })
      setWishlistItems(res.data || [])
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // 404 = no wishlist yet — treat as empty
        setWishlistItems([])
      } else {
        setError("Failed to load your wishlist. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWishlist() }, [])

  // ── Remove ─────────────────────────────────────────────────────────────────
  const handleRemove = async (wishlistId: string) => {
    try {
      setRemovingIds((p) => [...p, wishlistId])
      await axios.delete(`https://localhost:7265/api/Book/RemoveFromWishlist?wishlistId=${wishlistId}`, {
        headers: { Authorization: `Bearer ${getToken()}`, accept: "*/*" },
      })
      setWishlistItems((p) => p.filter((i) => i.wishlistId !== wishlistId))
      toast.success("Removed from wishlist")
    } catch {
      toast.error("Failed to remove item from wishlist")
    } finally {
      setRemovingIds((p) => p.filter((id) => id !== wishlistId))
    }
  }

  // ── Add to cart ────────────────────────────────────────────────────────────
  const handleAddToCart = async (bookId: string, wishlistId: string) => {
    const userId = getUserId()
    if (!userId) { toast.error("Please log in again."); return }

    try {
      setAddingIds((p) => [...p, wishlistId])
      await axios.post(
        `https://localhost:7265/api/Cart/AddToCart/${userId}`,
        { bookId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
            accept: "*/*",
          },
        },
      )
      toast.success("Added to cart!")
      // Move out of wishlist after adding
      await handleRemove(wishlistId)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg: string = err.response?.data || "Failed to add to cart"
        msg.toLowerCase().includes("already") ? toast.info("Already in your cart") : toast.error(msg)
      } else {
        toast.error("An unexpected error occurred")
      }
    } finally {
      setAddingIds((p) => p.filter((id) => id !== wishlistId))
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" /> My Wishlist
        </CardTitle>
        <CardDescription className="text-blue-600">Books you've saved for later</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center py-20 gap-3 text-blue-500">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="text-sm">Loading your wishlist…</p>
      </CardContent>
    </Card>
  )

  // ── Error state ────────────────────────────────────────────────────────────

  if (error) return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" /> My Wishlist
        </CardTitle>
        <CardDescription className="text-blue-600">Books you've saved for later</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button
            onClick={() => { setError(null); fetchWishlist() }}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" /> My Wishlist
            </CardTitle>
            <CardDescription className="text-blue-600">Books you've saved for later</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {wishlistItems.length > 0 && (
              <Badge className="bg-blue-600 hover:bg-blue-700">{wishlistItems.length} items</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={fetchWishlist} className="gap-1 text-blue-700 hover:text-blue-800">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.wishlistId}
                className="bg-white border border-blue-100 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Cover / placeholder */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex-shrink-0 w-20 h-28 bg-blue-50 rounded-lg overflow-hidden shadow-sm border border-blue-100 flex items-center justify-center">
                    {item.coverImagePath ? (
                      <img
                        src={item.coverImagePath}
                        alt={item.bookTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-blue-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-blue-900 line-clamp-2 leading-tight">
                      {item.bookTitle}
                    </h4>
                    <p className="text-sm text-blue-600 mt-1">by {item.bookAuthor}</p>
                    <Badge
                      variant="outline"
                      className="mt-2 text-xs border-blue-200 text-blue-700 bg-blue-50"
                    >
                      Added {formatDate(item.addedDate)}
                    </Badge>
                    {item.price != null && (
                      <p className="text-base font-semibold mt-2 text-blue-800">
                        ${item.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <Separator className="bg-blue-100" />
                  <div className="p-4 flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(item.wishlistId)}
                      disabled={removingIds.includes(item.wishlistId)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5"
                    >
                      {removingIds.includes(item.wishlistId)
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                      Remove
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item.bookId, item.wishlistId)}
                      disabled={addingIds.includes(item.wishlistId) || removingIds.includes(item.wishlistId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    >
                      {addingIds.includes(item.wishlistId)
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <ShoppingCart className="h-4 w-4" />}
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-blue-200 rounded-xl bg-blue-50/50">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Your wishlist is empty</h3>
            <p className="text-blue-600 mt-1 max-w-sm mx-auto text-sm">
              Browse books and tap the heart icon to save them here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                onClick={() => (window.location.href = "/book")}
              >
                <BookOpen className="h-4 w-4" /> Browse Books
              </Button>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-2"
                onClick={() => (window.location.href = "/profile")}
              >
                <ShoppingCart className="h-4 w-4" /> View Orders
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}