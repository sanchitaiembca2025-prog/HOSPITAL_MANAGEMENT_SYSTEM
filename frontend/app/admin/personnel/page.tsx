"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { EmptyState } from "@/components/hms/EmptyState"
import { ConfirmDialog } from "@/components/hms/ConfirmDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePersonnel, useTogglePersonnelStatus, useCreateUser } from "@/hooks/use-personnel"
import { useMedicalSections } from "@/hooks/use-lookups"
import { Users, ExternalLink, Plus, Loader2 } from "lucide-react"
import { Role, PersonnelResponse } from "@/types"

// ── Create User Form ──────────────────────────────────────────────────────────

const createSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role, { error: "Role required" }),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  consultationFee: z.number().min(0).optional(),
  sectionId: z.number().optional(),
})
type CreateFormValues = z.infer<typeof createSchema>

function CreateUserDialog({
  open,
  onOpenChange,
  defaultRole,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultRole: Role
}) {
  const mutation = useCreateUser()
  const { data: sections = [] } = useMedicalSections()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: defaultRole },
  })

  const role = watch("role")
  const isDoctor = role === Role.DOCTOR

  const onSubmit = (data: CreateFormValues) => {
    mutation.mutate(
      {
        fullName: data.fullName,
        username: data.username,
        password: data.password,
        role: data.role,
        phone: data.phone || undefined,
        email: data.email || undefined,
        consultationFee: isDoctor ? data.consultationFee : undefined,
        sectionId: isDoctor ? data.sectionId : undefined,
      },
      {
        onSuccess: (created) => {
          toast.success(`${created.fullName} added successfully`)
          reset({ role: defaultRole })
          onOpenChange(false)
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message
          toast.error(msg || "Failed to create user")
        },
      }
    )
  }

  const handleOpenChange = (v: boolean) => {
    if (!v) reset({ role: defaultRole })
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select
              value={role}
              onValueChange={(v) => setValue("role", v as Role, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.DOCTOR}>Doctor</SelectItem>
                <SelectItem value={Role.CLERK}>Clerk</SelectItem>
                <SelectItem value={Role.LAB}>Lab</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-danger-500">{errors.role.message}</p>}
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" {...register("fullName")} placeholder="Dr. Jane Smith" />
            {errors.fullName && <p className="text-xs text-danger-500">{errors.fullName.message}</p>}
          </div>

          {/* Username + Password side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username *</Label>
              <Input id="username" {...register("username")} placeholder="jsmith" autoComplete="off" />
              {errors.username && <p className="text-xs text-danger-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" {...register("password")} placeholder="min 6 chars" autoComplete="new-password" />
              {errors.password && <p className="text-xs text-danger-500">{errors.password.message}</p>}
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="Optional" />
              {errors.email && <p className="text-xs text-danger-500">{errors.email.message}</p>}
            </div>
          </div>

          {/* Doctor-only fields */}
          {isDoctor && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("consultationFee", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Medical Section</Label>
                <Select
                  onValueChange={(v) => setValue("sectionId", Number(v), { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s.sectionId} value={String(s.sectionId)}>
                        {s.sectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</>
              ) : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Role Tab ──────────────────────────────────────────────────────────────────

function RoleTab({ role }: { role: Role }) {
  const { data: staff, isLoading } = usePersonnel(role)
  const toggleMutation = useTogglePersonnelStatus()
  const [confirmItem, setConfirmItem] = useState<PersonnelResponse | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const handleToggle = () => {
    if (!confirmItem) return
    toggleMutation.mutate(
      { id: confirmItem.userId, isActive: !confirmItem.isActive },
      {
        onSuccess: () => {
          toast.success(`${confirmItem.fullName} ${confirmItem.isActive ? "deactivated" : "activated"}`)
          setConfirmItem(null)
        },
        onError: () => toast.error("Failed to update status"),
      }
    )
  }

  const roleLabel = role === Role.DOCTOR ? "Doctor" : role === Role.CLERK ? "Clerk" : "Lab"

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add {roleLabel}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : !staff || staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title={`No ${roleLabel.toLowerCase()} accounts`}
          description={`No ${roleLabel.toLowerCase()} staff yet. Add one to get started.`}
        />
      ) : (
        <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Contact</TableHead>
                {role === Role.DOCTOR && <TableHead>Section</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((p) => (
                <TableRow key={p.userId}>
                  <TableCell className="font-medium text-neutral-800">{p.fullName}</TableCell>
                  <TableCell className="font-mono text-sm text-neutral-600">{p.username}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {p.phone && <div>{p.phone}</div>}
                    {p.email && <div className="text-xs text-neutral-500">{p.email}</div>}
                    {!p.phone && !p.email && <span className="text-neutral-300">—</span>}
                  </TableCell>
                  {role === Role.DOCTOR && (
                    <TableCell className="text-sm text-neutral-600">
                      {p.sectionName ?? <span className="text-neutral-300">—</span>}
                    </TableCell>
                  )}
                  <TableCell>
                    {p.isActive ? (
                      <Badge className="bg-success-100 text-success-700 border-success-300">Active</Badge>
                    ) : (
                      <Badge className="bg-neutral-100 text-neutral-500 border-neutral-200">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/admin/personnel/${p.userId}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={p.isActive ? "text-danger-500 hover:bg-danger-50" : "text-success-600 hover:bg-success-50"}
                        onClick={() => setConfirmItem(p)}
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateUserDialog
        key={`create-${role}`}
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultRole={role}
      />

      <ConfirmDialog
        open={!!confirmItem}
        onOpenChange={(v) => !v && setConfirmItem(null)}
        title={confirmItem?.isActive ? "Deactivate Account" : "Activate Account"}
        description={`${confirmItem?.isActive ? "Deactivate" : "Activate"} ${confirmItem?.fullName}? ${confirmItem?.isActive ? "They will lose access to the system." : "They will regain access."}`}
        confirmLabel={confirmItem?.isActive ? "Deactivate" : "Activate"}
        variant={confirmItem?.isActive ? "destructive" : "success"}
        isLoading={toggleMutation.isPending}
        onConfirm={handleToggle}
      />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PersonnelPage() {
  return (
    <div>
      <PageHeader
        title="Personnel"
        subtitle="Manage hospital staff by role"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Personnel" }]}
      />

      <Tabs defaultValue={Role.DOCTOR}>
        <TabsList className="mb-4">
          <TabsTrigger value={Role.DOCTOR}>Doctors</TabsTrigger>
          <TabsTrigger value={Role.CLERK}>Clerks</TabsTrigger>
          <TabsTrigger value={Role.LAB}>Lab</TabsTrigger>
        </TabsList>
        <TabsContent value={Role.DOCTOR}><RoleTab role={Role.DOCTOR} /></TabsContent>
        <TabsContent value={Role.CLERK}><RoleTab role={Role.CLERK} /></TabsContent>
        <TabsContent value={Role.LAB}><RoleTab role={Role.LAB} /></TabsContent>
      </Tabs>
    </div>
  )
}
