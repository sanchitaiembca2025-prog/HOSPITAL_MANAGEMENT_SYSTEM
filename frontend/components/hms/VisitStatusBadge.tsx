import { VisitStatus } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  VisitStatus,
  { label: string; className: string }
> = {
  [VisitStatus.ADMITTED]: {
    label: "Admitted",
    className: "bg-warning-50 text-warning-700 border-warning-500",
  },
  [VisitStatus.TREATMENT_IN_PROGRESS]: {
    label: "In Treatment",
    className: "bg-info-50 text-info-700 border-info-500",
  },
  [VisitStatus.DISCHARGED]: {
    label: "Discharged",
    className: "bg-success-50 text-success-700 border-success-500",
  },
  [VisitStatus.DECEASED]: {
    label: "Deceased",
    className: "bg-danger-50 text-danger-700 border-danger-500",
  },
}

interface VisitStatusBadgeProps {
  status: VisitStatus
  className?: string
}

export function VisitStatusBadge({ status, className }: VisitStatusBadgeProps) {
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
