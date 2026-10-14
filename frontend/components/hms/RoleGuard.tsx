"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"

const ROLE_HOME: Record<Role, string> = {
  [Role.ADMIN]: "/admin",
  [Role.CLERK]: "/clerk",
  [Role.DOCTOR]: "/doctor",
  [Role.LAB]: "/lab",
}

interface RoleGuardProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { token, role } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token || !role) {
      router.replace("/login")
      return
    }
    if (!allowedRoles.includes(role)) {
      router.replace(ROLE_HOME[role])
    }
  }, [token, role, allowedRoles, router])

  if (!token || !role || !allowedRoles.includes(role)) {
    return null
  }

  return <>{children}</>
}
