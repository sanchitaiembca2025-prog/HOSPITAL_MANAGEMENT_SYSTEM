"use client"

import Link from "next/link"
import { useMemo } from "react"
import { PageHeader } from "@/components/hms/PageHeader"
import { usePatients } from "@/hooks/use-patient"
import { useDoctorProfile } from "@/hooks/use-doctor"
import { useAuthStore } from "@/lib/auth-store"
import { VisitStatus } from "@/types"
import { Stethoscope, Activity, Users, ArrowRight, User, Search } from "lucide-react"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { formatDate, formatCurrency } from "@/lib/utils"

export default function DoctorDashboard() {
  const { name } = useAuthStore()
  const { data: profile } = useDoctorProfile()
  const { data: patients = [], isLoading } = usePatients()

  const myPatients = useMemo(() => {
    return patients.filter((p) =>
      p.visits.some(
        (v) =>
          v.status === VisitStatus.TREATMENT_IN_PROGRESS &&
          v.doctorName === profile?.fullName
      )
    )
  }, [patients, profile?.fullName])

  const cards = [
    { label: "My Active Patients", value: isLoading ? "…" : myPatients.length, icon: Users,      bg: "bg-primary-50", ic: "text-primary-600", border: "border-primary-100" },
    { label: "Section",            value: profile?.sectionName ?? "—",          icon: Stethoscope, bg: "bg-accent-50",  ic: "text-accent-500",  border: "border-accent-100"  },
    { label: "Consultation Fee",   value: profile ? formatCurrency(profile.consultationFee) : "—", icon: Activity, bg: "bg-success-50", ic: "text-success-700", border: "border-success-100" },
  ]

  return (
    <div className="space-y-6">
      {/* Personalised greeting */}
      <div className="bg-primary-900 text-white rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-primary-200 text-sm mb-1">Welcome back,</p>
          <h2 className="text-2xl font-bold">{name ?? "Doctor"}</h2>
          {profile?.sectionName && (
            <p className="text-primary-300 text-sm mt-1 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" /> {profile.sectionName}
            </p>
          )}
        </div>
        <div className="h-14 w-14 rounded-full bg-primary-700 border-2 border-primary-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {name?.charAt(0) ?? "D"}
        </div>
      </div>

      <PageHeader
        title="My Dashboard"
        subtitle="Active patients and your profile"
        breadcrumb={[{ label: "Doctor" }, { label: "Dashboard" }]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className={`bg-white rounded-xl border ${c.border} p-5 flex items-start justify-between`}>
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">{c.label}</p>
                <p className="text-2xl font-bold text-neutral-900">{c.value}</p>
              </div>
              <div className={`h-11 w-11 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${c.ic}`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My patients */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">My Active Patients</h3>
            <Link href="/doctor/patients" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              All patients <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-neutral-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 bg-neutral-100 rounded" />
                    <div className="h-3 w-28 bg-neutral-100 rounded" />
                  </div>
                </div>
              ))
            ) : myPatients.length === 0 ? (
              <p className="px-6 py-10 text-sm text-neutral-400 text-center">No active patients assigned to you.</p>
            ) : (
              myPatients.map((p) => {
                const tipVisit = p.visits.find((v) => v.status === VisitStatus.TREATMENT_IN_PROGRESS)
                return (
                  <div key={p.patientId} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 text-xs font-bold shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-neutral-400">P-{p.patientId} · {tipVisit?.issue ?? "—"} · {tipVisit ? formatDate(tipVisit.entryTime) : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tipVisit && <VisitStatusBadge status={tipVisit.status as VisitStatus} />}
                      <Link href={`/doctor/patients/${p.patientId}`} className="text-xs text-primary-600 hover:underline">
                        View
                      </Link>
                    </div>
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
            {[
              { href: "/doctor/patients", label: "Search Patients", icon: Search },
              { href: "/doctor/profile",  label: "My Profile",      icon: User },
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
