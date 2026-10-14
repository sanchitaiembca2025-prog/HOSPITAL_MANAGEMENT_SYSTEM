import { PageHeader } from "@/components/hms/PageHeader"
import { StatCard } from "@/components/hms/StatCard"
import { Users, Activity, TrendingDown, BedDouble } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and management"
        breadcrumb={[{ label: "Admin" }, { label: "Dashboard" }]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Personnel" value="—" icon={Users} description="Coming soon" />
        <StatCard label="Active Visits" value="—" icon={Activity} description="Coming soon" />
        <StatCard label="Discharges Today" value="—" icon={TrendingDown} description="Coming soon" />
        <StatCard label="Available Beds" value="—" icon={BedDouble} description="Coming soon" />
      </div>
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-neutral-400">
        Full dashboard content coming soon.
      </div>
    </div>
  )
}
