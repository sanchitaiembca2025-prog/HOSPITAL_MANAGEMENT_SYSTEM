"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/hms/PageHeader"
import { SearchBar } from "@/components/hms/SearchBar"
import { EmptyState } from "@/components/hms/EmptyState"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePatients } from "@/hooks/use-patient"
import { formatDate } from "@/lib/utils"
import { FlaskConical, AlertCircle } from "lucide-react"
import { VisitStatus } from "@/types"

const ACTIVE_STATUSES = new Set<string>([
  VisitStatus.ADMITTED,
  VisitStatus.TREATMENT_IN_PROGRESS,
])

export default function LabPatientSearchPage() {
  const [query, setQuery] = useState("")

  const { data: patients = [], isLoading, isError } = usePatients()

  // Show patients with any active visit
  const activePatients = useMemo(
    () => patients.filter((p) => p.visits.some((v) => ACTIVE_STATUSES.has(v.status))),
    [patients]
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return activePatients
    const q = query.trim().toLowerCase().replace(/^p-/i, "")
    return activePatients.filter(
      (p) =>
        String(p.patientId).includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.includes(q)
    )
  }, [activePatients, query])

  return (
    <div>
      <PageHeader
        title="Search Patient"
        subtitle="Patients with active visits available for lab work"
        breadcrumb={[{ label: "Lab", href: "/lab" }, { label: "Search Patient" }]}
      />

      <SearchBar
        placeholder="Search by name, ID (e.g. P-1), or phone"
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
        <EmptyState icon={AlertCircle} title="Failed to load patients" description="Could not fetch patient list. Check backend connection." />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title={query ? "No patients match your search" : "No active patients"}
          description={query ? "Try a different search term." : "No patients are currently admitted or in treatment."}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Visit</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => {
                const activeVisit = patient.visits.find((v) => ACTIVE_STATUSES.has(v.status))
                return (
                  <TableRow key={patient.patientId}>
                    <TableCell className="font-mono text-sm text-neutral-600">P-{patient.patientId}</TableCell>
                    <TableCell className="font-medium text-neutral-800">
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">{patient.age}y</TableCell>
                    <TableCell className="text-sm text-neutral-600">{patient.phone}</TableCell>
                    <TableCell className="font-mono text-sm text-neutral-600">
                      {activeVisit ? `V-${activeVisit.visitId}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">{activeVisit?.doctorName ?? "—"}</TableCell>
                    <TableCell>
                      {activeVisit && <VisitStatusBadge status={activeVisit.status as VisitStatus} />}
                    </TableCell>
                    <TableCell>
                      <Link href={`/lab/patients/${patient.patientId}`}>
                        <Button variant="accent" size="sm">
                          <FlaskConical className="h-4 w-4 mr-1" /> Open Lab
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
