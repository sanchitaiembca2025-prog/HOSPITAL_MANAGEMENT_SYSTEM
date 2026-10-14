"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatient } from "@/hooks/use-patient"
import { useCreateVisit } from "@/hooks/use-visit"
import { useMedicalSections, useDoctorsBySection } from "@/hooks/use-lookups"
import { useLookupWards } from "@/hooks/use-wards"
import { PatientType } from "@/types"
import { Loader2 } from "lucide-react"

const schema = z.object({
  issue: z.string().min(3, "Please describe the issue"),
  patientType: z.nativeEnum(PatientType, { error: "Select patient type" }),
  sectionId: z.number().min(1, "Select a section"),
  doctorId: z.number().min(1, "Select a doctor"),
  wardCategoryId: z.number().optional(),
}).refine((d) => {
  if (d.patientType === PatientType.INPATIENT && !d.wardCategoryId) return false
  return true
}, { message: "Select a ward for inpatient", path: ["wardCategoryId"] })

type FormValues = z.infer<typeof schema>

export default function NewVisitPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const router = useRouter()
  const { data: patient, isLoading: patientLoading } = usePatient(patientId)
  const mutation = useCreateVisit(patientId)

  const { data: sections, isLoading: sectionsLoading } = useMedicalSections()
  const { data: wards } = useLookupWards()

  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const { data: doctors, isLoading: doctorsLoading } = useDoctorsBySection(selectedSection)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const patientType = watch("patientType")

  const onSubmit = (data: FormValues) => {
    const payload = {
      issue: data.issue,
      doctorId: data.doctorId,
      patientType: data.patientType,
      ...(data.patientType === PatientType.INPATIENT && data.wardCategoryId
        ? { wardCategoryId: data.wardCategoryId }
        : {}),
    }
    mutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Visit V-${res.visitId} created`)
        router.push(`/clerk/visits/${res.visitId}`)
      },
      onError: () => toast.error("Failed to create visit. Please try again."),
    })
  }

  return (
    <div>
      <PageHeader
        title="New Visit"
        breadcrumb={[
          { label: "Clerk", href: "/clerk" },
          { label: "Patients", href: "/clerk/patients" },
          { label: patientId, href: `/clerk/patients/${patientId}` },
          { label: "New Visit" },
        ]}
      />

      {patientLoading ? (
        <Card className="mb-6"><CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-32" />
        </CardContent></Card>
      ) : patient && (
        <Card className="mb-6 border-primary-100 bg-primary-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono bg-white border border-primary-200 px-2 py-0.5 rounded text-primary-700">P-{patient.patientId}</span>
              <span className="font-semibold text-neutral-800">{patient.firstName} {patient.lastName}</span>
              <span className="text-neutral-600">{patient.age}y, {patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="issue">Chief Complaint / Issue *</Label>
              <Textarea
                id="issue"
                rows={3}
                placeholder="Describe the patient's presenting issue..."
                {...register("issue")}
                aria-invalid={!!errors.issue}
              />
              {errors.issue && <p className="text-xs text-danger-500">{errors.issue.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Patient Type *</Label>
              <RadioGroup
                className="flex gap-6"
                onValueChange={(v) => setValue("patientType", v as PatientType)}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={PatientType.OUTPATIENT} id="type-out" />
                  <Label htmlFor="type-out" className="font-normal cursor-pointer">Outpatient (OPD)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={PatientType.INPATIENT} id="type-in" />
                  <Label htmlFor="type-in" className="font-normal cursor-pointer">Inpatient (IPD)</Label>
                </div>
              </RadioGroup>
              {errors.patientType && <p className="text-xs text-danger-500">{errors.patientType.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Medical Section *</Label>
              <Select
                disabled={sectionsLoading}
                onValueChange={(v) => {
                  const id = Number(v)
                  setSelectedSection(id)
                  setValue("sectionId", id)
                  setValue("doctorId", 0)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={sectionsLoading ? "Loading…" : "Select section"} />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((s) => (
                    <SelectItem key={s.sectionId} value={String(s.sectionId)}>
                      {s.sectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sectionId && <p className="text-xs text-danger-500">{errors.sectionId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Doctor *</Label>
              <Select
                disabled={!selectedSection || doctorsLoading}
                onValueChange={(v) => setValue("doctorId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedSection ? "Select a section first" :
                    doctorsLoading ? "Loading…" :
                    "Select doctor"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((d) => (
                    <SelectItem key={d.userId} value={String(d.userId)}>
                      {d.fullName}{d.consultationFee ? ` — ₹${d.consultationFee}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && <p className="text-xs text-danger-500">{errors.doctorId.message}</p>}
            </div>

            {patientType === PatientType.INPATIENT && (
              <div className="space-y-1.5">
                <Label>Ward Category *</Label>
                <Select onValueChange={(v) => setValue("wardCategoryId", Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards?.map((w) => (
                      <SelectItem
                        key={w.categoryId}
                        value={String(w.categoryId)}
                        disabled={w.availableBeds === 0}
                      >
                        {w.categoryName} — {w.availableBeds}/{w.totalBeds} beds available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.wardCategoryId && <p className="text-xs text-danger-500">{errors.wardCategoryId.message}</p>}
              </div>
            )}

            <Button type="submit" variant="accent" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Visit…</>
              ) : "Create Visit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
