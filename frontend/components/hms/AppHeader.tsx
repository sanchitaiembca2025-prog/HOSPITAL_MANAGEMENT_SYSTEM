"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import { LogOut, User, Menu } from "lucide-react"
import { Role } from "@/types"
import { toast } from "sonner"

interface AppHeaderProps {
  onMenuClick?: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { name, role, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    document.cookie = "hms_token=; path=/; max-age=0"
    toast.info("You have been logged out.")
    router.replace("/login")
  }

  const initials = name ? getInitials(name) : "U"
  const displayName = name ?? "User"

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-neutral-200 shadow-sm z-30 shrink-0">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-lg font-bold text-primary-600 tracking-tight">🏥 HMS</span>
      </div>

      {/* Right: avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary-600 text-white">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-neutral-800">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="font-normal">
            <div className="text-sm font-medium">{displayName}</div>
            <div className="text-xs text-neutral-600">{role}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {role === Role.DOCTOR && (
            <DropdownMenuItem onClick={() => router.push("/doctor/profile")}>
              <User className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-danger-500 focus:text-danger-500 focus:bg-danger-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
