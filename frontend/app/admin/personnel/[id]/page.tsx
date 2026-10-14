"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { RoleBadge } from "@/components/hms/RoleBadge"
import { EmptyState } from "@/components/hms/EmptyState"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { usePersonnelById, useUpdatePersonnel } from "@/hooks/use-personnel"
import { Loader2, Pencil, X, Check } from "lucide-react"
import { Role } from "@/types"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
  fullName: z.string().min(1, "Name required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  consultationFee: z.number().min(0).optional(),
})
type FormValues = z.infer<typeof schema>

export default function PersonnelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const { data: person, isLoading, isError } = usePersonnelById(userId)
  const mutation = useUpdatePersonnel()
  const [editing, setEditing] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const startEdit = () => {
    reset({ fullName: person?.fullName ?? "", phone: person?.phone ?? "", email: person?.email ?? "", consultationFee: person?.consultationFee ?? 0 })
    setEditing(true)
  }

  const onSubmit = (data: FormValues) => {
    mutation.mutate(
      { id: userId, fullName: data.fullName, phone: data.phone || undefined, email: data.email || undefined, consultationFee: data.consultationFee },
      {
        onSuccess: () => { toast.success("Staff member updated"); setEditing(false) },
        onError: () => toast.error("Failed to update"),
      }
    )
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Personnel Detail" breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Personnel", href: "/admin/personnel" }, { label: id }]} />
        <Card className="max-w-lg"><CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" />
        </CardContent></Card>
      </div>
    )
  }

  if (isError || !person) {
    return (
      <div>
        <PageHeader title="Personnel Detail" breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Personnel", href: "/admin/personnel" }, { label: id }]} />
        <EmptyState icon={Pencil} title="Not found" description="This staff member could not be loaded." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={person.fullName}
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Personnel", href: "/admin/personnel" }, { label: person.fullName }]}
        actions={
          !editing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          )
        }
      />

      <Card className="max-w-lg">
        <CardContent className="p-6">
          {!editing ? (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Full Name</dt>
                <dd className="font-semibold text-neutral-800">{person.fullName}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Username</dt>
                <dd className="font-mono text-neutral-700">{person.username}</dd>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <dt className="text-neutral-500 text-xs mb-0.5">Role</dt>
                  <RoleBadge role={person.role as Role} />
                </div>
                <div>
                  <dt className="text-neutral-500 text-xs mb-0.5">Status</dt>
                  <dd>
                    {person.isActive
                      ? <Badge className="bg-success-100 text-success-700 border-success-300">Active</Badge>
                      : <Badge className="bg-neutral-100 text-neutral-500">Inactive</Badge>
                    }
                  </dd>
                </div>
              </div>
              {person.sectionName && (
                <div>
                  <dt className="text-neutral-500 text-xs mb-0.5">Section</dt>
                  <dd>{person.sectionName}</dd>
                </div>
              )}
              {person.consultationFee != null && (
                <div>
                  <dt className="text-neutral-500 text-xs mb-0.5">Consultation Fee</dt>
                  <dd>{formatCurrency(person.consultationFee)}</dd>
                </div>
              )}
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Phone</dt>
                <dd>{person.phone ?? <span className="text-neutral-400 italic">Not set</span>}</dd>
              </div>
              <div>
                <dt className="text-neutral-500 text-xs mb-0.5">Email</dt>
                <dd>{person.email ?? <span className="text-neutral-400 italic">Not set</span>}</dd>
              </div>
            </dl>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" {...register("fullName")} aria-invalid={!!errors.fullName} />
                {errors.fullName && <p className="text-xs text-danger-500">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" inputMode="numeric" {...register("phone")} />
                {errors.phone && <p className="text-xs text-danger-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
              </div>
              {person.consultationFee != null && (
                <div className="space-y-1.5">
                  <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                  <Input id="consultationFee" type="number" min={0} {...register("consultationFee", { valueAsNumber: true })} />
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" variant="accent" disabled={mutation.isPending}>
                  {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Check className="mr-1 h-4 w-4" /> Save</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
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
