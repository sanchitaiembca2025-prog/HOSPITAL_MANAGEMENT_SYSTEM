"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { LoginRequest, LoginResponse, Role } from "@/types"

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  CLERK: "/clerk",
  DOCTOR: "/doctor",
  LAB: "/lab",
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post<LoginResponse>("/auth/login", data)
      return res.data
    },
    onSuccess: (data) => {
      const role = data.role as Role
      setAuth(data.token, role, data.userId, data.name)
      document.cookie = `hms_token=${data.token}; path=/; max-age=3600; SameSite=Lax`
      toast.success(`Welcome back, ${data.name}!`)
      router.replace(ROLE_HOME[data.role] ?? "/login")
    },
    onError: () => {
      toast.error("Invalid username or password. Please try again.")
    },
  })
}

export interface RegisterRequest {
  fullName: string
  username: string
  password: string
  role: "DOCTOR" | "CLERK" | "LAB"
  phone?: string
  email?: string
  consultationFee?: number
  sectionId?: number
}

export function useRegister() {
  const router = useRouter()
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await api.post("/auth/register", data)
      return res.data
    },
    onSuccess: (_data, variables) => {
      toast.success(`Account created! You can now log in as ${variables.fullName}.`)
      router.push("/login")
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Registration failed. Username may already be taken."
      toast.error(msg)
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const router = useRouter()

  return () => {
    logout()
    document.cookie = "hms_token=; path=/; max-age=0"
    toast.info("You have been logged out.")
    router.replace("/login")
  }
}
