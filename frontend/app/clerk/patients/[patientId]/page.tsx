"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/hms/PageHeader"
import { EmptyState } from "@/components/hms/EmptyState"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePatient } from "@/hooks/use-patient"
import { formatDate } from "@/lib/utils"
import { Phone, MapPin, Calendar, Plus, ClipboardList, UserX, Ban } from "lucide-react"
import { VisitStatus } from "@/types"

function getNewVisitBlock(visits: { status: string }[]): string | null {
  if (visits.some((v) => v.status === VisitStatus.DECEASED))
    return "Permanent block — patient has a deceased visit record"
  if (visits.some((v) => v.status === VisitStatus.ADMITTED || v.status === VisitStatus.TREATMENT_IN_PROGRESS))
    return "Active visit in progress — discharge first"
  return null
}

export default function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { data: patient, isLoading, isError } = usePatient(patientId)

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Patient Detail" breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Patients", href: "/clerk/patients" }, { label: patientId }]} />
        <Card><CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-56" /><Skeleton className="h-4 w-72" /><Skeleton className="h-4 w-48" />
        </CardContent></Card>
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div>
        <PageHeader title="Patient Detail" breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Patients", href: "/clerk/patients" }, { label: patientId }]} />
        <EmptyState icon={UserX} title="Patient not found" description="This patient record could not be loaded." />
      </div>
    )
  }

  const blockReason = getNewVisitBlock(patient.visits)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Patients", href: "/clerk/patients" }, { label: `P-${patient.patientId}` }]}
        actions={
          blockReason ? (
            <Button variant="accent" disabled title={blockReason}>
              <Ban className="h-4 w-4 mr-1" /> New Visit
            </Button>
          ) : (
            <Link href={`/clerk/patients/${patientId}/visits/new`}>
              <Button variant="accent"><Plus className="h-4 w-4 mr-1" /> New Visit</Button>
            </Link>
          )
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-sm bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">P-{patient.patientId}</span>
            <span className="text-sm text-neutral-600">{patient.age}y, {patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}</span>
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-neutral-600">
            <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{patient.phone}</span>
            {patient.address && <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{patient.address}</span>}
            <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />Registered {formatDate(patient.registeredAt)}</span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-neutral-600 mb-3">Visit History ({patient.visits.length})</h3>
        {patient.visits.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No visits yet" description="Start a new visit for this patient." />
        ) : (
          <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visit ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.visits.map((v) => (
                  <TableRow key={v.visitId}>
                    <TableCell className="font-mono text-sm">V-{v.visitId}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{v.issue}</TableCell>
                    <TableCell>{v.doctorName}</TableCell>
                    <TableCell><VisitStatusBadge status={v.status as VisitStatus} /></TableCell>
                    <TableCell className="text-neutral-600 text-sm">{formatDate(v.entryTime)}</TableCell>
                    <TableCell>
                      <Link href={`/clerk/visits/${v.visitId}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
