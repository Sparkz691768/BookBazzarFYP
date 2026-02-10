"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Book, Menu, Search, X, User, Settings, LogOut, ShoppingCart, Heart } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { isAuthenticated, logout, getUserId, getUserRole } from "@/lib/auth"
import ThemeToggle from "./ThemeToggle"
import axios from "axios"
// ✅ Import VisuallyHidden + DialogTitle to satisfy Radix accessibility requirement
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DialogTitle } from "@radix-ui/react-dialog"

interface UserDetails {
  id?: string
  name: string
  email: string
  address: string
  contactNo: string
  profileImageUrl?: string
  avatar?: string
}

const Navbar = () => {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // ✅ isMounted prevents localStorage/isAuthenticated from running on server
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const auth = getUserRole();

  // ✅ Mark as mounted only on client — this is the hydration fix
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const userId = isMounted ? getUserId() : null

  // Fetch cart and wishlist counts
  useEffect(() => {
    if (!isMounted) return
    const fetchCounts = async () => {
      if (isAuthenticated() && userId) {
        try {
          const cartResponse = await axios.get(
            `https://localhost:7265/api/Cart/ViewCart/${userDetails?.name}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                accept: "*/*",
              },
            }
          )
          const wishlistResponse = await axios.get(
            `https://localhost:7265/api/Wishlist/GetWishlistCount/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                accept: "*/*",
              },
            }
          )
          setCartCount(cartResponse.data)
          setWishlistCount(wishlistResponse.data)
        } catch (error) {
          console.error("Error fetching counts:", error)
        }
      }
    }
    fetchCounts()
  }, [userId, isMounted])

  // Fetch user details
  useEffect(() => {
    if (!isMounted) return
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push("/login")
        return
      }
      try {
        const uid = getUserId()
        const response = await axios.get(`https://localhost:7265/get-user/${uid}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            accept: "*/*",
          },
        })
        setUserDetails(response.data)
      } catch (error) {
        console.error("Error fetching user details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router, isMounted])

  const handleLogout = () => {
    logout()
    setUserDetails(null)
    router.push("/login")
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Books", href: "/book" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contactus" },
  ]

  const getUserInitials = () => {
    if (!userDetails?.name) return "U"
    const nameParts = userDetails.name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  if (pathname.startsWith("/admin")) return null

  // ✅ Use isMounted && isAuthenticated() everywhere instead of bare isAuthenticated()
  const loggedIn = isMounted && isAuthenticated()

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white shadow-md dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/80"
          : "bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-blue-900/20",
      )}
    >
      <div className="container flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
              <Book className="h-5 w-5" />
            </div>
            <span className="hidden text-xl font-bold text-blue-900 dark:text-blue-50 sm:inline-block">
              BookBazzar
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-900/30"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 dark:text-slate-300 dark:hover:text-blue-200 dark:hover:bg-blue-900/20",
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          <div
            className={cn(
              "items-center transition-all duration-300 ease-in-out",
              isSearchOpen
                ? "absolute inset-x-0 top-full bg-white p-4 border-b border-blue-100 shadow-md md:relative md:inset-auto md:p-0 md:border-0 md:shadow-none md:w-64"
                : "hidden md:flex md:w-auto",
            )}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const searchInput = e.currentTarget.querySelector("input") as HTMLInputElement
                const query = searchInput.value.trim()
                if (query) {
                  router.push(`/search?q=${encodeURIComponent(query)}`)
                  setIsSearchOpen(false)
                }
              }}
              className="relative w-full"
            >
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
              <Input
                type="search"
                placeholder="Search books..."
                className="w-full pl-8 md:w-64 border-blue-200 focus-visible:ring-blue-500 dark:border-blue-800 dark:bg-slate-800 dark:placeholder:text-slate-400"
              />
            </form>
          </div>

          {isSearchOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-30 md:hidden"
              onClick={() => setIsSearchOpen(false)}
            />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Toggle search"
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Wishlist and Cart (Desktop) */}
          {loggedIn && (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/profile?tab=wishlist">
                <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-blue-600 hover:bg-blue-50/50">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-600">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/profile?tab=cart">
                <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-blue-600 hover:bg-blue-50/50">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-600">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex md:items-center">
            {loggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full border-2 border-blue-100 hover:border-blue-200"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={userDetails?.profileImageUrl || "/placeholder.svg?height=36&width=36"}
                        alt="User profile"
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 bg-white border-blue-100">
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-md">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage
                        src={userDetails?.avatar || "/placeholder.svg?height=40&width=40"}
                        alt="User avatar"
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-blue-900">
                        {isLoading ? "Loading..." : userDetails?.name || "User"}
                      </p>
                      <p className="text-xs text-blue-600">{userDetails?.email || "user@example.com"}</p>
                    </div>
                  </div>
                  <div className="py-2">
                    <DropdownMenuItem asChild className="py-2 cursor-pointer">
                      {/* if user role is admin, show admin dashboard link */}
                      {auth === "Admin" ? (
                        <Link href="/admin/dashboard" className="flex w-full items-center">
                          <Settings className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : (
                        <Link href="/profile" className="flex w-full items-center">
                          <Settings className="mr-2 h-4 w-4 text-blue-600" />
                          <span>Profile</span>
                        </Link>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-2 cursor-pointer">
                      <Link href="/profile" className="flex w-full items-center">
                        <User className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-2 cursor-pointer">
                      <Link href="/profile?tab=wishlist" className="flex w-full items-center">
                        <Heart className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Wishlist</span>
                        {wishlistCount > 0 && (
                          <Badge className="ml-auto bg-blue-600">{wishlistCount}</Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-2 cursor-pointer">
                      <Link href="/profile?tab=cart" className="flex w-full items-center">
                        <ShoppingCart className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <Badge className="ml-auto bg-blue-600">{cartCount}</Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-2 cursor-pointer">
                      <Link href="/settings" className="flex w-full items-center">
                        <Settings className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-blue-100" />
                  <DropdownMenuItem
                    className="py-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full bg-white max-w-[350px] px-5 py-4 border-l border-blue-100 overflow-y-auto flex flex-col h-full"
            >
              {/* ✅ Visually hidden title satisfies Radix Dialog/Sheet accessibility requirement */}
              <VisuallyHidden>
                <DialogTitle>Navigation Menu</DialogTitle>
              </VisuallyHidden>

              <div className="flex flex-col bg-white gap-6 py-6">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                      <Book className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-blue-900">E-Book NEPAL</span>
                  </Link>
                  <ThemeToggle />
                </div>

                {loggedIn && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-blue-100">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage
                        src={userDetails?.avatar || "/placeholder.svg?height=40&width=40"}
                        alt="User avatar"
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-900">{userDetails?.name || "User"}</span>
                      <span className="text-xs text-blue-600">{userDetails?.email || "user@example.com"}</span>
                    </div>
                  </div>
                )}

                <div className="relative w-full py-2">
                  <Search className="absolute left-2.5 top-[calc(50%-8px)] h-4 w-4 text-blue-500" />
                  <Input
                    type="search"
                    placeholder="Search books..."
                    className="w-full pl-8 h-10 border-blue-200 focus-visible:ring-blue-500"
                  />
                </div>

                <nav className="flex flex-col space-y-1 max-h-[40vh] overflow-y-auto">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "py-2.5 px-3 rounded-md text-base font-medium transition-colors",
                        pathname === link.href
                          ? "text-blue-700 bg-blue-50"
                          : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50",
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {loggedIn && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link href="/profile?tab=wishlist" className="w-full">
                      <Button variant="outline" className="w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50 h-11">
                        <Heart className="mr-2 h-4 w-4" />
                        <span className="truncate">Wishlist</span>
                        {wishlistCount > 0 && (
                          <Badge className="ml-1 bg-blue-600">{wishlistCount}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link href="/profile?tab=cart" className="w-full">
                      <Button variant="outline" className="w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50 h-11">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span className="truncate">Cart</span>
                        {cartCount > 0 && (
                          <Badge className="ml-1 bg-blue-600">{cartCount}</Badge>
                        )}
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-blue-100">
                  {loggedIn ? (
                    <>
                      <Link href="/profile" className="w-full">
                        <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/settings" className="w-full">
                        <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" className="w-full">
                        <Button variant="outline" className="w-full justify-center border-blue-200 text-blue-700 hover:bg-blue-50 h-11">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" className="w-full">
                        <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white h-11">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navbar// Mobile responsive improvements
