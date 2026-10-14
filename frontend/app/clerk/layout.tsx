"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/hms/AppSidebar"
import { AppHeader } from "@/components/hms/AppHeader"
import { RoleGuard } from "@/components/hms/RoleGuard"
import { Role } from "@/types"

export default function ClerkLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <RoleGuard allowedRoles={[Role.CLERK]}>
      <div className="flex h-screen overflow-hidden bg-white">
        <div className="hidden lg:flex">
          <AppSidebar />
        </div>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-50">
              <AppSidebar />
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}
