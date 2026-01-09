"use client"

import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import LibrarySidebar from "./components/LibrarySidebar"
import ThemeProvider from "@/components/common/ThemeProvider"
import LibraryHeader from "./components/LibraryHeader"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-muted/30">

          {/* Sidebar — collapses to icon rail on mobile */}
          <LibrarySidebar />

          {/* Main content area — grows to fill remaining space */}
          <SidebarInset className="flex flex-col min-w-0 flex-1">

            {/* Sticky header */}
            <LibraryHeader />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </main>

          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}