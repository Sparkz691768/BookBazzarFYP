/**
 * API Service — centralised data-fetching functions for the BookBazzar frontend.
 * All endpoints use the environment-configured API base URL.
 */

// ==========================
// Type Definitions
// ==========================

export interface CartItem {
  id: string
  quantity: number
}

export interface WishlistItem {
  id: string
}

export interface User {
  id: string
  name?: string
  email?: string
}

// Base API URL — sourced from environment for portability
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "https://localhost:7265"

// ==========================
// Cart
// ==========================

/** Fetch the cart for a given user. */
export async function fetchCart(userId: string): Promise<CartItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Cart/ViewCart/${userId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching cart:", error)
    return []
  }
}

// ==========================
// Wishlist
// ==========================

/** Fetch the authenticated user's wishlist. */
export async function fetchWishlist(): Promise<WishlistItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Book/GetWishlist`)

    if (!response.ok) {
      throw new Error(`Failed to fetch wishlist: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return []
  }
}

// ==========================
// User
// ==========================

/** Fetch user details by ID. */
export async function fetchUser(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/get-user/${userId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}
// API endpoints aligned with backend
