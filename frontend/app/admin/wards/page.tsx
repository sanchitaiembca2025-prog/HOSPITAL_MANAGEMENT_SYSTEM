"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { EmptyState } from "@/components/hms/EmptyState"
import { useWards, useUpdateWard } from "@/hooks/use-wards"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Building2, Pencil, BedDouble, Loader2 } from "lucide-react"
import { WardResponse } from "@/types"

const schema = z.object({
  totalBeds: z.number().int().min(1, "Must have at least 1 bed"),
})
type FormValues = z.infer<typeof schema>

function EditWardDialog({
  ward,
  open,
  onOpenChange,
}: { ward: WardResponse | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const mutation = useUpdateWard()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { totalBeds: ward?.totalBeds ?? 0 },
  })

  const onSubmit = (data: FormValues) => {
    if (!ward) return
    mutation.mutate({ id: ward.categoryId, totalBeds: data.totalBeds }, {
      onSuccess: () => { toast.success("Ward updated"); onOpenChange(false) },
      onError: () => toast.error("Failed to update ward"),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Edit {ward?.categoryName}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="totalBeds">Total Beds *</Label>
            <Input
              id="totalBeds"
              type="number"
              min={1}
              {...register("totalBeds", { valueAsNumber: true })}
              defaultValue={ward?.totalBeds}
              aria-invalid={!!errors.totalBeds}
            />
            {errors.totalBeds && <p className="text-xs text-danger-500">{errors.totalBeds.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={mutation.isPending}>
              {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function WardsPage() {
  const { data: wards, isLoading } = useWards()
  const [editWard, setEditWard] = useState<WardResponse | null>(null)

  return (
    <div>
      <PageHeader
        title="Ward Categories"
        subtitle="Manage ward bed counts"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Wards" }]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : !wards || wards.length === 0 ? (
        <EmptyState icon={Building2} title="No wards" description="No ward categories configured." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wards.map((w) => (
            <Card key={w.categoryId}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-800">{w.categoryName}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Category #{w.categoryId}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditWard(w)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-neutral-700">
                    <span className="font-semibold text-primary-600">{w.availableBeds}</span>
                    {" "}/ {w.totalBeds} beds available
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${w.totalBeds > 0 ? (w.availableBeds / w.totalBeds) * 100 : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditWardDialog
        ward={editWard}
        open={!!editWard}
        onOpenChange={(v) => !v && setEditWard(null)}
      />
    </div>
  )
}
