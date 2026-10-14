"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/hms/PageHeader"
import { SearchBar } from "@/components/hms/SearchBar"
import { EmptyState } from "@/components/hms/EmptyState"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePatients } from "@/hooks/use-patient"
import { formatDateTime } from "@/lib/utils"
import { Activity, AlertCircle } from "lucide-react"
import { VisitStatus } from "@/types"

const ACTIVE_STATUSES = new Set<string>([
  VisitStatus.ADMITTED,
  VisitStatus.TREATMENT_IN_PROGRESS,
])

export default function ActiveVisitsPage() {
  const [query, setQuery] = useState("")

  const { data: patients = [], isLoading, isError } = usePatients()

  const activeVisits = useMemo(() => {
    const visits: Array<{
      visitId: number
      patientId: number
      patientName: string
      issue: string
      doctorName: string
      status: string
      entryTime: string
    }> = []
    for (const p of patients) {
      for (const v of p.visits) {
        if (ACTIVE_STATUSES.has(v.status)) {
          visits.push({
            visitId: v.visitId,
            patientId: p.patientId,
            patientName: `${p.firstName} ${p.lastName}`,
            issue: v.issue,
            doctorName: v.doctorName,
            status: v.status,
            entryTime: v.entryTime,
          })
        }
      }
    }
    return visits.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
  }, [patients])

  const filtered = useMemo(() => {
    if (!query.trim()) return activeVisits
    const q = query.trim().toLowerCase().replace(/^v-/i, "")
    return activeVisits.filter(
      (v) =>
        String(v.visitId).includes(q) ||
        v.patientName.toLowerCase().includes(q) ||
        String(v.patientId).includes(q)
    )
  }, [activeVisits, query])

  return (
    <div>
      <PageHeader
        title="Active Visits"
        subtitle="All currently admitted or in-treatment patients"
        breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Active Visits" }]}
      />

      <SearchBar
        placeholder="Search by visit ID, patient name, or patient ID"
        onSearch={setQuery}
        className="max-w-md mb-6"
        autoFocus
      />

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState icon={AlertCircle} title="Failed to load visits" description="Could not fetch active visits. Check backend connection." />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={Activity}
          title={query ? "No visits match your search" : "No active visits"}
          description={query ? "Try a different search term." : "No patients are currently admitted or in treatment."}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visit ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.visitId}>
                  <TableCell className="font-mono text-sm text-neutral-600">V-{v.visitId}</TableCell>
                  <TableCell className="font-medium text-neutral-800">
                    <Link href={`/clerk/patients/${v.patientId}`} className="hover:underline text-primary-600">
                      {v.patientName}
                    </Link>
                    <span className="ml-2 text-xs text-neutral-400 font-mono">P-{v.patientId}</span>
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate text-sm text-neutral-600">{v.issue}</TableCell>
                  <TableCell className="text-sm text-neutral-600">{v.doctorName}</TableCell>
                  <TableCell><VisitStatusBadge status={v.status as VisitStatus} /></TableCell>
                  <TableCell className="text-sm text-neutral-500">{formatDateTime(v.entryTime)}</TableCell>
                  <TableCell>
                    <Link href={`/clerk/visits/${v.visitId}`}>
                      <Button variant="accent" size="sm">Manage</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
