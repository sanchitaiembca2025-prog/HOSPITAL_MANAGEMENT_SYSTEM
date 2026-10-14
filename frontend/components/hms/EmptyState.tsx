import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-neutral-100 mb-4">
        <Icon className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="text-base font-semibold text-neutral-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-600 max-w-sm">{description}</p>
      )}
      {actions && <div className="mt-4">{actions}</div>}
    </div>
  )
}
