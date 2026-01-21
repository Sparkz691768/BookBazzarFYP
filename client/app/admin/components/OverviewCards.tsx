"use client"

import { useEffect, useState } from "react"
import { Book, Users, BookCopy, TrendingUp, DollarSign, ShoppingBag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

interface User {
  id: string
  name: string
  email: string
  emailConfirmed: boolean
  roles: string[]
}

interface Book {
  bookId: string
  title: string
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
  orderItems: OrderItem[]
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-200">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] -translate-y-6 translate-x-6 ${accent}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${accent} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${accent.replace("bg-", "text-")}`} />
        </div>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function OverviewCards() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [monthlyGrowth, setMonthlyGrowth] = useState(0)
  const [totalBooksSold, setTotalBooksSold] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        const authHeaders = { accept: "*/*", Authorization: `Bearer ${token}` }

        const [usersRes, booksRes, ordersRes] = await Promise.all([
          fetch("https://localhost:7265/get-all-users", { headers: authHeaders }),
          fetch("https://localhost:7265/api/Book/GetBooks", { headers: authHeaders }),
          fetch("https://localhost:7265/api/Librarian/GetOrders", { headers: authHeaders }),
        ])

        if (!usersRes.ok) throw new Error("Failed to fetch users")
        if (!booksRes.ok) throw new Error("Failed to fetch books")
        if (!ordersRes.ok) throw new Error("Failed to fetch orders")

        const usersData: User[] = await usersRes.json()
        const booksData: Book[] = await booksRes.json()
        const ordersData: Order[] = await ordersRes.json()

        setUsers(usersData)
        setBooks(booksData)
        setOrders(ordersData)

        // Revenue
        const revenue = ordersData.reduce((sum, o) => sum + o.totalAmount, 0)
        setTotalRevenue(revenue)

        // Books sold
        const sold = ordersData.reduce(
          (sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0),
          0
        )
        setTotalBooksSold(sold)

        // Monthly growth
        const now = new Date()
        const cm = now.getMonth(), cy = now.getFullYear()
        const lm = cm === 0 ? 11 : cm - 1
        const ly = cm === 0 ? cy - 1 : cy

        const currentRev = ordersData
          .filter(o => { const d = new Date(o.checkedOutTime); return d.getMonth() === cm && d.getFullYear() === cy })
          .reduce((s, o) => s + o.totalAmount, 0)
        const lastRev = ordersData
          .filter(o => { const d = new Date(o.checkedOutTime); return d.getMonth() === lm && d.getFullYear() === ly })
          .reduce((s, o) => s + o.totalAmount, 0)

        setMonthlyGrowth(lastRev === 0 ? 100 : ((currentRev - lastRev) / lastRev) * 100)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const completedOrders = orders.filter(o => o.orderStatus === 1).length

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard title="Total Books"    value={books.length}             subtitle="In catalogue"            icon={Book}       accent="bg-violet-500" />
      <StatCard title="Members"        value={users.length}             subtitle={`${users.filter(u => u.emailConfirmed).length} verified`} icon={Users} accent="bg-sky-500" />
      <StatCard title="Total Orders"   value={orders.length}            subtitle={`${completedOrders} completed`}  icon={BookCopy}   accent="bg-blue-500" />
      <StatCard title="Books Sold"     value={totalBooksSold}           subtitle="Total copies"            icon={ShoppingBag} accent="bg-amber-500" />
      <StatCard title="Revenue"        value={`Rs. ${totalRevenue.toLocaleString()}`} subtitle="Lifetime earnings" icon={DollarSign} accent="bg-rose-500" />
      <StatCard
        title="Monthly Growth"
        value={`${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth.toFixed(1)}%`}
        subtitle="vs last month"
        icon={TrendingUp}
        accent={monthlyGrowth >= 0 ? "bg-blue-500" : "bg-red-500"}
      />
    </div>
  )
}