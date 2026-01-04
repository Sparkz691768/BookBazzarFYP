"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  Clock,
  ShoppingBag,
  AlertCircle,
  BookOpen,
  CreditCard,
  CheckCircle2,
  XCircle,
  WalletCards,
} from "lucide-react"
import axios from "axios"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { OrderReceipt } from "./OrderReceipt"

interface OrderItem {
  orderItemId: string
  bookId: string
  bookTitle: string
  bookPrice: number
  quantity: number
  totalPrice: number
}

interface Order {
  orderId: string
  totalAmount: number
  checkedOutTime: string
  orderStatus: number // 0: Pending, 1: Completed, 2: Cancelled, 3: Refunded
  orderItems: OrderItem[]
}

interface PaymentStatus {
  paymentId: string
  orderId: string
  amount: number
  paymentStatus: string // "Pending" | "Paid"
  transactionCode: string | null
  refId: string | null
  createdAt: string
  paidAt: string | null
}

const API_BASE = "https://localhost:7265"

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null)
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, PaymentStatus | null>>({})
  const [loadingPaymentIds, setLoadingPaymentIds] = useState<string[]>([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem("userId")
      if (!userId) throw new Error("User not found")

      const response = await axios.get(`${API_BASE}/api/Cart/ViewOrders/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "*/*",
        },
      })
      setOrders(response.data || [])
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load your orders. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentStatus = async (orderId: string) => {
    if (paymentStatuses[orderId] !== undefined) return // already fetched
    const userId = localStorage.getItem("userId")
    if (!userId) return

    setLoadingPaymentIds((prev) => [...prev, orderId])
    try {
      const res = await axios.get(
        `${API_BASE}/api/Payment/GetPaymentStatus/${orderId}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            accept: "*/*",
          },
        }
      )
      setPaymentStatuses((prev) => ({ ...prev, [orderId]: res.data }))
    } catch {
      // 404 = no payment record yet — that's fine
      setPaymentStatuses((prev) => ({ ...prev, [orderId]: null }))
    } finally {
      setLoadingPaymentIds((prev) => prev.filter((id) => id !== orderId))
    }
  }

  const toggleOrderExpand = (orderId: string) => {
    const isOpening = !expandedOrders.includes(orderId)
    setExpandedOrders((prev) =>
      isOpening ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    )
    if (isOpening) fetchPaymentStatus(orderId)
  }

  const getOrderStatus = (status: number): string => {
    switch (status) {
      case 0: return "pending"
      case 1: return "completed"
      case 2: return "cancelled"
      case 3: return "refunded"
      default: return "pending"
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      refunded: "bg-blue-50 text-blue-700 border-blue-200",
    }
    return (
      <Badge variant="outline" className={`${styles[status]} font-medium capitalize`}>
        {status}
      </Badge>
    )
  }

  const getPaymentBadge = (ps: PaymentStatus | null | undefined, isLoading: boolean) => {
    if (isLoading) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Checking...
        </span>
      )
    }
    if (!ps) {
      return (
        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-xs">
          No payment record
        </Badge>
      )
    }
    if (ps.paymentStatus === "Paid") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
          <CheckCircle2 className="h-3 w-3" /> Paid
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
        <WalletCards className="h-3 w-3" /> Payment Pending
      </Badge>
    )
  }

  const getProgressValue = (status: number): number => {
    switch (status) {
      case 0: return 25
      case 1: return 100
      default: return 0
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })

  // =====================================================
  // ESEWA PAYMENT
  // =====================================================
  const handlePayNow = async (order: Order) => {
    try {
      setPayingOrderId(order.orderId)
      const userId = localStorage.getItem("userId")
      if (!userId) { toast.error("User not found. Please log in again."); return }

      const response = await axios.post(
        `${API_BASE}/api/Payment/InitiatePayment/${order.orderId}/${userId}`,
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, accept: "*/*" } }
      )

      const { paymentUrl, formFields } = response.data

      const form = document.createElement("form")
      form.method = "POST"
      form.action = paymentUrl
      Object.entries(formFields).forEach(([key, value]) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = key
        input.value = String(value)
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data || "Failed to initiate payment. Please try again.")
      } else {
        toast.error("An unexpected error occurred.")
      }
    } finally {
      setPayingOrderId(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await axios.put(`${API_BASE}/api/Cart/CancelOrder/${orderId}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, accept: "*/*" },
      })
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: 2 } : o))
      )
      toast.success("Order cancelled successfully")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) toast.error("Order not found")
        else if (err.response?.status === 401) toast.error("Unauthorized. Please log in again")
        else toast.error(err.response?.data || "Failed to cancel order")
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handlePrintReceipt = (order: Order) => {
    const receiptWindow = window.open("", "_blank")
    if (receiptWindow) {
      receiptWindow.document.write("<html><head><title>Order Receipt</title>")
      receiptWindow.document.write(
        "<link href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;500;600;700&display=swap' rel='stylesheet'>"
      )
      receiptWindow.document.write("</head><body>")
      receiptWindow.document.write(document.getElementById(`receipt-${order.orderId}`)?.innerHTML || "")
      receiptWindow.document.write("</body></html>")
      receiptWindow.document.close()
      receiptWindow.focus()
      setTimeout(() => receiptWindow.print(), 500)
    } else {
      toast.error("Unable to open print window. Please check your popup blocker settings.")
    }
  }

  const handleDownloadReceipt = (order: Order) => {
    const receiptHtml = document.getElementById(`receipt-${order.orderId}`)?.innerHTML
    if (!receiptHtml) return
    const blob = new Blob(
      [`<html><head><title>Order Receipt #${order.orderId.slice(0, 8)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head><body>${receiptHtml}</body></html>`],
      { type: "text/html" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Order-Receipt-${order.orderId.slice(0, 8)}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderPaymentDetails = (orderId: string) => {
    const isLoading = loadingPaymentIds.includes(orderId)
    const ps = paymentStatuses[orderId]

    return (
      <div className="mt-5 pt-4 border-t">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <WalletCards className="h-4 w-4" />
          Payment Details
        </h4>
        <div className="rounded-lg border bg-slate-50 dark:bg-slate-900 p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment status</span>
            {getPaymentBadge(ps, isLoading)}
          </div>

          {ps && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono text-xs">{ps.paymentId.slice(0, 12)}…</span>
              </div>
              {ps.transactionCode && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction UUID</span>
                  <span className="font-mono text-xs">{ps.transactionCode}</span>
                </div>
              )}
              {ps.refId && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">eSewa Ref ID</span>
                  <span className="font-mono text-xs text-green-700">{ps.refId}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Initiated</span>
                <span>{formatDateTime(ps.createdAt)}</span>
              </div>
              {ps.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid at</span>
                  <span className="text-green-700 font-medium">{formatDateTime(ps.paidAt)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const renderActionButtons = (order: Order) => {
    const isLoading = cancellingOrderId === order.orderId
    const isPaying = payingOrderId === order.orderId
    const isPending = order.orderStatus === 0

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {isPending && (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={() => handlePayNow(order)}
            disabled={isPaying}
          >
            {isPaying ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to eSewa…</>
            ) : (
              <><CreditCard className="h-4 w-4" /> Pay with eSewa</>
            )}
          </Button>
        )}

        {isPending && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={isLoading || isPaying}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Cancelling…</>
                ) : "Cancel Order"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this order? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setCancellingOrderId(order.orderId)
                    await handleCancelOrder(order.orderId)
                    setCancellingOrderId(null)
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, cancel order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {order.orderStatus === 1 && (
          <>
            <Button
              variant="outline" size="sm"
              className="text-primary border-primary/20 hover:bg-primary/10"
              onClick={() => handlePrintReceipt(order)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" />
              </svg>
              Print Receipt
            </Button>
            <Button
              variant="outline" size="sm"
              className="text-primary border-primary/20 hover:bg-primary/10"
              onClick={() => handleDownloadReceipt(order)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download Receipt
            </Button>
          </>
        )}
      </div>
    )
  }

  // =====================================================
  // LOADING / ERROR STATES
  // =====================================================
  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Package className="h-6 w-6" /> My Orders
          </CardTitle>
          <CardDescription>View your order history and track your packages</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your orders…</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Package className="h-6 w-6" /> My Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">Unable to load orders</h3>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-2xl flex items-center gap-2 text-primary">
          <Package className="h-6 w-6" /> My Orders
        </CardTitle>
        <CardDescription>View your order history and track your packages</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrders.includes(order.orderId)
              const ps = paymentStatuses[order.orderId]
              const isPaymentLoading = loadingPaymentIds.includes(order.orderId)

              return (
                <Collapsible
                  key={order.orderId}
                  open={isExpanded}
                  onOpenChange={() => toggleOrderExpand(order.orderId)}
                  className="border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md"
                >
                  {/* Order header */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">Order #{order.orderId.slice(0, 8)}</h3>
                        {getStatusBadge(getOrderStatus(order.orderStatus))}
                        {order.orderStatus === 0 && (
                          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                            Payment required
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> {formatDate(order.checkedOutTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {formatTime(order.checkedOutTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4" />
                          {order.orderItems.length} {order.orderItems.length === 1 ? "item" : "items"}
                        </div>
                        {/* Inline payment status pill in header */}
                        {isExpanded && (
                          <div className="flex items-center gap-1">
                            {getPaymentBadge(ps, isPaymentLoading)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                        <div className="text-xl font-bold text-primary">Rs. {order.totalAmount.toFixed(2)}</div>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline" size="icon"
                          className="h-9 w-9 rounded-full border-primary/20 text-primary hover:bg-primary/10"
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {order.orderStatus !== 2 && order.orderStatus !== 3 && (
                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex justify-between mb-1 text-xs font-medium">
                        <span>Order Placed</span>
                        <span>{order.orderStatus === 0 ? "Awaiting Payment" : "Completed"}</span>
                      </div>
                      <Progress value={getProgressValue(order.orderStatus)} className="h-2" />
                    </div>
                  )}

                  {/* Expanded body */}
                  <CollapsibleContent>
                    <div className="p-5 bg-white dark:bg-slate-950">
                      {/* Items */}
                      <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Order Items
                      </h4>
                      <div className="space-y-4 divide-y">
                        {order.orderItems.map((item) => (
                          <div key={item.orderItemId} className="flex justify-between items-center pt-4 first:pt-0">
                            <div className="flex-1">
                              <div className="font-medium">{item.bookTitle}</div>
                              <div className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Rs. {item.bookPrice.toFixed(2)} each</div>
                              <div className="font-bold text-primary">Rs. {item.totalPrice.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order total */}
                      <div className="mt-6 pt-4 border-t flex justify-between items-center">
                        <span className="font-medium">Order Total</span>
                        <span className="text-lg font-bold text-primary">Rs. {order.totalAmount.toFixed(2)}</span>
                      </div>

                      {/* Payment details section */}
                      {renderPaymentDetails(order.orderId)}

                      {/* Pending notice */}
                      {order.orderStatus === 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>
                            Your order is placed but payment is pending. Click{" "}
                            <strong>Pay with eSewa</strong> to complete your purchase.
                          </span>
                        </div>
                      )}

                      {/* Paid success notice */}
                      {order.orderStatus === 1 && ps?.paymentStatus === "Paid" && (
                        <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>
                            Payment confirmed via eSewa
                            {ps.refId && <> · Ref: <strong className="font-mono">{ps.refId}</strong></>}.
                          </span>
                        </div>
                      )}

                      {renderActionButtons(order)}

                      <div className="hidden">
                        <OrderReceipt order={order} id={`receipt-${order.orderId}`} />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You haven't placed any orders yet. Browse our collection and find your next favourite book!
            </p>
            <Button className="px-6 py-2 h-auto" onClick={() => (window.location.href = "/books")}>
              Browse Books
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}