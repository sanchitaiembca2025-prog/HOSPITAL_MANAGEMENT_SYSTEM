"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { FileUploadZone } from "@/components/hms/FileUploadZone"
import { EmptyState } from "@/components/hms/EmptyState"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useDoctorPatient, useUploadPrescription, useMarkDeceased } from "@/hooks/use-doctor"
import { formatDate } from "@/lib/utils"
import { Phone, MapPin, Calendar, UserX, Upload, Skull, Loader2 } from "lucide-react"
import { VisitStatus, PatientResponse } from "@/types"

const deceasedSchema = z.object({
  causeOfDeath: z.string().min(2, "Required"),
  dateOfDeath: z.string().min(1, "Required"),
  timeOfDeath: z.string().min(1, "Required"),
})
type DeceasedFormValues = z.infer<typeof deceasedSchema>

function UploadPrescriptionModal({
  visitId,
  open,
  onOpenChange,
}: { visitId: number; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const mutation = useUploadPrescription()

  const handleUpload = () => {
    if (!file) return
    mutation.mutate({ visitId, file }, {
      onSuccess: () => { toast.success("Prescription uploaded"); onOpenChange(false); setFile(null) },
      onError: () => toast.error("Upload failed"),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Upload Prescription</DialogTitle></DialogHeader>
        <FileUploadZone onFileSelect={setFile} onClear={() => setFile(null)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="accent" onClick={handleUpload} disabled={!file || mutation.isPending}>
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MarkDeceasedModal({
  visitId,
  open,
  onOpenChange,
}: { visitId: number; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [pmFile, setPmFile] = useState<File | null>(null)
  const mutation = useMarkDeceased()

  const { register, handleSubmit, formState: { errors } } = useForm<DeceasedFormValues>({
    resolver: zodResolver(deceasedSchema),
  })

  const onSubmit = (data: DeceasedFormValues) => {
    if (!pmFile) { toast.error("Post-mortem file required"); return }
    mutation.mutate(
      { visitId, ...data, postMortemFile: pmFile },
      {
        onSuccess: () => { toast.success("Marked as deceased"); onOpenChange(false) },
        onError: () => toast.error("Failed to update visit"),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-danger-600">Mark as Deceased</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="causeOfDeath">Cause of Death *</Label>
            <Input id="causeOfDeath" {...register("causeOfDeath")} />
            {errors.causeOfDeath && <p className="text-xs text-danger-500">{errors.causeOfDeath.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfDeath">Date of Death *</Label>
              <Input id="dateOfDeath" type="date" {...register("dateOfDeath")} />
              {errors.dateOfDeath && <p className="text-xs text-danger-500">{errors.dateOfDeath.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeOfDeath">Time of Death *</Label>
              <Input id="timeOfDeath" type="time" {...register("timeOfDeath")} />
              {errors.timeOfDeath && <p className="text-xs text-danger-500">{errors.timeOfDeath.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Post-Mortem Report (PDF) *</Label>
            <FileUploadZone onFileSelect={setPmFile} onClear={() => setPmFile(null)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={mutation.isPending}>
              {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function DoctorPatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const { data: patient, isLoading, isError } = useDoctorPatient(patientId) as {
    data: PatientResponse | undefined
    isLoading: boolean
    isError: boolean
  }

  const [prescriptionVisitId, setPrescriptionVisitId] = useState<number | null>(null)
  const [deceasedVisitId, setDeceasedVisitId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Patient Detail" breadcrumb={[{ label: "Doctor", href: "/doctor" }, { label: "Patients", href: "/doctor/patients" }, { label: patientId }]} />
        <Card><CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-56" /><Skeleton className="h-4 w-72" /><Skeleton className="h-4 w-48" />
        </CardContent></Card>
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div>
        <PageHeader title="Patient Detail" breadcrumb={[{ label: "Doctor", href: "/doctor" }, { label: "Patients", href: "/doctor/patients" }, { label: patientId }]} />
        <EmptyState icon={UserX} title="Patient not found" description="This patient record could not be loaded." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        breadcrumb={[{ label: "Doctor", href: "/doctor" }, { label: "Patients", href: "/doctor/patients" }, { label: `P-${patient.patientId}` }]}
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
          <EmptyState icon={UserX} title="No visits" description="This patient has no visit records yet." />
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.visits.map((v) => {
                  const isTip = v.status === VisitStatus.TREATMENT_IN_PROGRESS
                  return (
                    <TableRow key={v.visitId}>
                      <TableCell className="font-mono text-sm">V-{v.visitId}</TableCell>
                      <TableCell className="max-w-[160px] truncate">{v.issue}</TableCell>
                      <TableCell>{v.doctorName}</TableCell>
                      <TableCell><VisitStatusBadge status={v.status as VisitStatus} /></TableCell>
                      <TableCell className="text-neutral-600 text-sm">{formatDate(v.entryTime)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {isTip && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPrescriptionVisitId(v.visitId)}
                              >
                                <Upload className="h-3 w-3 mr-1" /> Rx
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger-500 hover:bg-danger-50"
                                onClick={() => setDeceasedVisitId(v.visitId)}
                              >
                                <Skull className="h-3 w-3 mr-1" /> Deceased
                              </Button>
                            </>
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

      {prescriptionVisitId && (
        <UploadPrescriptionModal
          key={`rx-${prescriptionVisitId}`}
          visitId={prescriptionVisitId}
          open={!!prescriptionVisitId}
          onOpenChange={(v) => !v && setPrescriptionVisitId(null)}
        />
      )}
      {deceasedVisitId && (
        <MarkDeceasedModal
          key={`deceased-${deceasedVisitId}`}
          visitId={deceasedVisitId}
          open={!!deceasedVisitId}
          onOpenChange={(v) => !v && setDeceasedVisitId(null)}
        />
      )}
    </div>
  )
}
