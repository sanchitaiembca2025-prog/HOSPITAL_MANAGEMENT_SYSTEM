"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  FlaskConical,
  Wrench,
  Package,
  GraduationCap,
  UserPlus,
  Search,
  ClipboardList,
  User,
  LucideIcon,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_CONFIG: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Personnel", href: "/admin/personnel", icon: Users },
    { label: "Wards", href: "/admin/wards", icon: Building2 },
    { label: "Tests Catalogue", href: "/admin/catalogue/tests", icon: FlaskConical },
    { label: "Equipment", href: "/admin/catalogue/equipment", icon: Wrench },
    { label: "Resources", href: "/admin/catalogue/resources", icon: Package },
    { label: "Seminars", href: "/admin/seminars", icon: GraduationCap },
  ],
  [Role.CLERK]: [
    { label: "Dashboard", href: "/clerk", icon: LayoutDashboard },
    { label: "Register Patient", href: "/clerk/patients/new", icon: UserPlus },
    { label: "Search Patient", href: "/clerk/patients", icon: Search },
    { label: "Active Visits", href: "/clerk/visits", icon: ClipboardList },
  ],
  [Role.DOCTOR]: [
    { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
    { label: "My Profile", href: "/doctor/profile", icon: User },
    { label: "Search Patient", href: "/doctor/patients", icon: Search },
  ],
  [Role.LAB]: [
    { label: "Dashboard", href: "/lab", icon: LayoutDashboard },
    { label: "Search Patient", href: "/lab/patients", icon: Search },
  ],
}

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname()
  const { role } = useAuthStore()

  const navItems = role ? NAV_CONFIG[role] : []

  return (
    <aside
      className={cn(
        "flex flex-col w-64 shrink-0 h-full",
        "bg-primary-900 text-white",
        className
      )}
    >
      {/* Sidebar Header / Logo — Royal Plum accent strip */}
      <div className="flex items-center px-6 h-14 bg-primary-700 shrink-0 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">🏥 HMS</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1" role="list">
          {(() => {
            // Find the single best-matching nav item (longest href that matches the current path)
            const activeHref = navItems
              .filter(
                (item) =>
                  pathname === item.href || pathname.startsWith(item.href + "/")
              )
              .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null

            return navItems.map((item) => {
              const isActive = item.href === activeHref
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-700 text-white border-l-4 border-primary-200 pl-2"
                        : "text-white/65 hover:bg-primary-700/70 hover:text-white"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "opacity-100" : "opacity-60"
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              )
            })
          })()}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/35">
        HMS v1.0 — Clinical Technology
      </div>
    </aside>
  )
}
