import { PageHeader } from "@/components/hms/PageHeader"
import { StatCard } from "@/components/hms/StatCard"
import { Users, Activity, Stethoscope } from "lucide-react"

export default function DoctorDashboard() {
  return (
    <div>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Your active patients and schedule"
        breadcrumb={[{ label: "Doctor" }, { label: "Dashboard" }]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Patients" value="—" icon={Users} description="Coming soon" />
        <StatCard label="Visits Today" value="—" icon={Activity} description="Coming soon" />
        <StatCard label="Section" value="—" icon={Stethoscope} description="Coming soon" />
      </div>
      <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-neutral-400">
        Dashboard content coming soon.
      </div>
    </div>
  )
}
