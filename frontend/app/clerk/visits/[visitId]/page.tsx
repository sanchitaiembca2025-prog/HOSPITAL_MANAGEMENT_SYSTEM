"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/hms/PageHeader"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { InvoiceBreakdown } from "@/components/hms/InvoiceBreakdown"
import { ConfirmDialog } from "@/components/hms/ConfirmDialog"
import { EmptyState } from "@/components/hms/EmptyState"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useVisit, useVisitInvoice, useAdmitVisit, useGenerateInvoice, usePayInvoice } from "@/hooks/use-visit"
import { formatDateTime } from "@/lib/utils"
import { toast } from "sonner"
import {
  User, Stethoscope, BedDouble, Calendar, Clock, FileText,
  CheckCircle2, Receipt, CreditCard, AlertTriangle
} from "lucide-react"
import { VisitStatus, PatientType, PaymentStatus } from "@/types"

export default function VisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>()
  const { data: visit, isLoading, isError } = useVisit(visitId)
  const { data: invoice, isLoading: invoiceLoading } = useVisitInvoice(visitId)

  const admitMutation = useAdmitVisit()
  const generateMutation = useGenerateInvoice()
  const payMutation = usePayInvoice()

  const [admitOpen, setAdmitOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Visit Detail" breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Visit" }]} />
        <Card><CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" /><Skeleton className="h-4 w-40" />
        </CardContent></Card>
      </div>
    )
  }

  if (isError || !visit) {
    return (
      <div>
        <PageHeader title="Visit Detail" breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Visit" }]} />
        <EmptyState icon={AlertTriangle} title="Visit not found" description="This visit could not be loaded." />
      </div>
    )
  }

  const canAdmit = visit.status === VisitStatus.ADMITTED
  const canGenerate = (visit.status === VisitStatus.TREATMENT_IN_PROGRESS || visit.status === VisitStatus.DECEASED) && !invoice
  const canPay = invoice && invoice.paymentStatus === PaymentStatus.PENDING

  const handleAdmit = () => {
    admitMutation.mutate(visit.visitId, {
      onSuccess: () => { toast.success("Visit admitted"); setAdmitOpen(false) },
      onError: () => toast.error("Failed to admit visit"),
    })
  }

  const handleGenerate = () => {
    generateMutation.mutate(visit.visitId, {
      onSuccess: () => { toast.success("Invoice generated"); setGenerateOpen(false) },
      onError: () => toast.error("Failed to generate invoice"),
    })
  }

  const handlePay = () => {
    payMutation.mutate(visit.visitId, {
      onSuccess: () => { toast.success("Payment marked as received"); setPayOpen(false) },
      onError: () => toast.error("Failed to update payment"),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Visit V-${visit.visitId}`}
        breadcrumb={[
          { label: "Clerk", href: "/clerk" },
          { label: "Patients", href: "/clerk/patients" },
          { label: `P-${visit.patientId}`, href: `/clerk/patients/${visit.patientId}` },
          { label: `V-${visit.visitId}` },
        ]}
        actions={
          <div className="flex gap-2">
            {canAdmit && (
              <Button variant="accent" size="sm" onClick={() => setAdmitOpen(true)}>
                <BedDouble className="h-4 w-4 mr-1" /> Admit
              </Button>
            )}
            {canGenerate && (
              <Button variant="accent" size="sm" onClick={() => setGenerateOpen(true)}>
                <Receipt className="h-4 w-4 mr-1" /> Generate Invoice
              </Button>
            )}
            {canPay && (
              <Button variant="success" size="sm" onClick={() => setPayOpen(true)}>
                <CreditCard className="h-4 w-4 mr-1" /> Mark Paid
              </Button>
            )}
          </div>
        }
      />

      {/* Visit info card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-500 text-xs">Patient</p>
                <Link href={`/clerk/patients/${visit.patientId}`} className="font-medium text-primary-600 hover:underline">
                  {visit.patientName} <span className="font-mono text-neutral-500">(P-{visit.patientId})</span>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Stethoscope className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-500 text-xs">Doctor</p>
                <p className="font-medium text-neutral-800">{visit.doctorName}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-500 text-xs">Issue</p>
                <p className="text-neutral-800">{visit.issue}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <BedDouble className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-500 text-xs">Type / Ward</p>
                <p className="text-neutral-800">
                  {visit.patientType === PatientType.INPATIENT ? "Inpatient" : "Outpatient"}
                  {visit.wardCategory ? ` — ${visit.wardCategory}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-500 text-xs">Entry</p>
                <p className="text-neutral-800">{formatDateTime(visit.entryTime)}</p>
              </div>
            </div>

            {visit.dischargeTime && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-neutral-500 text-xs">Discharge</p>
                  <p className="text-neutral-800">{formatDateTime(visit.dischargeTime)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-500 text-xs">Status</p>
                <VisitStatusBadge status={visit.status} />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-neutral-500 text-xs">Prescription</p>
                <p className="text-neutral-800">{visit.prescriptionReady ? "Ready" : "Pending"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice section */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-600 mb-3">Invoice</h3>
        {invoiceLoading ? (
          <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
        ) : invoice ? (
          <InvoiceBreakdown invoice={invoice} />
        ) : (
          <EmptyState
            icon={Receipt}
            title="No invoice yet"
            description={
              canGenerate
                ? "The visit is complete. Generate an invoice to bill the patient."
                : "Invoice can be generated once the visit is admitted and in Treatment In Progress, or after the patient is marked Deceased."
            }
          />
        )}
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={admitOpen}
        onOpenChange={setAdmitOpen}
        title="Admit Visit"
        description="Mark this visit as admitted? This will move it to Treatment In Progress."
        confirmLabel="Admit"
        isLoading={admitMutation.isPending}
        onConfirm={handleAdmit}
      />
      <ConfirmDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        title="Generate Invoice"
        description="Generate the final invoice for this visit? Costs from lab and treatment will be included."
        confirmLabel="Generate Invoice"
        isLoading={generateMutation.isPending}
        onConfirm={handleGenerate}
      />
      <ConfirmDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        title="Mark as Paid"
        description="Confirm that payment has been received for this invoice?"
        confirmLabel="Mark Paid"
        variant="success"
        isLoading={payMutation.isPending}
        onConfirm={handlePay}
      />
    </div>
  )
}
