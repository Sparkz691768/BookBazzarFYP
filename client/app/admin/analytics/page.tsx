"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, BookOpen, ShoppingBag, ArrowUpRight } from "lucide-react"
import DataCharts from "../components/DataCharts"
import axios from "axios"
import { isAuthenticated } from "@/lib/auth"

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    books: 0,
    orders: 0,
    revenue: 0,
    members: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        
        const [booksRes, ordersRes, usersRes] = await Promise.all([
          axios.get("https://localhost:7265/api/Book/GetBooks", { headers }),
          axios.get("https://localhost:7265/api/Librarian/GetOrders", { headers }),
          axios.get("https://localhost:7265/get-all-users", { headers })
        ])

        const books = booksRes.data || []
        const orders = ordersRes.data || []
        const members = usersRes.data || []
        const totalRevenue = orders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0)

        setStats({
          books: books.length,
          orders: orders.length,
          revenue: totalRevenue,
          members: members.length
        })
      } catch (error) {
        console.error("Error fetching analytics stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time performance metrics and data visualizations.</p>
        </div>
        <div className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Live Data
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Revenue" value={`Rs. ${stats.revenue}`} icon={TrendingUp} trend="+12.5%" loading={loading} />
        <StatCard title="Active Members" value={stats.members.toString()} icon={Users} trend="+8.2%" loading={loading} />
        <StatCard title="Books in Library" value={stats.books.toString()} icon={BookOpen} trend="+4.1%" loading={loading} />
        <StatCard title="Total Orders" value={stats.orders.toString()} icon={ShoppingBag} trend="+15.3%" loading={loading} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Visual Data Analysis
        </h2>
        <DataCharts />
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, trend, loading }: any) {
  return (
    <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              {trend} <span className="text-muted-foreground font-normal">from last month</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
