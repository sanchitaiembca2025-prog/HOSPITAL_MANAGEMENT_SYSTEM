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
import { useTests, useCreateTest, useUpdateTest } from "@/hooks/use-catalogue"
import { FlaskConical, Plus, Pencil, Loader2 } from "lucide-react"
import { CatalogueTestResponse } from "@/types"
import { formatCurrency } from "@/lib/utils"

const schema = z.object({
  testName: z.string().min(1, "Name required"),
  cost: z.number().min(0, "Cost must be 0 or more"),
  isAvailable: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

function TestDialog({
  item,
  open,
  onOpenChange,
}: { item: CatalogueTestResponse | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const createMutation = useCreateTest()
  const updateMutation = useUpdateTest()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { testName: item?.testName ?? "", cost: item?.cost ?? 0, isAvailable: item?.isAvailable ?? true },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: FormValues) => {
    if (item) {
      updateMutation.mutate({ testId: item.testId, ...data }, {
        onSuccess: () => { toast.success("Test updated"); onOpenChange(false) },
        onError: () => toast.error("Failed to update"),
      })
    } else {
      createMutation.mutate(data, {
        onSuccess: () => { toast.success("Test added"); onOpenChange(false) },
        onError: () => toast.error("Failed to add test"),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{item ? "Edit Test" : "Add Test"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="testName">Test Name *</Label>
            <Input id="testName" {...register("testName")} aria-invalid={!!errors.testName} />
            {errors.testName && <p className="text-xs text-danger-500">{errors.testName.message}</p>}
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

export default function TestsCataloguePage() {
  const { data: tests, isLoading } = useTests()
  const [dialogItem, setDialogItem] = useState<CatalogueTestResponse | null | "new">(null)

  return (
    <div>
      <PageHeader
        title="Tests Catalogue"
        subtitle="Manage diagnostic tests and pricing"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Tests Catalogue" }]}
        actions={
          <Button variant="accent" size="sm" onClick={() => setDialogItem("new")}>
            <Plus className="h-4 w-4 mr-1" /> Add Test
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !tests || tests.length === 0 ? (
        <EmptyState icon={FlaskConical} title="No tests" description="Add your first diagnostic test." />
      ) : (
        <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((t) => (
                <TableRow key={t.testId}>
                  <TableCell className="font-medium text-neutral-800">{t.testName}</TableCell>
                  <TableCell className="font-mono text-sm">{formatCurrency(t.cost)}</TableCell>
                  <TableCell>
                    {t.isAvailable
                      ? <Badge className="bg-success-100 text-success-700 border-success-300">Available</Badge>
                      : <Badge className="bg-neutral-100 text-neutral-500">Unavailable</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setDialogItem(t)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TestDialog
        item={dialogItem === "new" ? null : dialogItem}
        open={dialogItem !== null}
        onOpenChange={(v) => !v && setDialogItem(null)}
      />
    </div>
  )
}
