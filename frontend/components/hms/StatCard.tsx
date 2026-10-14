import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">{label}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-1">{value}</p>
            {description && (
              <p
                className={cn(
                  "text-xs mt-1",
                  trend === "up"
                    ? "text-success-700"
                    : trend === "down"
                    ? "text-danger-500"
                    : "text-neutral-600"
                )}
              >
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary-50">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
