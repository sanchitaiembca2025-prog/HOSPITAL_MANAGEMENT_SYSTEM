import { Role } from "@/types"
import { cn } from "@/lib/utils"

const ROLE_CONFIG: Record<Role, { label: string; className: string }> = {
  [Role.ADMIN]: {
    label: "Admin",
    className: "bg-primary-100 text-primary-700 border-primary-200",
  },
  [Role.DOCTOR]: {
    label: "Doctor",
    className: "bg-info-50 text-info-700 border-info-500",
  },
  [Role.CLERK]: {
    label: "Clerk",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  [Role.LAB]: {
    label: "Lab",
    className: "bg-success-50 text-success-700 border-success-500",
  },
}

interface RoleBadgeProps {
  role: Role
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
