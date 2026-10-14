import { InvoiceStatus } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  [InvoiceStatus.PENDING]: {
    label: "Payment Pending",
    className: "bg-warning-50 text-warning-700 border-warning-500",
  },
  [InvoiceStatus.PAID]: {
    label: "Paid",
    className: "bg-success-50 text-success-700 border-success-500",
  },
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  className?: string
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
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
