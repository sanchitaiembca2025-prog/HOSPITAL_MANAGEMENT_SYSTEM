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
import { useDoctorProfile } from "@/hooks/use-doctor"
import { formatDate } from "@/lib/utils"
import { Users, AlertCircle } from "lucide-react"
import { VisitStatus } from "@/types"

export default function DoctorPatientSearchPage() {
  const [query, setQuery] = useState("")

  const { data: patients = [], isLoading, isError } = usePatients()
  const { data: profile } = useDoctorProfile()

  // Show only patients who have a TIP visit assigned to this doctor
  const tipPatients = useMemo(
    () => patients.filter((p) =>
      p.visits.some(
        (v) => v.status === VisitStatus.TREATMENT_IN_PROGRESS && v.doctorName === profile?.fullName
      )
    ),
    [patients, profile]
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return tipPatients
    const q = query.trim().toLowerCase().replace(/^p-/i, "")
    return tipPatients.filter(
      (p) =>
        String(p.patientId).includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.includes(q)
    )
  }, [tipPatients, query])

  return (
    <div>
      <PageHeader
        title="Patients in Treatment"
        subtitle="Patients with an active Treatment In Progress visit"
        breadcrumb={[{ label: "Doctor", href: "/doctor" }, { label: "Patients" }]}
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
          icon={Users}
          title={query ? "No patients match your search" : "No patients in treatment"}
          description={query ? "Try a different search term." : "No patients currently have a Treatment In Progress visit."}
        />
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
                <TableHead>Active Visit</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Admitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => {
                const tipVisit = patient.visits.find((v) => v.status === VisitStatus.TREATMENT_IN_PROGRESS)
                return (
                  <TableRow key={patient.patientId}>
                    <TableCell className="font-mono text-sm text-neutral-600">P-{patient.patientId}</TableCell>
                    <TableCell className="font-medium text-neutral-800">
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {patient.age}y, {patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">{patient.phone}</TableCell>
                    <TableCell>
                      {tipVisit && (
                        <div className="space-y-0.5">
                          <VisitStatusBadge status={tipVisit.status as VisitStatus} />
                          <p className="text-xs text-neutral-500 truncate max-w-[140px]">{tipVisit.issue}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">{tipVisit?.doctorName ?? "—"}</TableCell>
                    <TableCell className="text-sm text-neutral-500">{tipVisit ? formatDate(tipVisit.entryTime) : "—"}</TableCell>
                    <TableCell>
                      <Link href={`/doctor/patients/${patient.patientId}`}>
                        <Button variant="accent" size="sm">View</Button>
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
