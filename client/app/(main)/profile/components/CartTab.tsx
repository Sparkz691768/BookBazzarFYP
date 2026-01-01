"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ShoppingCart, Trash2, Loader2, Plus, Minus,
  CreditCard, BookOpen, RefreshCw, Calendar, PackageOpen,
} from "lucide-react"
import axios from "axios"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { getUserId } from "@/lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  cartItemId: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  coverImagePath: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  sellerId: string
  addedDate: string
}

interface CartTabProps {
  userId: string
  userDetails: {
    name: string
    email: string
    address: string
    contactNo: string
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token")

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const SHIPPING = 5

// ─── Component ────────────────────────────────────────────────────────────────

export function CartTab({ userId, userDetails }: CartTabProps) {
  const [cartItems, setCartItems]         = useState<CartItem[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [removingIds, setRemovingIds]     = useState<string[]>([])
  const [updatingIds, setUpdatingIds]     = useState<string[]>([])
  const [processingCheckout, setCheckout] = useState(false)
  const [refreshing, setRefreshing]       = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!userId) { setError("User ID not available"); return }

      const res = await axios.get<CartItem[]>(
        `https://localhost:7265/api/Cart/ViewCart/${userId}`,
        { headers: { Authorization: `Bearer ${getToken()}`, accept: "*/*" } },
      )
      setCartItems(res.data || [])
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // 404 just means empty cart — not a real error
        if (err.response?.status === 404) {
          setCartItems([])
        } else {
          setError(err.response?.data?.message || "Failed to load your cart")
        }
      } else {
        setError("Failed to load your cart. Please try again.")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchCart() }, [userId])

  const handleRefresh = () => { setRefreshing(true); fetchCart() }

  // ── Remove ─────────────────────────────────────────────────────────────────

