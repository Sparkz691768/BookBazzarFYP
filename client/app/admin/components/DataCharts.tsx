"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line,
} from "recharts"
import { Loader2 } from "lucide-react"

const BOOK_API  = "https://localhost:7265/api/Book/GetBooks"
const ORDER_API = "https://localhost:7265/api/Librarian/GetOrders"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Book {
  bookId: string
  title: string
  author: string
  genre: string
  language: string
  price: number
  offerPrice: number | null
  stock: number
  coverImagePath: string | null
  sellerId: string
  sellerName: string
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
  orderStatus: number
  claimCode: string
  orderItems: OrderItem[]
}

// ── Palette ────────────────────────────────────────────────────────────────────

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#06b6d4", "#f97316"]

// ── Shared chart card wrapper ──────────────────────────────────────────────────

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-800">{title}</CardTitle>
        {description && <CardDescription className="text-xs text-gray-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  )
}

function ChartLoader() {
  return (
    <div className="h-[260px] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
    </div>
  )
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="h-[260px] flex items-center justify-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

// ── Chart wrapper that guarantees Recharts gets a real size ────────────────────

function ChartWrapper({ children }: { children: React.ReactNode }) {
  return (
    // position:relative + explicit px height + minHeight:0 ensures
    // ResponsiveContainer can always measure a positive width/height.
    <div style={{ position: "relative", width: "100%", height: 260, minHeight: 0 }}>
      {children}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function DataCharts() {
  const [books, setBooks]   = useState<Book[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { accept: "*/*", Authorization: `Bearer ${token}` }
        const [bRes, oRes] = await Promise.all([
          fetch(BOOK_API,  { headers }),
          fetch(ORDER_API, { headers }),
        ])
        if (bRes.ok) setBooks(await bRes.json())
        if (oRes.ok) setOrders(await oRes.json())
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived data ─────────────────────────────────────────────────────────────

  const genreData = React.useMemo(() => {
    const counts: Record<string, number> = {}
    books.forEach(b => { if (b.genre) counts[b.genre] = (counts[b.genre] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [books])

  const priceData = React.useMemo(() => {
    const ranges = [
      { label: "0-200",   min: 0,   max: 200       },
      { label: "201-400", min: 201, max: 400        },
      { label: "401-600", min: 401, max: 600        },
      { label: "601+",    min: 601, max: Infinity   },
    ]
    return ranges.map(r => ({
      range: r.label,
      books: books.filter(b => b.price >= r.min && b.price <= r.max).length,
    }))
  }, [books])

  const statusData = React.useMemo(() => {
    const labels: Record<number, string> = { 0: "Pending", 1: "Completed", 2: "Cancelled", 3: "Refunded" }
    const counts: Record<string, number> = {}
    orders.forEach(o => {
      const key = labels[o.orderStatus] ?? "Unknown"
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({ status, count }))
  }, [orders])

  const revenueData = React.useMemo(() => {
    const byDate: Record<string, number> = {}
    orders.forEach(o => {
      const date = new Date(o.checkedOutTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      byDate[date] = (byDate[date] || 0) + o.totalAmount
    })
    return Object.entries(byDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [orders])

  const stockData = React.useMemo(() => {
    return [...books]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 6)
      .map(b => ({
        title: b.title.length > 14 ? b.title.slice(0, 14) + "…" : b.title,
        stock: b.stock,
      }))
  }, [books])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

      {/* Genre Distribution — pie */}
      <ChartCard title="Genre Distribution" description="Books by genre" className="xl:col-span-1">
        {loading ? <ChartLoader /> : genreData.length === 0 ? <ChartEmpty message="No genre data" /> : (
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genreData} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {genreData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </ChartCard>

      {/* Revenue Over Time — line */}
      <ChartCard title="Revenue Over Time" description="Daily order revenue (Rs.)" className="xl:col-span-2">
        {loading ? <ChartLoader /> : revenueData.length === 0 ? <ChartEmpty message="No revenue data" /> : (
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip prefix="Rs. " />} />
                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </ChartCard>

      {/* Order Status — bar */}
      <ChartCard title="Order Status" description="Count by status" className="xl:col-span-1">
        {loading ? <ChartLoader /> : statusData.length === 0 ? <ChartEmpty message="No order data" /> : (
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Orders">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.status === "Completed" ? "#10b981" :
                      entry.status === "Pending"   ? "#f59e0b" :
                      entry.status === "Cancelled" ? "#ef4444" : "#8b5cf6"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </ChartCard>

      {/* Price Range Distribution — bar */}
      <ChartCard title="Price Distribution" description="Books by price range (Rs.)" className="xl:col-span-2">
        {loading ? <ChartLoader /> : priceData.length === 0 ? <ChartEmpty message="No price data" /> : (
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="books" name="Books" radius={[6, 6, 0, 0]}>
                  {priceData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </ChartCard>

      {/* Stock Levels — horizontal bar */}
      <ChartCard title="Top Stock Levels" description="Top 6 books by available stock" className="xl:col-span-2">
        {loading ? <ChartLoader /> : stockData.length === 0 ? <ChartEmpty message="No stock data" /> : (
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="title" tick={{ fontSize: 10 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="stock" name="Stock" radius={[0, 6, 6, 0]}>
                  {stockData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </ChartCard>

    </div>
  )
}