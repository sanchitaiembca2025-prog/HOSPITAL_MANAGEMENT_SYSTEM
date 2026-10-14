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
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePatients } from "@/hooks/use-patient"
import { formatDate } from "@/lib/utils"
import { Plus, Users, UserX } from "lucide-react"
import { VisitStatus, PatientResponse } from "@/types"

const ACTIVE_STATUSES: VisitStatus[] = [VisitStatus.ADMITTED, VisitStatus.TREATMENT_IN_PROGRESS]

function canCreateVisit(patient: PatientResponse): { allowed: boolean; reason?: string } {
  if (patient.visits.some((v) => v.status === VisitStatus.DECEASED))
    return { allowed: false, reason: "Deceased patient" }
  if (patient.visits.some((v) => ACTIVE_STATUSES.includes(v.status as VisitStatus)))
    return { allowed: false, reason: "Active visit in progress" }
  return { allowed: true }
}

export default function SearchPatientPage() {
  const [query, setQuery] = useState("")

  const { data: patients = [], isLoading, isError } = usePatients()

  const filtered = useMemo(() => {
    if (!query.trim()) return patients
    const q = query.trim().toLowerCase().replace(/^p-/i, "")
    return patients.filter(
      (p) =>
        String(p.patientId).includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.includes(q)
    )
  }, [patients, query])

  return (
    <div>
      <PageHeader
        title="Search Patient"
        subtitle="All registered patients — search by name, ID, or phone"
        breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Search Patient" }]}
      />

      <SearchBar
        placeholder="Search by name, ID (e.g. P-1), or phone"
        onSearch={setQuery}
        className="max-w-md mb-6"
        autoFocus
      />

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState icon={UserX} title="Failed to load patients" description="Could not fetch patient list. Check backend connection." />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState icon={Users} title={query ? "No patients match your search" : "No patients registered yet"} description={query ? `Try a different search term.` : "Register the first patient to get started."} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Latest Visit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => {
                const latestVisit = patient.visits.at(-1)
                const { allowed, reason } = canCreateVisit(patient)
                return (
                  <TableRow key={patient.patientId}>
                    <TableCell className="font-mono text-sm text-neutral-600">P-{patient.patientId}</TableCell>
                    <TableCell className="font-medium text-neutral-800">
                      <Link href={`/clerk/patients/${patient.patientId}`} className="hover:underline text-primary-600">
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {patient.age}y, {patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">{patient.phone}</TableCell>
                    <TableCell className="text-sm text-neutral-600">{formatDate(patient.registeredAt)}</TableCell>
                    <TableCell>
                      {latestVisit ? (
                        <VisitStatusBadge status={latestVisit.status as VisitStatus} />
                      ) : (
                        <Badge variant="outline" className="text-neutral-400">No visits</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/clerk/patients/${patient.patientId}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        {allowed ? (
                          <Link href={`/clerk/patients/${patient.patientId}/visits/new`}>
                            <Button variant="accent" size="sm">
                              <Plus className="h-3.5 w-3.5 mr-1" /> New Visit
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="accent" size="sm" disabled title={reason}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> New Visit
                          </Button>
                        )}
                      </div>
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
