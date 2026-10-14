import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Role } from "@/types"

interface AuthState {
  token: string | null
  role: Role | null
  userId: number | null
  name: string | null
  setAuth: (token: string, role: Role, userId: number, name: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      name: null,
      setAuth: (token, role, userId, name) =>
        set({ token, role, userId, name }),
      logout: () => set({ token: null, role: null, userId: null, name: null }),
    }),
    {
      name: "hms_token",
    }
  )
)
