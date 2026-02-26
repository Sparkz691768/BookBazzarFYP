import axios from "axios"

/**
 * Creates a pre-configured Axios instance for communicating with the backend API.
 * Uses the NEXT_PUBLIC_API_URL environment variable for the base URL.
 */
export function createApiClient() {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:7265/api/",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
