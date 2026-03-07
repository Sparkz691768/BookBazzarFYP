export interface Feedback {
  id: string
  userId: string
  email: string
  subject: string
  message: string
  status: "new" | "replied" | "resolved" | "archived"
  createdAt: string
}

export interface UserDetails {
  id: string
  name: string
  email: string
  role?: string
  address?: string
  contactNo?: string
  profileImagePath?: string
  createdAt: string
}
