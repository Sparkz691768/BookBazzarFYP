"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  isAuthenticated,
  getUserId,
  getUserRole,
  logout,
  getAuthHeaders,
} from "@/lib/auth"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { toast, ToastContainer } from "react-toastify"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  Loader2,
  Shield,
  Calendar,
  User,
  Lock,
  Heart,
  ShoppingCart,
  Package,
  BookOpen,
} from "lucide-react"

import { UserDetailsTab } from "./components/UserDetailsTab"
import { PasswordTab } from "./components/PasswordTab"
import { WishlistTab } from "./components/WishlistTab"
import { CartTab } from "./components/CartTab"
import { OrdersTab } from "./components/OrdersTab"
import Image from "next/image"

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE = "https://localhost:7265"

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserDetails {
  id?: string
  name: string
  email: string
  address: string
  contactNo: string
  profileImageUrl?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Reads role from localStorage and normalises capitalisation */
const readRole = (): string => {
  const r = getUserRole()
  if (!r) return "User"
  return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()
}

/** Inline SVG avatar used as fallback — no placeholder file needed */
const makeFallbackAvatar = (initial: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112'%3E` +
  `%3Crect width='112' height='112' fill='%23d1fae5'/%3E` +
  `%3Ctext x='56' y='74' font-size='48' text-anchor='middle' fill='%23065f46' font-family='sans-serif'%3E` +
  `${encodeURIComponent(initial.toUpperCase())}%3C/text%3E%3C/svg%3E`

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { value: "details", label: "Profile", Icon: User },
  { value: "password", label: "Password", Icon: Lock },
  { value: "wishlist", label: "Wishlist", Icon: Heart },
  { value: "cart", label: "Cart", Icon: ShoppingCart },
  { value: "orders", label: "Orders", Icon: Package },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function Profile() {
  const router = useRouter()

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [role, setRole] = useState<string>("User")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [isDeleting, setIsDeleting] = useState(false)

  // ── Fetch user ───────────────────────────────────────────────────────────
  const fetchUserDetails = useCallback(async () => {
    const userId = getUserId()
    if (!userId) return

    const response = await axios.get<UserDetails>(
      `${API_BASE}/get-user/${userId}`,
      { headers: getAuthHeaders() }
    )
    setUserDetails(response.data)
  }, [])

  // ── Auth guard + initial load ────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated() || !getUserId()) {
        logout()
        router.push("/login")
        return
      }

      // Read role into reactive state so badge updates reactively
      setRole(readRole())

      try {
        await fetchUserDetails()
      } catch (err) {
        console.error("Error fetching user:", err)
        toast.error("Failed to load user details")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [fetchUserDetails, router])

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // ── Update profile ───────────────────────────────────────────────────────
  const handleSaveProfile = async (
    updated: UserDetails & { profileImage?: File }
  ) => {
    const userId = getUserId()
    if (!userId) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("name", updated.name)
      formData.append("address", updated.address ?? "")
      formData.append("contactNo", updated.contactNo ?? "")
      if (updated.profileImage) {
        formData.append("profileImage", updated.profileImage)
      }

      // Strip Content-Type so axios sets multipart/form-data + boundary automatically
      const { "Content-Type": _ct, ...headers } = getAuthHeaders()
      await axios.put(`${API_BASE}/update-profile/${userId}`, formData, { headers })

      // Re-fetch to get the latest profileImageUrl from server
      await fetchUserDetails()
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error("Update profile error:", err)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // ── Change password ──────────────────────────────────────────────────────
  const handleUpdatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const userId = getUserId()
    if (!userId) return

    try {
      setLoading(true)
      await axios.put(
        `${API_BASE}/change-password/${userId}`,
        { currentPassword, newPassword },
        { headers: getAuthHeaders() }
      )
      toast.success("Password updated successfully")
    } catch (err) {
      console.error(err)
      toast.error("Password update failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ── Delete account ───────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    const userId = getUserId()
    if (!userId) return

    try {
      setIsDeleting(true)
      await axios.delete(`${API_BASE}/delete-user/${userId}`, {
        headers: getAuthHeaders(),
      })
      toast.success("Account deleted")
      logout()
      router.push("/login")
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!userDetails) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardContent className="p-6 text-center text-blue-700">
          No user data available
        </CardContent>
      </Card>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const initial = userDetails.name.charAt(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">

        {/* ── Header card ── */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg border border-blue-100">
          <div className="absolute inset-0 bg-blue-700" />

          <div className="relative z-10 p-8 text-white flex flex-col md:flex-row gap-6 items-center md:items-start">

            {/* Avatar */}
            <Avatar className="h-28 w-28 shrink-0 border-4 border-white/80 shadow-xl overflow-hidden">
              {userDetails.profileImageUrl ? (
                <Image
                  src={userDetails.profileImageUrl}
                  alt={userDetails.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  unoptimized // Cloudinary already optimises the image
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700 text-3xl font-bold">
                  {initial.toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            {/* Name + email + badges */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">
                {userDetails.name}
              </h1>
              <p className="text-white/70 text-sm mt-1">{userDetails.email}</p>

              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {/* Role badge — reads from localStorage via state */}
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  <Shield className="h-3 w-3" />
                  {role}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  <Calendar className="h-3 w-3" />
                  Joined 2023
                </span>
              </div>
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="shrink-0 text-white border-white/40 hover:bg-white/20 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>


            {/* seller button  */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/sellbooks")}
              className="shrink-0 text-white border-white/40 hover:bg-white/20 backdrop-blur-sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Sell Books
            </Button>

            {/* check you orders buttons  */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/order")}
              className="shrink-0 text-white border-white/40 hover:bg-white/20 backdrop-blur-sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Check Orders
            </Button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex h-auto p-0 bg-transparent border-b border-blue-100 w-full justify-start overflow-x-auto rounded-none">
              {TABS.map(({ value, label, Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-2 px-5 py-3 rounded-none border-b-2 border-transparent
                             data-[state=active]:border-blue-600 data-[state=active]:text-blue-700
                             text-blue-600/60 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="p-6">
              <TabsContent value="details" className="m-0">
                <UserDetailsTab userDetails={userDetails} onSave={handleSaveProfile} />
              </TabsContent>

              <TabsContent value="password" className="m-0">
                <PasswordTab onUpdatePassword={handleUpdatePassword} />
              </TabsContent>

              <TabsContent value="wishlist" className="m-0">
                <WishlistTab />
              </TabsContent>

              <TabsContent value="cart" className="m-0">
                <CartTab userId={getUserId() || ""} userDetails={userDetails} />
              </TabsContent>

              <TabsContent value="orders" className="m-0">
                <OrdersTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  )
}