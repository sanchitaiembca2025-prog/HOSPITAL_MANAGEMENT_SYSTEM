import { PageHeader } from "@/components/hms/PageHeader"
import { StatCard } from "@/components/hms/StatCard"
import { UserPlus, Activity, TrendingDown, BedDouble } from "lucide-react"

export default function ClerkDashboard() {
  return (
    <div>
      <PageHeader
        title="Clerk Dashboard"
        subtitle="Patient registration and visit management"
        breadcrumb={[{ label: "Clerk" }, { label: "Dashboard" }]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Patients Registered Today" value="—" icon={UserPlus} description="Coming soon" />
        <StatCard label="Active Visits" value="—" icon={Activity} description="Coming soon" />
        <StatCard label="Discharges Today" value="—" icon={TrendingDown} description="Coming soon" />
        <StatCard label="Available Beds" value="—" icon={BedDouble} description="Coming soon" />
      </div>
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-neutral-400">
        Recent visits table coming soon.
      </div>
    </div>
  )
}
