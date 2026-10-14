"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { EmptyState } from "@/components/hms/EmptyState"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useSeminars, useCreateSeminar, useUpdateSeminar } from "@/hooks/use-seminars"
import { GraduationCap, Plus, Pencil, Calendar, Clock, Hash, Loader2 } from "lucide-react"
import { SeminarResponse } from "@/types"
import { formatDate } from "@/lib/utils"

const schema = z.object({
  seminarName: z.string().min(1, "Name required"),
  seminarDate: z.string().min(1, "Date required"),
  durationHours: z.number().int().min(1, "Must be at least 1 hour"),
  hallNumber: z.string().min(1, "Hall number required"),
})
type FormValues = z.infer<typeof schema>

function SeminarDialog({
  item,
  open,
  onOpenChange,
}: { item: SeminarResponse | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const createMutation = useCreateSeminar()
  const updateMutation = useUpdateSeminar()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      seminarName: item?.seminarName ?? "",
      seminarDate: item?.seminarDate?.slice(0, 10) ?? "",
      durationHours: item?.durationHours ?? 1,
      hallNumber: item?.hallNumber ?? "",
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: FormValues) => {
    if (item) {
      updateMutation.mutate({ seminarId: item.seminarId, ...data }, {
        onSuccess: () => { toast.success("Seminar updated"); onOpenChange(false) },
        onError: () => toast.error("Failed to update"),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { toast.success("Seminar created"); onOpenChange(false) },
        onError: () => toast.error("Failed to create"),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{item ? "Edit Seminar" : "New Seminar"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="seminarName">Seminar Name *</Label>
            <Input id="seminarName" {...register("seminarName")} aria-invalid={!!errors.seminarName} />
            {errors.seminarName && <p className="text-xs text-danger-500">{errors.seminarName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seminarDate">Date *</Label>
            <Input id="seminarDate" type="date" {...register("seminarDate")} aria-invalid={!!errors.seminarDate} />
            {errors.seminarDate && <p className="text-xs text-danger-500">{errors.seminarDate.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="durationHours">Duration (hrs) *</Label>
              <Input id="durationHours" type="number" min={1} {...register("durationHours", { valueAsNumber: true })} aria-invalid={!!errors.durationHours} />
              {errors.durationHours && <p className="text-xs text-danger-500">{errors.durationHours.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hallNumber">Hall *</Label>
              <Input id="hallNumber" {...register("hallNumber")} aria-invalid={!!errors.hallNumber} />
              {errors.hallNumber && <p className="text-xs text-danger-500">{errors.hallNumber.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SeminarsPage() {
  const { data: seminars, isLoading } = useSeminars()
  const [dialogItem, setDialogItem] = useState<SeminarResponse | null | "new">(null)

  return (
    <div>
      <PageHeader
        title="Seminars"
        subtitle="Schedule and manage training seminars"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Seminars" }]}
        actions={
          <Button variant="accent" size="sm" onClick={() => setDialogItem("new")}>
            <Plus className="h-4 w-4 mr-1" /> New Seminar
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : !seminars || seminars.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No seminars" description="Schedule your first seminar." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seminars.map((s) => (
            <Card key={s.seminarId}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-neutral-800 leading-tight">{s.seminarName}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setDialogItem(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1.5 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    {formatDate(s.seminarDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                    {s.durationHours} hour{s.durationHours !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-neutral-400" />
                    Hall {s.hallNumber}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SeminarDialog
        item={dialogItem === "new" ? null : dialogItem}
        open={dialogItem !== null}
        onOpenChange={(v) => !v && setDialogItem(null)}
      />
    </div>
  )
}
