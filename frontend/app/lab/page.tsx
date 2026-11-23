"use client"

import Link from "next/link"
import { useMemo } from "react"
import { PageHeader } from "@/components/hms/PageHeader"
import { usePatients } from "@/hooks/use-patient"
import { useAuthStore } from "@/lib/auth-store"
import { VisitStatus } from "@/types"
import { FlaskConical, Activity, CheckCircle2, Search, ArrowRight, Upload } from "lucide-react"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { formatDate } from "@/lib/utils"

export default function LabDashboard() {
  const { name } = useAuthStore()
  const { data: patients = [], isLoading } = usePatients()

  const stats = useMemo(() => {
    const allVisits = patients.flatMap((p) =>
      p.visits.map((v) => ({ ...v, patientId: p.patientId, patientName: `${p.firstName} ${p.lastName}` }))
    )
    const active = allVisits.filter(
      (v) => v.status === VisitStatus.ADMITTED || v.status === VisitStatus.TREATMENT_IN_PROGRESS
    )
    const today = new Date().toDateString()
    const completedToday = allVisits.filter(
      (v) => v.status === VisitStatus.DISCHARGED && v.dischargeTime && new Date(v.dischargeTime).toDateString() === today
    ).length
    return { active, activeCount: active.length, completedToday }
  }, [patients])

  const cards = [
    { label: "Active Patients",   value: stats.activeCount,    icon: FlaskConical,   bg: "bg-primary-50",  ic: "text-primary-600", border: "border-primary-100" },
    { label: "In Treatment",      value: patients.filter((p) => p.visits.some((v) => v.status === VisitStatus.TREATMENT_IN_PROGRESS)).length, icon: Activity, bg: "bg-accent-50", ic: "text-accent-500", border: "border-accent-100" },
    { label: "Discharged Today",  value: stats.completedToday, icon: CheckCircle2,   bg: "bg-success-50",  ic: "text-success-700", border: "border-success-100" },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="bg-primary-900 text-white rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-primary-200 text-sm mb-1">Lab Portal</p>
          <h2 className="text-2xl font-bold">{name ?? "Lab Personnel"}</h2>
          <p className="text-primary-300 text-sm mt-1">Manage test costs and upload results for active patients</p>
        </div>
        <div className="h-14 w-14 rounded-full bg-primary-700 border-2 border-primary-500 flex items-center justify-center shrink-0">
          <FlaskConical className="h-7 w-7 text-primary-200" />
        </div>
      </div>

      <PageHeader
        title="Lab Dashboard"
        subtitle="Pending tests and results"
        breadcrumb={[{ label: "Lab" }, { label: "Dashboard" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className={`bg-white rounded-xl border ${c.border} p-5 flex items-start justify-between`}>
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">{c.label}</p>
                <p className="text-3xl font-bold text-neutral-900">{isLoading ? "…" : c.value}</p>
              </div>
              <div className={`h-11 w-11 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${c.ic}`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active patient visits */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Active Patients</h3>
            <Link href="/lab/patients" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              All patients <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-neutral-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 bg-neutral-100 rounded" />
                    <div className="h-3 w-28 bg-neutral-100 rounded" />
                  </div>
                </div>
              ))
            ) : stats.active.length === 0 ? (
              <p className="px-6 py-10 text-sm text-neutral-400 text-center">No active patients at the moment.</p>
            ) : (
              stats.active.slice(0, 6).map((v) => (
                <div key={v.visitId} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-success-100 flex items-center justify-center text-success-700 text-xs font-bold shrink-0">
                      {v.patientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{v.patientName}</p>
                      <p className="text-xs text-neutral-400">V-{v.visitId} · Dr. {v.doctorName} · {formatDate(v.entryTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <VisitStatusBadge status={v.status as VisitStatus} />
                    <Link href={`/lab/patients/${v.patientId}`} className="text-xs text-primary-600 hover:underline">
                      Open Lab
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-1">
            {[
              { href: "/lab/patients", label: "Search Patients",  icon: Search },
              { href: "/lab/patients", label: "Upload Results",   icon: Upload },
            ].map((q) => {
              const Icon = q.icon
              return (
                <Link
                  key={q.label}
                  href={q.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm text-neutral-700 group"
                >
                  <Icon className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 shrink-0" />
                  {q.label}
                  <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
