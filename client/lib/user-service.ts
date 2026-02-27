/**
 * User Service — handles fetching the current authenticated user's profile.
 */

import { getUserId } from "./auth"

// ==========================
// Types
// ==========================

export interface UserDetails {
  id: string
  name: string
  email: string
  avatar?: string
}

// Base API URL — sourced from environment for portability
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "https://localhost:7265"

// ==========================
// API Calls
// ==========================

/** Fetch the currently logged-in user's details from the backend. */
export async function fetchUserDetails(): Promise<UserDetails> {
  try {
    const userId = getUserId()
    if (!userId) {
      throw new Error("No user ID found")
    }

    const response = await fetch(`${API_BASE_URL}/get-user/${userId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.status}`)
    }

    const data = await response.json()
    return {
      id: data.id || userId,
      name: data.name || "User",
      email: data.email || "user@example.com",
      avatar: data.profileImageUrl,
    }
  } catch (error) {
    console.error("Error fetching user details:", error)
    // Return fallback user details so the UI doesn't break
    return {
      id: getUserId() || "",
      name: "User",
      email: "user@example.com",
    }
  }
}
