"use client"

import Link from "next/link"
import { useMemo } from "react"
import { PageHeader } from "@/components/hms/PageHeader"
import { usePatients } from "@/hooks/use-patient"
import { VisitStatus } from "@/types"
import { Users, Activity, UserCheck, BedDouble, ArrowRight, ClipboardList, BarChart3, GraduationCap } from "lucide-react"

const statusStyle: Record<string, string> = {
  ADMITTED:                "bg-warning-50 text-warning-700",
  TREATMENT_IN_PROGRESS:   "bg-info-50 text-info-700",
  DISCHARGED:              "bg-success-50 text-success-700",
  DECEASED:                "bg-neutral-100 text-neutral-500",
}

export default function AdminDashboard() {
  const { data: patients = [], isLoading } = usePatients()

  const stats = useMemo(() => {
    const allVisits = patients.flatMap((p) => p.visits)
    const active = allVisits.filter(
      (v) => v.status === VisitStatus.ADMITTED || v.status === VisitStatus.TREATMENT_IN_PROGRESS
    ).length
    const dischargedToday = allVisits.filter((v) => {
      if (v.status !== VisitStatus.DISCHARGED || !v.dischargeTime) return false
      return new Date(v.dischargeTime).toDateString() === new Date().toDateString()
    }).length
    const recentPatients = [...patients]
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
      .slice(0, 6)
    return { total: patients.length, active, dischargedToday, recentPatients }
  }, [patients])

  const cards = [
    { label: "Total Patients",   value: stats.total,           icon: Users,      bg: "bg-primary-50",  ic: "text-primary-600", border: "border-primary-100" },
    { label: "Active Visits",    value: stats.active,          icon: Activity,   bg: "bg-accent-50",   ic: "text-accent-500",  border: "border-accent-100"  },
    { label: "Discharged Today", value: stats.dischargedToday, icon: UserCheck,  bg: "bg-success-50",  ic: "text-success-700", border: "border-success-100" },
    { label: "Bed Management",   value: "→",                   icon: BedDouble,  bg: "bg-neutral-100", ic: "text-neutral-500", border: "border-neutral-200", href: "/admin/wards" },
  ]

  const quickLinks = [
    { href: "/admin/personnel",         label: "Personnel",        icon: Users },
    { href: "/admin/wards",             label: "Wards",            icon: BedDouble },
    { href: "/admin/catalogue/tests",   label: "Tests Catalogue",  icon: ClipboardList },
    { href: "/admin/seminars",          label: "Seminars",         icon: GraduationCap },
    { href: "/admin/reports",           label: "Reports",          icon: BarChart3 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System overview and management"
        breadcrumb={[{ label: "Admin" }, { label: "Dashboard" }]}
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          const inner = (
            <div className={`bg-white rounded-xl border ${c.border} p-5 flex items-start justify-between h-full`}>
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">{c.label}</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {isLoading && typeof c.value === "number" ? "…" : c.value}
                </p>
              </div>
              <div className={`h-11 w-11 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${c.ic}`} />
              </div>
            </div>
          )
          return c.href ? (
            <Link key={c.label} href={c.href} className="block hover:opacity-90 transition-opacity">{inner}</Link>
          ) : (
            <div key={c.label}>{inner}</div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent patients table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Recently Registered Patients</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-neutral-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 bg-neutral-100 rounded" />
                    <div className="h-3 w-24 bg-neutral-100 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-neutral-100 rounded-full" />
                </div>
              ))
            ) : stats.recentPatients.length === 0 ? (
              <p className="px-6 py-10 text-sm text-neutral-400 text-center">No patients registered yet.</p>
            ) : (
              stats.recentPatients.map((p) => {
                const latest = p.visits.at(-1)
                return (
                  <div key={p.patientId} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-neutral-400">P-{p.patientId} · {p.age}y · {p.gender.charAt(0) + p.gender.slice(1).toLowerCase()}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${latest ? statusStyle[latest.status] ?? "bg-neutral-100 text-neutral-500" : "bg-neutral-100 text-neutral-400"}`}>
                      {latest ? latest.status.replace(/_/g, " ") : "No visits"}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-1">
            {quickLinks.map((q) => {
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
