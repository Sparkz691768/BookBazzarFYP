"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { fetchUserDetails } from "@/lib/user-service"
import { isAuthenticated } from "@/lib/auth" 
import type { UserDetails } from "@/lib/user-service"

interface UserContextType {
  user: UserDetails | null
  isLoading: boolean
  error: Error | null
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshUser = async () => {
    if (!isAuthenticated()) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const userData = await fetchUserDetails()
      setUser(userData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch user"))
      console.error("Error refreshing user:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return <UserContext.Provider value={{ user, isLoading, error, refreshUser }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
