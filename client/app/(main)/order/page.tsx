"use client"

import type React from "react"
import { Fragment, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown, ChevronUp, Package, CheckCircle, XCircle,
  RefreshCw, Info, Loader2, WalletCards, CheckCircle2,
  AlertCircle, CreditCard,
} from "lucide-react"
import { toast } from "react-toastify"

const API_BASE = "https://localhost:7265"

enum OrderStatus {
  Pending = 0,
  Completed = 1,
  Cancelled = 2,
  Refunded = 3,
}

const orderStatusConfig = {
  [OrderStatus.Pending]: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  [OrderStatus.Completed]: { label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
  [OrderStatus.Cancelled]: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
  [OrderStatus.Refunded]: { label: "Refunded", color: "bg-blue-100 text-blue-800 border-blue-200" },
}

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
  userId: string
  totalAmount: number
  checkedOutTime: string
  orderStatus: OrderStatus
  claimCode: string
  orderItems: OrderItem[]
}

interface PaymentRecord {
  paymentId: string
  orderId: string
  userId: string
  amount: number
  paymentStatus: string  // "Pending" | "Paid"
  transactionCode: string | null
  refId: string | null
  createdAt: string
  paidAt: string | null
  orderStatus: string
  claimCode: string
}

export default function LibrarianOrdersPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false)
  const [statusUpdateDetails, setStatusUpdateDetails] = useState<{ orderId: string; newStatus: OrderStatus }>({
    orderId: "", newStatus: OrderStatus.Pending,
  })
  const [claimCode, setClaimCode] = useState("")

  // Payment status state
  const [paymentRecords, setPaymentRecords] = useState<Record<string, PaymentRecord | null>>({})
  const [loadingPaymentIds, setLoadingPaymentIds] = useState<string[]>([])
  const [paymentViewOrder, setPaymentViewOrder] = useState<Order | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem("userId")
    setUserId(id)
    fetchOrders(id)
  }, [])

  const fetchOrders = async (id?: string | null) => {
    const targetUserId = id || userId
    if (!targetUserId) {
      setLoading(false)
      return
    }
    try {
      const response = await fetch(`${API_BASE}/api/Cart/GetOrdersBySeller/${targetUserId}`)
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error("Error fetching orders:", err)
      toast.error("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentRecord = async (orderId: string) => {
    if (paymentRecords[orderId] !== undefined) return  // already fetched
    setLoadingPaymentIds((prev) => [...prev, orderId])
    try {
      const res = await fetch(`${API_BASE}/api/Librarian/GetPaymentByOrder/${orderId}`)
      if (res.status === 404) {
        setPaymentRecords((prev) => ({ ...prev, [orderId]: null }))
        return
      }
      if (!res.ok) throw new Error("Failed to fetch payment")
      const data: PaymentRecord = await res.json()
      setPaymentRecords((prev) => ({ ...prev, [orderId]: data }))
    } catch {
      setPaymentRecords((prev) => ({ ...prev, [orderId]: null }))
    } finally {
      setLoadingPaymentIds((prev) => prev.filter((id) => id !== orderId))
    }
  }

  const openPaymentDialog = async (order: Order) => {
    setPaymentViewOrder(order)
    setIsPaymentDialogOpen(true)
    await fetchPaymentRecord(order.orderId)
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true
    return order.orderStatus.toString() === activeTab
  })

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, code: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/Librarian/UpdateOrderStatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, claimCode: code.trim(), orderStatus: newStatus }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to update order status"
        try {
          const errorJson = await response.json()
          errorMessage = errorJson.message || errorMessage
        } catch {
          const text = await response.text()
          if (text) errorMessage = text
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setOrders((prev) =>
        prev.map((order) => order.orderId === orderId ? { ...order, orderStatus: newStatus } : order)
      )
      toast.success(result.message || "Order status updated successfully")
      setIsStatusUpdateDialogOpen(false)
    } catch (err) {
      console.error("Error updating order status:", err)
      toast.error(err instanceof Error ? err.message : "Failed to update order status.")
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
    fetchPaymentRecord(order.orderId)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const config = orderStatusConfig[status]
    return (
      <Badge variant="outline" className={`${config.color} font-medium`}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (orderId: string) => {
    const isLoading = loadingPaymentIds.includes(orderId)
    const pr = paymentRecords[orderId]

    if (isLoading) return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading…
      </span>
    )
    if (pr === undefined) return (
      <span className="text-xs text-muted-foreground">—</span>
    )
    if (pr === null) return (
      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-xs">No record</Badge>
    )
    if (pr.paymentStatus === "Paid") return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
        <CheckCircle2 className="h-3 w-3" /> Paid
      </Badge>
    )
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs gap-1">
        <WalletCards className="h-3 w-3" /> Pending
      </Badge>
    )
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return <Package className="h-4 w-4 text-yellow-600" />
      case OrderStatus.Completed: return <CheckCircle className="h-4 w-4 text-green-600" />
      case OrderStatus.Cancelled: return <XCircle className="h-4 w-4 text-red-600" />
      case OrderStatus.Refunded: return <RefreshCw className="h-4 w-4 text-blue-600" />
    }
  }

  const openStatusUpdateDialog = (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdateDetails({ orderId, newStatus })
    setClaimCode("")
    setIsStatusUpdateDialogOpen(true)
  }

  const handleStatusUpdateSubmit = () => {
    if (!claimCode.trim()) { toast.error("Claim code is required"); return }
    updateOrderStatus(statusUpdateDetails.orderId, statusUpdateDetails.newStatus, claimCode)
  }

  const tabCounts = {
    all: orders.length,
    "0": orders.filter((o) => o.orderStatus === 0).length,
    "1": orders.filter((o) => o.orderStatus === 1).length,
    "2": orders.filter((o) => o.orderStatus === 2).length,
    "3": orders.filter((o) => o.orderStatus === 3).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading orders…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <Button variant="outline" size="sm" onClick={() => fetchOrders()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          {[
            { value: "all", label: "All" },
            { value: "0", label: "Pending" },
            { value: "1", label: "Completed" },
            { value: "2", label: "Cancelled" },
            { value: "3", label: "Refunded" },
          ].map(({ value, label }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5">
              {label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                {tabCounts[value as keyof typeof tabCounts]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all"
                  ? "All Orders"
                  : `${orderStatusConfig[Number.parseInt(activeTab) as OrderStatus].label} Orders`}
              </CardTitle>
              <CardDescription>{filteredOrders.length} orders found</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-3">
                  <Package className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <Fragment key={order.orderId}>
                        <TableRow className="group">
                          {/* Expand toggle */}
                          <TableCell>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => toggleOrderExpansion(order.orderId)}
                              className="p-0 h-auto w-auto text-muted-foreground"
                            >
                              {expandedOrderId === order.orderId
                                ? <ChevronUp className="h-4 w-4" />
                                : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </TableCell>

                          {/* Order ID */}
                          <TableCell className="font-mono text-sm">
                            {order.orderId.substring(0, 8)}…
                          </TableCell>

                          {/* Date */}
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(order.checkedOutTime)}
                          </TableCell>

                          {/* Items count */}
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />
                              {order.orderItems.length}
                            </span>
                          </TableCell>

                          {/* Total */}
                          <TableCell className="font-semibold">
                            Rs. {order.totalAmount.toFixed(2)}
                          </TableCell>

                          {/* Order status */}
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(order.orderStatus)}
                              {getStatusBadge(order.orderStatus)}
                            </div>
                          </TableCell>

                          {/* Payment status — fetched on demand */}
                          <TableCell>
                            <div
                              className="cursor-pointer"
                              onMouseEnter={() => fetchPaymentRecord(order.orderId)}
                            >
                              {getPaymentBadge(order.orderId)}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline" size="sm"
                                onClick={() => viewOrderDetails(order)}
                                className="gap-1"
                              >
                                <Info className="h-3.5 w-3.5" /> Details
                              </Button>
                              <Button
                                variant="outline" size="sm"
                                onClick={() => openPaymentDialog(order)}
                                className="gap-1 text-green-700 border-green-200 hover:bg-green-50"
                              >
                                <CreditCard className="h-3.5 w-3.5" /> Payment
                              </Button>
                              <Select
                                onValueChange={(value) =>
                                  openStatusUpdateDialog(order.orderId, Number.parseInt(value))
                                }
                                value={order.orderStatus.toString()}
                              >
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="0">Pending</SelectItem>
                                  <SelectItem value="1">Completed</SelectItem>
                                  <SelectItem value="2">Cancelled</SelectItem>
                                  <SelectItem value="3">Refunded</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded order items */}
                        {expandedOrderId === order.orderId && (
                          <TableRow>
                            <TableCell colSpan={8}>
                              <div className="bg-muted/40 p-4 rounded-lg border">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Package className="h-4 w-4" /> Order Items
                                </h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Book Title</TableHead>
                                      <TableHead>Unit Price</TableHead>
                                      <TableHead>Qty</TableHead>
                                      <TableHead>Subtotal</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {order.orderItems.map((item) => (
                                      <TableRow key={item.orderItemId}>
                                        <TableCell className="font-medium">{item.bookTitle}</TableCell>
                                        <TableCell>Rs. {item.bookPrice.toFixed(2)}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell className="font-semibold">Rs. {item.totalPrice.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/30">
                                      <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                      <TableCell className="font-bold text-primary">
                                        Rs. {order.totalAmount.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="font-medium">Claim Code:</span>
                                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                                    {order.claimCode}
                                  </code>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ====================================================
          ORDER DETAILS DIALOG
      ==================================================== */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete information for this order</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6">
              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Order ID", value: <code className="font-mono text-xs">{selectedOrder.orderId}</code> },
                  { label: "User ID", value: <code className="font-mono text-xs">{selectedOrder.userId}</code> },
                  { label: "Date", value: formatDate(selectedOrder.checkedOutTime) },
                  { label: "Order Status", value: getStatusBadge(selectedOrder.orderStatus) },
                  { label: "Claim Code", value: <code className="font-mono">{selectedOrder.claimCode}</code> },
                  { label: "Payment", value: getPaymentBadge(selectedOrder.orderId) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-muted-foreground mb-1">{label}</p>
                    <div>{value}</div>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.orderItems.map((item) => (
                      <TableRow key={item.orderItemId}>
                        <TableCell>{item.bookTitle}</TableCell>
                        <TableCell>Rs. {item.bookPrice.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>Rs. {item.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                      <TableCell className="font-bold">Rs. {selectedOrder.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Update Status</p>
                  <Select
                    onValueChange={(value) =>
                      openStatusUpdateDialog(selectedOrder.orderId, Number.parseInt(value))
                    }
                    value={selectedOrder.orderStatus.toString()}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">Completed</SelectItem>
                      <SelectItem value="2">Cancelled</SelectItem>
                      <SelectItem value="3">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ====================================================
          PAYMENT DETAILS DIALOG
      ==================================================== */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Payment Details
            </DialogTitle>
            <DialogDescription>
              eSewa payment record for Order #{paymentViewOrder?.orderId.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {paymentViewOrder && (
            <>
              {loadingPaymentIds.includes(paymentViewOrder.orderId) ? (
                <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" /> Fetching payment data…
                </div>
              ) : paymentRecords[paymentViewOrder.orderId] === null ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">
                    No payment record found for this order.<br />
                    The user may not have initiated payment yet.
                  </p>
                </div>
              ) : paymentRecords[paymentViewOrder.orderId] ? (
                (() => {
                  const pr = paymentRecords[paymentViewOrder.orderId]!
                  const isPaid = pr.paymentStatus === "Paid"
                  return (
                    <div className="space-y-4">
                      {/* Status banner */}
                      <div className={`rounded-lg p-4 flex items-center gap-3 ${isPaid
                          ? "bg-green-50 border border-green-200"
                          : "bg-yellow-50 border border-yellow-200"
                        }`}>
                        {isPaid
                          ? <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                          : <WalletCards className="h-6 w-6 text-yellow-600 shrink-0" />
                        }
                        <div>
                          <p className={`font-semibold ${isPaid ? "text-green-700" : "text-yellow-700"}`}>
                            {isPaid ? "Payment Confirmed" : "Payment Pending"}
                          </p>
                          <p className={`text-sm ${isPaid ? "text-green-600" : "text-yellow-600"}`}>
                            {isPaid
                              ? `Paid on ${new Date(pr.paidAt!).toLocaleString()}`
                              : "Customer has not completed payment yet"}
                          </p>
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="rounded-lg border divide-y text-sm">
                        {[
                          { label: "Payment ID", value: <code className="font-mono text-xs">{pr.paymentId}</code> },
                          { label: "Amount", value: <span className="font-semibold">Rs. {pr.amount.toFixed(2)}</span> },
                          { label: "Payment Status", value: getPaymentBadge(paymentViewOrder.orderId) },
                          {
                            label: "Transaction UUID", value: pr.transactionCode
                              ? <code className="font-mono text-xs">{pr.transactionCode}</code>
                              : <span className="text-muted-foreground">—</span>
                          },
                          {
                            label: "eSewa Ref ID", value: pr.refId
                              ? <code className="font-mono text-xs text-green-700">{pr.refId}</code>
                              : <span className="text-muted-foreground">—</span>
                          },
                          { label: "Initiated At", value: formatDate(pr.createdAt) },
                          {
                            label: "Paid At", value: pr.paidAt
                              ? <span className="text-green-700 font-medium">{formatDate(pr.paidAt)}</span>
                              : <span className="text-muted-foreground">Not yet paid</span>
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-muted-foreground">{label}</span>
                            <div className="text-right">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" /> Loading…
                </div>
              )}
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ====================================================
          STATUS UPDATE DIALOG (claim code required)
      ==================================================== */}
      <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Enter the claim code to update to{" "}
              <strong>
                {statusUpdateDetails.newStatus !== undefined
                  ? orderStatusConfig[statusUpdateDetails.newStatus].label
                  : ""}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="claimCode" className="text-right text-sm font-medium">
                Claim Code
              </label>
              <input
                id="claimCode"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStatusUpdateSubmit()}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter claim code"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!claimCode.trim()} onClick={handleStatusUpdateSubmit}>
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}