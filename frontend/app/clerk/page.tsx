"use client"

import Link from "next/link"
import { useMemo } from "react"
import { PageHeader } from "@/components/hms/PageHeader"
import { usePatients } from "@/hooks/use-patient"
import { VisitStatus } from "@/types"
import { UserPlus, Activity, UserCheck, Search, ArrowRight, ClipboardList, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const statusStyle: Record<string, string> = {
  ADMITTED:               "bg-warning-50 text-warning-700 border-warning-200",
  TREATMENT_IN_PROGRESS:  "bg-info-50 text-info-700 border-info-200",
  DISCHARGED:             "bg-success-50 text-success-700 border-success-200",
  DECEASED:               "bg-neutral-100 text-neutral-500 border-neutral-200",
}

export default function ClerkDashboard() {
  const { data: patients = [], isLoading } = usePatients()

  const stats = useMemo(() => {
    const allVisits = patients.flatMap((p) => p.visits)
    const today = new Date().toDateString()
    const registeredToday = patients.filter((p) => new Date(p.registeredAt).toDateString() === today).length
    const active = allVisits.filter(
      (v) => v.status === VisitStatus.ADMITTED || v.status === VisitStatus.TREATMENT_IN_PROGRESS
    ).length
    const dischargedToday = allVisits.filter(
      (v) => v.status === VisitStatus.DISCHARGED && v.dischargeTime && new Date(v.dischargeTime).toDateString() === today
    ).length
    const activeVisitsList = patients
      .flatMap((p) =>
        p.visits
          .filter((v) => v.status === VisitStatus.ADMITTED || v.status === VisitStatus.TREATMENT_IN_PROGRESS)
          .map((v) => ({ ...v, patientId: p.patientId, patientName: `${p.firstName} ${p.lastName}` }))
      )
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
      .slice(0, 6)
    return { registeredToday, active, dischargedToday, activeVisitsList }
  }, [patients])

  const cards = [
    { label: "Registered Today", value: stats.registeredToday, icon: UserPlus,  bg: "bg-primary-50",  ic: "text-primary-600", border: "border-primary-100" },
    { label: "Active Visits",    value: stats.active,          icon: Activity,  bg: "bg-accent-50",   ic: "text-accent-500",  border: "border-accent-100"  },
    { label: "Discharged Today", value: stats.dischargedToday, icon: UserCheck, bg: "bg-success-50",  ic: "text-success-700", border: "border-success-100" },
    { label: "Total Patients",   value: patients.length,       icon: ClipboardList, bg: "bg-neutral-100", ic: "text-neutral-500", border: "border-neutral-200" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clerk Dashboard"
        subtitle="Patient registration and visit management"
        breadcrumb={[{ label: "Clerk" }, { label: "Dashboard" }]}
        actions={
          <Link href="/clerk/patients/new">
            <Button variant="accent" size="sm"><Plus className="h-4 w-4 mr-1" /> New Patient</Button>
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
        {/* Active visits list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Active Visits</h3>
            <Link href="/clerk/visits" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              All visits <ArrowRight className="h-3 w-3" />
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
                  <div className="h-5 w-24 bg-neutral-100 rounded-full" />
                </div>
              ))
            ) : stats.activeVisitsList.length === 0 ? (
              <p className="px-6 py-10 text-sm text-neutral-400 text-center">No active visits at the moment.</p>
            ) : (
              stats.activeVisitsList.map((v) => (
                <div key={v.visitId} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 text-xs font-bold shrink-0">
                      {v.patientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{v.patientName}</p>
                      <p className="text-xs text-neutral-400">V-{v.visitId} · Dr. {v.doctorName} · {formatDate(v.entryTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusStyle[v.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                      {v.status.replace(/_/g, " ")}
                    </span>
                    <Link href={`/clerk/visits/${v.visitId}`} className="text-xs text-primary-600 hover:underline">
                      Manage
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-1">
            {[
              { href: "/clerk/patients/new", label: "Register New Patient", icon: UserPlus },
              { href: "/clerk/patients",     label: "Search Patient",        icon: Search },
              { href: "/clerk/visits",       label: "Active Visits",         icon: Activity },
            ].map((q) => {
              const Icon = q.icon
              return (
                <Link
                  key={q.href}
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
