"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Book, BookOpen, Users, Calendar, BarChart3,
  Settings, Library, MailCheck, MessageSquareShare,
  ClockAlert,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const mainNav = [
  { label: "Dashboard",     icon: BookOpen,          href: "/admin" },
  { label: "Books",         icon: Book,              href: "/admin/books" },
  { label: "Members",       icon: Users,             href: "/admin/users" },
  { label: "Email",         icon: MailCheck,         href: "/admin/email" },
  { label: "Feedback",      icon: MessageSquareShare, href: "/admin/feedback" },
  { label: "Announcement",  icon: ClockAlert,        href: "/admin/announcement" },
]

const staffNav = [
  { label: "All Orders",  icon: Calendar,  href: "/admin/orders" },
  { label: "Analytics",   icon: BarChart3, href: "/admin/analytics" },
  { label: "Settings",    icon: Settings,  href: "/admin/settings" },
]

export default function LibrarySidebar() {
  const router   = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  return (
    <Sidebar className="border-r border-border bg-background">

      {/* ── Header ── */}
      <SidebarHeader className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Library className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">LibraryHub</span>
            <span className="text-[11px] text-muted-foreground">Management System</span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent className="px-2 py-3">

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-1">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainNav.map(({ label, icon: Icon, href }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    onClick={() => router.push(href)}
                    tooltip={label}
                    isActive={isActive(href)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                      "text-muted-foreground hover:text-foreground hover:bg-accent",
                      isActive(href) && "bg-primary/10 text-primary font-medium hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive(href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span>{label}</span>
                    {isActive(href) && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-3 mx-2 border-t border-border" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-1">
            Staff Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {staffNav.map(({ label, icon: Icon, href }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    onClick={() => router.push(href)}
                    tooltip={label}
                    isActive={isActive(href)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                      "text-muted-foreground hover:text-foreground hover:bg-accent",
                      isActive(href) && "bg-primary/10 text-primary font-medium hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive(href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span>{label}</span>
                    {isActive(href) && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-border p-3">
        <div
          className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => router.push("/admin/profile")}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">LB</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-sm font-medium truncate">Librarian</span>
            <span className="text-[11px] text-muted-foreground truncate">admin@libraryhub.com</span>
          </div>
        </div>
      </SidebarFooter>

    </Sidebar>
  )
}