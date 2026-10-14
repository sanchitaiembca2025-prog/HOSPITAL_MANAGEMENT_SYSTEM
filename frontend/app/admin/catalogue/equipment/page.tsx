"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { EmptyState } from "@/components/hms/EmptyState"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEquipment, useCreateEquipment, useUpdateEquipment } from "@/hooks/use-catalogue"
import { Wrench, Plus, Pencil, Loader2 } from "lucide-react"
import { CatalogueEquipmentResponse } from "@/types"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
  equipmentName: z.string().min(1, "Name required"),
  cost: z.number().min(0, "Cost must be 0 or more"),
})
type FormValues = z.infer<typeof schema>

function EquipmentDialog({
  item,
  open,
  onOpenChange,
}: { item: CatalogueEquipmentResponse | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const createMutation = useCreateEquipment()
  const updateMutation = useUpdateEquipment()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { equipmentName: item?.equipmentName ?? "", cost: item?.cost ?? 0 },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: FormValues) => {
    if (item) {
      updateMutation.mutate({ equipmentId: item.equipmentId, ...data }, {
        onSuccess: () => { toast.success("Equipment updated"); onOpenChange(false) },
        onError: () => toast.error("Failed to update"),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { toast.success("Equipment added"); onOpenChange(false) },
        onError: () => toast.error("Failed to add"),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{item ? "Edit Equipment" : "Add Equipment"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="equipmentName">Equipment Name *</Label>
            <Input id="equipmentName" {...register("equipmentName")} aria-invalid={!!errors.equipmentName} />
            {errors.equipmentName && <p className="text-xs text-danger-500">{errors.equipmentName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost">Cost (₹) *</Label>
            <Input id="cost" type="number" min={0} {...register("cost", { valueAsNumber: true })} aria-invalid={!!errors.cost} />
            {errors.cost && <p className="text-xs text-danger-500">{errors.cost.message}</p>}
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

export default function EquipmentPage() {
  const { data: equipment, isLoading } = useEquipment()
  const [dialogItem, setDialogItem] = useState<CatalogueEquipmentResponse | null | "new">(null)

  return (
    <div>
      <PageHeader
        title="Equipment"
        subtitle="Manage medical equipment and usage pricing"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Equipment" }]}
        actions={
          <Button variant="accent" size="sm" onClick={() => setDialogItem("new")}>
            <Plus className="h-4 w-4 mr-1" /> Add Equipment
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !equipment || equipment.length === 0 ? (
        <EmptyState icon={Wrench} title="No equipment" description="Add your first equipment item." />
      ) : (
        <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment Name</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((e) => (
                <TableRow key={e.equipmentId}>
                  <TableCell className="font-medium text-neutral-800">{e.equipmentName}</TableCell>
                  <TableCell className="font-mono text-sm">{formatCurrency(e.cost)}</TableCell>
                  <TableCell>
                    {e.isActive
                      ? <Badge className="bg-success-100 text-success-700 border-success-300">Active</Badge>
                      : <Badge className="bg-neutral-100 text-neutral-500">Inactive</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setDialogItem(e)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EquipmentDialog
        item={dialogItem === "new" ? null : dialogItem}
        open={dialogItem !== null}
        onOpenChange={(v) => !v && setDialogItem(null)}
      />
    </div>
  )
}
