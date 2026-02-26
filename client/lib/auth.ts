const TOKEN_KEY = 'token'
const USER_ID_KEY = 'userId'
const USER_ROLE_KEY = 'role'

const isBrowser = (): boolean => typeof window !== 'undefined'

// ─────────────────────────────
// Auth State
// ─────────────────────────────
export const isAuthenticated = (): boolean => {
  if (!isBrowser()) return false
  const token = localStorage.getItem(TOKEN_KEY)
  return !!token
}

// ─────────────────────────────
// Getters
// ─────────────────────────────
export const getToken = (): string | null =>
  isBrowser() ? localStorage.getItem(TOKEN_KEY) : null

export const getUserId = (): string | null =>
  isBrowser() ? localStorage.getItem(USER_ID_KEY) : null

export const getUserRole = (): string | null =>
  isBrowser() ? localStorage.getItem(USER_ROLE_KEY) : null

export const isAdmin = (): boolean =>
  getUserRole()?.toLowerCase() === 'admin'

// ─────────────────────────────
// Setters
// ─────────────────────────────
export const setAuthData = (
  token: string,
  userId: string,
  role: string
): void => {
  if (!isBrowser()) return

  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_ID_KEY, userId)
  localStorage.setItem(USER_ROLE_KEY, role)
}

// ─────────────────────────────
// Logout
// ─────────────────────────────
export const logout = (): void => {
  if (!isBrowser()) return
  localStorage.clear() // safer to remove all auth traces
}

// ─────────────────────────────
// Headers
// ─────────────────────────────
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    accept: '*/*'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}// Token validation improvements