  const handleRemove = async (cartItemId: string) => {
    try {
      setRemovingIds((p) => [...p, cartItemId])
      await axios.delete(`https://localhost:7265/api/Cart/RemoveFromCart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${getToken()}`, accept: "*/*" },
      })
      setCartItems((p) => p.filter((i) => i.cartItemId !== cartItemId))
      toast.success("Item removed from cart")
    } catch {
      toast.error("Failed to remove item from cart")
    } finally {
      setRemovingIds((p) => p.filter((id) => id !== cartItemId))
    }
  }

  // ── Update quantity ────────────────────────────────────────────────────────

  const handleUpdateQty = async (cartItemId: string, newQty: number) => {
  if (newQty < 1) return

  const item = cartItems.find(i => i.cartItemId === cartItemId)
  if (!item) return

  try {
    setUpdatingIds(p => [...p, cartItemId])

    await axios.put(
      "https://localhost:7265/api/Cart/UpdateCartItem",
      {
        cartItemId: item.cartItemId,
        bookId: item.bookId,
        quantity: newQty,
        sellerId: item.sellerId ?? "",
        userId: userId
      },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          accept: "*/*"
        }
      }
    )

    // refresh from server to avoid wrong totals
    await fetchCart()
    toast.success("Quantity updated")
  } catch (err) {
    toast.error("Failed to update quantity")
  } finally {
    setUpdatingIds(p => p.filter(id => id !== cartItemId))
  }
}

  // ── Checkout ───────────────────────────────────────────────────────────────

  const handleCheckout = async () => {
    try {
      setCheckout(true)
      setError(null)
      const res = await axios.post(
        `https://localhost:7265/api/Cart/Checkout/${userId}`,
        null,
        { headers: { Authorization: `Bearer ${getToken()}`, accept: "*/*" } },
      )
      if (res.status === 200) {
        setCartItems([])
        toast.success("Order placed! Check your email for confirmation.")
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data || "Failed to process checkout"
        toast.error(msg)
        setError(msg)
      } else {
        toast.error("Failed to process checkout. Please try again.")
      }
    } finally {
      setCheckout(false)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const subtotal = cartItems.reduce((s, i) => s + i.totalPrice, 0)
  const total    = subtotal + SHIPPING

  // ── Shared card header ─────────────────────────────────────────────────────

  const Header = ({ showRefresh = false }: { showRefresh?: boolean }) => (
    <CardHeader className="border-b pb-5 flex flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ShoppingCart className="h-6 w-6 text-primary" /> My Cart
        </CardTitle>
        <CardDescription className="mt-0.5">
          {loading
            ? "Loading your cart…"
            : cartItems.length > 0
            ? `${cartItems.length} ${cartItems.length === 1 ? "book" : "books"} in your cart`
            : "Your cart is empty"}
        </CardDescription>
      </div>
      {showRefresh && (
        <Button
          variant="ghost" size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-1.5 text-slate-500"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      )}
    </CardHeader>
  )

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) return (
    <Card className="shadow-sm border-0 bg-white">
      <Header />
      <CardContent className="flex flex-col justify-center items-center py-24 gap-3 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="text-sm">Loading your cart…</p>
      </CardContent>
    </Card>
  )

  // ── Error ──────────────────────────────────────────────────────────────────

  if (error) return (
    <Card className="shadow-sm border-0 bg-white">
      <Header />
      <CardContent className="py-8">
        <div className="text-center py-10 px-4 bg-red-50 rounded-xl border border-red-100 max-w-sm mx-auto">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-7 w-7 text-red-400" />
          </div>
          <p className="text-red-700 font-semibold mb-1">Something went wrong</p>
          <p className="text-red-500 text-sm mb-5">{error}</p>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // ── Empty cart ─────────────────────────────────────────────────────────────

  if (cartItems.length === 0) return (
    <Card className="shadow-sm border-0 bg-white">
      <Header />
      <CardContent className="py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center py-14 px-6 max-w-sm mx-auto"
        >
          {/* Illustration */}
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center">
              <PackageOpen className="h-14 w-14 text-slate-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border-2 border-white">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Looks like you haven't added any books yet. Browse our collection and find something you'll love!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button
              size="lg"
              className="gap-2 rounded-xl px-6"
              onClick={() => (window.location.href = "/book")}
            >
              <BookOpen className="h-5 w-5" />
              Browse Books
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 rounded-xl px-6 border-slate-200 text-slate-600"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )

  // ── Cart with items ────────────────────────────────────────────────────────

  return (
    <Card className="shadow-sm border-0 bg-white overflow-hidden">
      <Header showRefresh />

      <CardContent className="p-6 space-y-8">

        {/* Items list */}
        <div className="space-y-4">
          <AnimatePresence>
            {cartItems.map((item, i) => (
              <motion.div
                key={item.cartItemId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="flex flex-col sm:flex-row gap-4 border border-slate-100 rounded-xl p-5 bg-white hover:shadow-md transition-shadow duration-200"
              >
                {/* Cover */}
                <div className="flex-shrink-0 w-14 h-20 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                  {item.coverImagePath ? (
                    <img
                      src={item.coverImagePath}
                      alt={item.bookTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  ) : (
                    <BookOpen className="h-6 w-6 text-slate-300" />
                  )}
                </div>

                {/* Info + controls */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 leading-tight">{item.bookTitle}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">by {item.bookAuthor}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Added {formatDate(item.addedDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Unit price */}
                    <div className="text-sm text-slate-500">
                      Unit: <span className="font-semibold text-slate-800">{fmt(item.unitPrice)}</span>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline" size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleUpdateQty(item.cartItemId, item.quantity - 1)}
                        disabled={updatingIds.includes(item.cartItemId) || item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number" min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQty(item.cartItemId, Number(e.target.value) || 1)}
                        className="w-12 h-7 text-center text-sm rounded-md px-1"
                        disabled={updatingIds.includes(item.cartItemId)}
                      />
                      <Button
                        variant="outline" size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleUpdateQty(item.cartItemId, item.quantity + 1)}
                        disabled={updatingIds.includes(item.cartItemId)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      {updatingIds.includes(item.cartItemId) && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                      )}
                    </div>

                    {/* Row total */}
                    <div className="text-sm text-slate-500">
                      Total: <span className="font-bold text-slate-900 text-base">{fmt(item.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <div className="flex sm:flex-col justify-end">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleRemove(item.cartItemId)}
                    disabled={removingIds.includes(item.cartItemId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1"
                  >
                    {removingIds.includes(item.cartItemId)
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                    Remove
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-4">Order Summary</h3>
          <div className="space-y-2.5 text-sm">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-slate-500">
                <span className="truncate max-w-[60%]">{item.bookTitle} × {item.quantity}</span>
                <span>{fmt(item.totalPrice)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span><span className="font-medium">{fmt(SHIPPING)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>
        </div>

      </CardContent>

      <CardFooter className="bg-white border-t p-6">
        <Button
          className="w-full py-6 h-auto text-base rounded-xl gap-2 shadow-md hover:shadow-lg transition-all"
          size="lg"
          onClick={handleCheckout}
          disabled={processingCheckout}
        >
          {processingCheckout ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Processing your order…</>
          ) : (
            <><CreditCard className="h-5 w-5" /> Proceed to Checkout · {fmt(total)}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}