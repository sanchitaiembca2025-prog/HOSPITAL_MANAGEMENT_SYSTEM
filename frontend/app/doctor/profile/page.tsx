"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDoctorProfile, useUpdateDoctorProfile } from "@/hooks/use-doctor"
import { Loader2, Pencil, X, Check } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  consultationFee: z.number().min(0, "Must be 0 or more").optional(),
})

type FormValues = z.infer<typeof schema>

export default function DoctorProfilePage() {
  const { data: profile, isLoading } = useDoctorProfile()
  const mutation = useUpdateDoctorProfile()
  const [editing, setEditing] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const startEdit = () => {
    reset({ phone: profile?.phone ?? "", email: profile?.email ?? "", consultationFee: profile?.consultationFee ?? 0 })
    setEditing(true)
  }

  const onSubmit = (data: FormValues) => {
    mutation.mutate(
      { phone: data.phone || undefined, email: data.email || undefined, consultationFee: data.consultationFee },
      {
        onSuccess: () => { toast.success("Profile updated"); setEditing(false) },
        onError: () => toast.error("Failed to update profile"),
      }
    )
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Your professional information"
        breadcrumb={[{ label: "Doctor", href: "/doctor" }, { label: "My Profile" }]}
        actions={
          !editing && !isLoading && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          )
        }
      />

      <Card className="max-w-lg">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" /><Skeleton className="h-4 w-40" />
            </div>
          ) : profile && !editing ? (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Full Name</dt>
                <dd className="font-semibold text-neutral-800 text-base">{profile.fullName}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Username</dt>
                <dd className="font-mono text-neutral-700">{profile.username}</dd>
              </div>
              {profile.sectionName && (
                <div>
                  <dt className="text-neutral-500 text-xs mb-0.5">Section</dt>
                  <dd className="text-neutral-800">{profile.sectionName}</dd>
                </div>
              )}
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Consultation Fee</dt>
                <dd className="text-neutral-800 font-medium">{formatCurrency(profile.consultationFee)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Phone</dt>
                <dd className="text-neutral-800">{profile.phone ?? <span className="text-neutral-400 italic">Not set</span>}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Email</dt>
                <dd className="text-neutral-800">{profile.email ?? <span className="text-neutral-400 italic">Not set</span>}</dd>
              </div>
            </dl>
          ) : editing && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" inputMode="numeric" {...register("phone")} aria-invalid={!!errors.phone} />
                {errors.phone && <p className="text-xs text-danger-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                <Input id="consultationFee" type="number" min={0} {...register("consultationFee", { valueAsNumber: true })} aria-invalid={!!errors.consultationFee} />
                {errors.consultationFee && <p className="text-xs text-danger-500">{errors.consultationFee.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="accent" disabled={mutation.isPending}>
                  {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Check className="mr-1 h-4 w-4" /> Save</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={mutation.isPending}>
                  <X className="mr-1 h-4 w-4" /> Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
