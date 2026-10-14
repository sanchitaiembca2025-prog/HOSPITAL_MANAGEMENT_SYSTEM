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
import { useResources, useCreateResource, useUpdateResource } from "@/hooks/use-catalogue"
import { Package, Plus, Pencil, Loader2 } from "lucide-react"
import { CatalogueResourceResponse } from "@/types"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
  resourceName: z.string().min(1, "Name required"),
  costPerUnit: z.number().min(0, "Cost must be 0 or more"),
})
type FormValues = z.infer<typeof schema>

function ResourceDialog({
  item,
  open,
  onOpenChange,
}: { item: CatalogueResourceResponse | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const createMutation = useCreateResource()
  const updateMutation = useUpdateResource()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resourceName: item?.resourceName ?? "", costPerUnit: item?.costPerUnit ?? 0 },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: FormValues) => {
    if (item) {
      updateMutation.mutate({ resourceId: item.resourceId, ...data }, {
        onSuccess: () => { toast.success("Resource updated"); onOpenChange(false) },
        onError: () => toast.error("Failed to update"),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { toast.success("Resource added"); onOpenChange(false) },
        onError: () => toast.error("Failed to add"),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{item ? "Edit Resource" : "Add Resource"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="resourceName">Resource Name *</Label>
            <Input id="resourceName" {...register("resourceName")} aria-invalid={!!errors.resourceName} />
            {errors.resourceName && <p className="text-xs text-danger-500">{errors.resourceName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="costPerUnit">Cost per Unit (₹) *</Label>
            <Input id="costPerUnit" type="number" min={0} step="0.01" {...register("costPerUnit", { valueAsNumber: true })} aria-invalid={!!errors.costPerUnit} />
            {errors.costPerUnit && <p className="text-xs text-danger-500">{errors.costPerUnit.message}</p>}
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

export default function ResourcesPage() {
  const { data: resources, isLoading } = useResources()
  const [dialogItem, setDialogItem] = useState<CatalogueResourceResponse | null | "new">(null)

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Manage consumable resources and unit costs"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Resources" }]}
        actions={
          <Button variant="accent" size="sm" onClick={() => setDialogItem("new")}>
            <Plus className="h-4 w-4 mr-1" /> Add Resource
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !resources || resources.length === 0 ? (
        <EmptyState icon={Package} title="No resources" description="Add your first consumable resource." />
      ) : (
        <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource Name</TableHead>
                <TableHead>Cost per Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r) => (
                <TableRow key={r.resourceId}>
                  <TableCell className="font-medium text-neutral-800">{r.resourceName}</TableCell>
                  <TableCell className="font-mono text-sm">{formatCurrency(r.costPerUnit)}</TableCell>
                  <TableCell>
                    {r.isActive
                      ? <Badge className="bg-success-100 text-success-700 border-success-300">Active</Badge>
                      : <Badge className="bg-neutral-100 text-neutral-500">Inactive</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setDialogItem(r)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ResourceDialog
        item={dialogItem === "new" ? null : dialogItem}
        open={dialogItem !== null}
        onOpenChange={(v) => !v && setDialogItem(null)}
      />
    </div>
  )
}
