"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { useRegisterPatient } from "@/hooks/use-patient"
import { Gender } from "@/types"
import { Loader2, CheckCircle2 } from "lucide-react"

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  address: z.string(),
  gender: z.nativeEnum(Gender, { error: "Gender is required" }),
  age: z.number().int().min(0).max(150, "Enter a valid age"),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPatientPage() {
  const router = useRouter()
  const mutation = useRegisterPatient()
  const [newPatientId, setNewPatientId] = useState<number | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data, {
      onSuccess: (res) => {
        setNewPatientId(res.patientId)
        toast.success(`Patient registered. ID: P-${res.patientId}`)
      },
      onError: () => toast.error("Failed to register patient. Please try again."),
    })
  }

  if (newPatientId) {
    return (
      <div>
        <PageHeader
          title="Register New Patient"
          breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Register Patient" }]}
        />
        <Card className="max-w-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-success-700 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-neutral-800">Patient registered successfully!</p>
                <p className="text-sm text-neutral-600 mt-1">
                  Patient ID: <span className="font-mono font-medium">P-{newPatientId}</span>
                </p>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="accent"
                    onClick={() => router.push(`/clerk/patients/${newPatientId}`)}
                  >
                    View Patient
                  </Button>
                  <Button variant="outline" onClick={() => setNewPatientId(null)}>
                    Register Another
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Register New Patient"
        subtitle="Add a new patient to the system"
        breadcrumb={[{ label: "Clerk", href: "/clerk" }, { label: "Register Patient" }]}
      />
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register("firstName")} aria-invalid={!!errors.firstName} />
                {errors.firstName && <p className="text-xs text-danger-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register("lastName")} aria-invalid={!!errors.lastName} />
                {errors.lastName && <p className="text-xs text-danger-500">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" inputMode="numeric" {...register("phone")} aria-invalid={!!errors.phone} />
                {errors.phone && <p className="text-xs text-danger-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" min={0} max={150} {...register("age", { valueAsNumber: true })} aria-invalid={!!errors.age} />
                {errors.age && <p className="text-xs text-danger-500">{errors.age.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={2} {...register("address")} placeholder="Street, City, State" />
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <RadioGroup
                className="flex gap-6"
                onValueChange={(v) => setValue("gender", v as Gender)}
              >
                {[Gender.MALE, Gender.FEMALE, Gender.OTHER].map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <RadioGroupItem value={g} id={`gender-${g}`} />
                    <Label htmlFor={`gender-${g}`} className="font-normal cursor-pointer">
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.gender && <p className="text-xs text-danger-500">{errors.gender.message}</p>}
            </div>

            <Button type="submit" variant="accent" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
              ) : "Register Patient"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
