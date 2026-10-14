import { Visit } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { VisitStatusBadge } from "./VisitStatusBadge"
import { formatDateTime } from "@/lib/utils"
import { User, Building2, Clock } from "lucide-react"

interface VisitSummaryCardProps {
  visit: Visit
  actions?: React.ReactNode
}

export function VisitSummaryCard({ visit, actions }: VisitSummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-neutral-800">
                V-{visit.visitId}
              </span>
              <VisitStatusBadge status={visit.status} />
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <User className="h-3.5 w-3.5" />
              <span>{visit.doctorName}</span>
            </div>
            {visit.wardCategory && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Building2 className="h-3.5 w-3.5" />
                <span>{visit.wardCategory}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDateTime(visit.entryTime)}</span>
            </div>
            <p className="text-sm text-neutral-600 line-clamp-1">{visit.issue}</p>
          </div>
          {actions && <div className="ml-4 shrink-0">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
