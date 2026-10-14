import axios from "axios"
import { useAuthStore } from "@/lib/auth-store"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor — attach Bearer token; remove Content-Type for FormData
// so the browser can set the correct multipart/form-data boundary automatically.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined") {
        window.location.href = "/login?reason=session_expired"
      }
    }
    return Promise.reject(error)
  }
)

export default api
