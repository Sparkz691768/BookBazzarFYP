"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User, Settings, LogOut, Moon, Sun,
  Search, Bell, PanelLeftClose, PanelLeft, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { useSidebar } from "@/components/ui/sidebar"
import { isAuthenticated, logout, getUserId } from "@/lib/auth"
import axios from "axios"
import { cn } from "@/lib/utils"

interface UserDetails {
  id: string
  name: string
  email: string
  avatar?: string
}

export default function LibraryHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { toggleSidebar, open } = useSidebar()

  const [searchQuery,   setSearchQuery]   = useState("")
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [userDetails,   setUserDetails]   = useState<UserDetails | null>(null)
  const [isLoading,     setIsLoading]     = useState(true)
  const [notifications] = useState(3)

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated()) {
        try {
          const userId = getUserId()
          const response = await axios.get(`https://localhost:7265/get-user/${userId}`, {
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
      } else {
        setIsLoading(false)
      }
    }
    fetchUserDetails()
  }, [])

  const handleLogout = () => {
    logout()
    setUserDetails(null)
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!userDetails?.name) return "LB"
    const parts = userDetails.name.split(" ")
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 md:px-4">

      {/* ── Sidebar toggle ── */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        {open
          ? <PanelLeftClose className="h-4 w-4" />
          : <PanelLeft       className="h-4 w-4" />
        }
      </Button>

      {/* ── Page title — hidden on mobile ── */}
      <div className="hidden md:flex flex-col leading-tight">
        <h1 className="text-sm font-semibold">Library Management System</h1>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Desktop search ── */}
      <div className="relative hidden md:block w-64 lg:w-80">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search books, members…"
          className="h-8 pl-8 text-sm bg-muted/40 border-border focus-visible:ring-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ── Mobile search toggle ── */}
      <div className={cn("md:hidden flex items-center", searchOpen && "flex-1 gap-2")}>
        {searchOpen ? (
          <>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                autoFocus
                type="search"
                placeholder="Search…"
                className="h-8 pl-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => { setSearchOpen(false); setSearchQuery("") }}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ── Actions ── */}
      <div className={cn("flex items-center gap-1", searchOpen && "hidden")}>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                  {notifications}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto p-1">
              <div className="p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                <p className="text-sm font-medium">New member joined</p>
                <p className="text-xs text-muted-foreground">Binaya Kharel registered dynamic account.</p>
                <p className="text-[10px] text-muted-foreground mt-1">2 mins ago</p>
              </div>
              <div className="p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer mt-1">
                <p className="text-sm font-medium">Book stock low</p>
                <p className="text-xs text-muted-foreground">'The Great Gatsby' stock is down to 2.</p>
                <p className="text-[10px] text-muted-foreground mt-1">1 hour ago</p>
              </div>
              <div className="p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer mt-1">
                <p className="text-sm font-medium">New feedback received</p>
                <p className="text-xs text-muted-foreground">A user left a 5-star review on 'Clean Code'.</p>
                <p className="text-[10px] text-muted-foreground mt-1">5 hours ago</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-primary font-medium cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark"
            ? <Sun  className="h-4 w-4" />
            : <Moon className="h-4 w-4" />
          }
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-border" />

        {/* User menu / Login */}
        {isAuthenticated() ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={userDetails?.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={userDetails?.name || "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userDetails?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isLoading ? "Loading…" : userDetails?.name || "Librarian"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userDetails?.email || "admin@libraryhub.com"}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push("/admin/profile")} className="gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/admin/settings")} className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" onClick={() => router.push("/login")} className="h-8 text-xs">
            Login
          </Button>
        )}
      </div>

    </header>
  )
}