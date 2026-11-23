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
import { Skeleton } from "@/components/ui/skeleton"
import { useDoctorProfile, useUpdateDoctorProfile } from "@/hooks/use-doctor"
import { Loader2, Pencil, X, Check, Stethoscope, Phone, Mail, IndianRupee, User, BadgeCheck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  consultationFee: z.number().min(0, "Must be 0 or more").optional(),
})

type FormValues = z.infer<typeof schema>

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-neutral-100 last:border-0">
      <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-neutral-800 truncate">{value}</p>
      </div>
    </div>
  )
}

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
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="Your professional information"
        breadcrumb={[{ label: "Doctor", href: "/doctor" }, { label: "My Profile" }]}
      />

      <div className="max-w-2xl space-y-5">
        {/* Profile banner */}
        <div className="bg-primary-900 text-white rounded-xl p-6 flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-primary-700 border-2 border-primary-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {isLoading ? "…" : (profile?.fullName?.charAt(0) ?? "D")}
          </div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 bg-primary-700" />
                <Skeleton className="h-4 w-28 bg-primary-700" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold truncate">{profile?.fullName ?? "—"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {profile?.sectionName && (
                    <span className="flex items-center gap-1 text-primary-200 text-sm">
                      <Stethoscope className="h-3.5 w-3.5" /> {profile.sectionName}
                    </span>
                  )}
                  <span className="text-primary-400 text-xs font-mono">@{profile?.username}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-success-500/20 text-success-300 text-xs font-medium px-3 py-1 rounded-full border border-success-500/30 shrink-0">
            <BadgeCheck className="h-3.5 w-3.5" /> Active
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800">Profile Details</h3>
            {!editing && !isLoading && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
            )}
          </div>

          <div className="px-6 py-2">
            {isLoading ? (
              <div className="space-y-4 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !editing ? (
              <>
                <InfoRow icon={User} label="Full Name" value={profile?.fullName ?? "—"} />
                <InfoRow icon={Stethoscope} label="Medical Section" value={profile?.sectionName ?? <span className="text-neutral-400 italic">Not assigned</span>} />
                <InfoRow icon={IndianRupee} label="Consultation Fee" value={profile ? formatCurrency(profile.consultationFee) : "—"} />
                <InfoRow icon={Phone} label="Phone" value={profile?.phone ?? <span className="text-neutral-400 italic">Not set</span>} />
                <InfoRow icon={Mail} label="Email" value={profile?.email ?? <span className="text-neutral-400 italic">Not set</span>} />
              </>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="py-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" inputMode="numeric" placeholder="10-digit number" {...register("phone")} aria-invalid={!!errors.phone} />
                  {errors.phone && <p className="text-xs text-danger-500">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="doctor@hospital.com" {...register("email")} aria-invalid={!!errors.email} />
                  {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                  <Input id="consultationFee" type="number" min={0} {...register("consultationFee", { valueAsNumber: true })} aria-invalid={!!errors.consultationFee} />
                  {errors.consultationFee && <p className="text-xs text-danger-500">{errors.consultationFee.message}</p>}
                </div>
                <div className="flex gap-3 pt-1">
                  <Button type="submit" variant="accent" disabled={mutation.isPending}>
                    {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Check className="mr-1 h-4 w-4" /> Save Changes</>}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={mutation.isPending}>
                    <X className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Read-only note */}
        {!editing && !isLoading && (
          <p className="text-xs text-neutral-400 text-center">
            Name, username, and section are managed by administration. Contact admin to update these.
          </p>
        )}
      </div>
    </div>
  )
}
