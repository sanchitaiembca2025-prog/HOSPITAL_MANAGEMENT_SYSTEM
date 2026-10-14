import { PageHeader } from "@/components/hms/PageHeader"
import { StatCard } from "@/components/hms/StatCard"
import { Microscope, Activity, CheckCircle } from "lucide-react"

export default function LabDashboard() {
  return (
    <div>
      <PageHeader
        title="Lab Dashboard"
        subtitle="Pending tests and results"
        breadcrumb={[{ label: "Lab" }, { label: "Dashboard" }]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Pending Tests" value="—" icon={Microscope} description="Coming soon" />
        <StatCard label="Active Visits" value="—" icon={Activity} description="Coming soon" />
        <StatCard label="Completed Today" value="—" icon={CheckCircle} description="Coming soon" />
      </div>
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-neutral-400">
        Dashboard content coming soon.
      </div>
    </div>
  )
}
