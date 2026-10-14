import { PageHeader } from "@/components/hms/PageHeader"
import { EmptyState } from "@/components/hms/EmptyState"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Hospital analytics and reports"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]}
      />
      <EmptyState icon={BarChart3} title="Reports coming soon" description="View patient statistics, revenue reports, and operational metrics." />
    </div>
  )
}
