"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/hms/PageHeader"
import { EmptyState } from "@/components/hms/EmptyState"
import { FileUploadZone } from "@/components/hms/FileUploadZone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLabPatient, useSaveLabCosts, useUploadTestResult } from "@/hooks/use-lab"
import { useAvailableTests, useActiveEquipment, useActiveResources } from "@/hooks/use-catalogue"
import { formatCurrency } from "@/lib/utils"
import {
  UserX, Loader2, Upload, CheckCircle2, FlaskConical, Wrench, Package,
  Plus, Trash2, Check,
} from "lucide-react"
import { CatalogueTestResponse, CatalogueEquipmentResponse, CatalogueResourceResponse } from "@/types"

// ── Types ─────────────────────────────────────────────────────────────────────

type SelectedItem = {
  id: number
  name: string
  unitCost: number
  qty: number
  costLabel: string
}

// ── Catalogue Picker Dialog ───────────────────────────────────────────────────

interface CataloguePickerDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  icon: React.ElementType
  items: { id: number; name: string; unitCost: number; costLabel: string }[]
  selected: SelectedItem[]
  onConfirm: (items: SelectedItem[]) => void
  isLoading: boolean
}

function CataloguePickerDialog({
  open,
  onOpenChange,
  title,
  icon: Icon,
  items,
  selected,
  onConfirm,
  isLoading,
}: CataloguePickerDialogProps) {
  // Local draft state — only committed on "Add to order"
  const [draft, setDraft] = useState<SelectedItem[]>([])

  // Re-initialise draft from current selections each time dialog opens
  const handleOpenChange = (v: boolean) => {
    if (v) setDraft(selected.map((s) => ({ ...s })))
    onOpenChange(v)
  }

  const isSelected = (id: number) => draft.some((d) => d.id === id)

  const toggle = (item: { id: number; name: string; unitCost: number; costLabel: string }) => {
    setDraft((prev) => {
      if (prev.some((d) => d.id === item.id)) {
        return prev.filter((d) => d.id !== item.id)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const setQty = (id: number, qty: number) => {
    setDraft((prev) =>
      prev.map((d) => (d.id === id ? { ...d, qty: Math.max(1, qty) } : d))
    )
  }

  const handleConfirm = () => {
    onConfirm(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary-500" /> Add {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-neutral-500 -mt-2">
          Click a row to select it, then set the quantity. Selected items are highlighted.
        </p>

        {isLoading ? (
          <div className="space-y-2 py-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-400">
            No {title.toLowerCase()} in catalogue yet.
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 rounded-lg border border-neutral-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>{title === "Resources" ? "Cost / Unit" : "Cost"}</TableHead>
                  <TableHead className="w-28">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const sel = draft.find((d) => d.id === item.id)
                  const selected = !!sel
                  const qty = sel?.qty ?? 0

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => toggle(item)}
                      className={`cursor-pointer transition-colors ${
                        selected
                          ? "bg-primary-50 hover:bg-primary-100"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      <TableCell>
                        {selected && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-800">{item.name}</TableCell>
                      <TableCell className="text-neutral-600">{formatCurrency(item.unitCost)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {selected ? (
                          <Input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={(e) => setQty(item.id, Number(e.target.value))}
                            className="w-20 text-center h-8"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-neutral-300 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {selected ? (
                          <span className="text-primary-700">{formatCurrency(item.unitCost * qty)}</span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-neutral-500">
              {draft.length} item{draft.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button variant="accent" onClick={handleConfirm} disabled={items.length === 0}>
                Add to Order
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Selected Items Table ──────────────────────────────────────────────────────

function SelectedItemsTable({
  items,
  onQtyChange,
  onRemove,
}: {
  items: SelectedItem[]
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
}) {
  if (items.length === 0) return null

  return (
    <div className="rounded-lg border border-neutral-200 divide-y divide-neutral-100">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{item.name}</p>
            <p className="text-xs text-neutral-500">{item.costLabel}: {formatCurrency(item.unitCost)}</p>
          </div>
          <Input
            type="number"
            min={1}
            value={item.qty}
            onChange={(e) => onQtyChange(item.id, Math.max(1, Number(e.target.value)))}
            className="w-20 text-center h-8 shrink-0"
          />
          <span className="text-sm font-medium text-primary-700 w-20 text-right shrink-0">
            {formatCurrency(item.unitCost * item.qty)}
          </span>
          <button
            onClick={() => onRemove(item.id)}
            className="text-neutral-400 hover:text-danger-500 transition-colors shrink-0"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Section Block ─────────────────────────────────────────────────────────────

function SectionBlock({
  icon: Icon,
  label,
  items,
  onAdd,
  onQtyChange,
  onRemove,
}: {
  icon: React.ElementType
  label: string
  items: SelectedItem[]
  onAdd: () => void
  onQtyChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
}) {
  const sectionTotal = items.reduce((s, i) => s + i.unitCost * i.qty, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary-500" />
          <h4 className="text-sm font-semibold text-neutral-700">{label}</h4>
          {items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {sectionTotal > 0 && (
            <span className="text-xs font-medium text-primary-700">{formatCurrency(sectionTotal)}</span>
          )}
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add {label}
          </Button>
        </div>
      </div>
      <SelectedItemsTable items={items} onQtyChange={onQtyChange} onRemove={onRemove} />
      {items.length === 0 && (
        <p className="text-xs text-neutral-400 italic">No {label.toLowerCase()} added yet</p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LabPatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const router = useRouter()
  const { data: patient, isLoading, isError } = useLabPatient(patientId)

  const { data: testsData = [], isLoading: testsLoading } = useAvailableTests()
  const { data: equipData = [], isLoading: equipLoading } = useActiveEquipment()
  const { data: resourcesData = [], isLoading: resourcesLoading } = useActiveResources()

  const saveCostsMutation = useSaveLabCosts()
  const uploadMutation = useUploadTestResult()

  // Selected items per category
  const [selectedTests, setSelectedTests] = useState<SelectedItem[]>([])
  const [selectedEquip, setSelectedEquip] = useState<SelectedItem[]>([])
  const [selectedResources, setSelectedResources] = useState<SelectedItem[]>([])

  // Dialog open state
  const [testsOpen, setTestsOpen] = useState(false)
  const [equipOpen, setEquipOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  const [resultFile, setResultFile] = useState<File | null>(null)
  const [costsSaved, setCostsSaved] = useState(false)

  // Normalise catalogue data for the picker
  const testItems = testsData.map((t: CatalogueTestResponse) => ({
    id: t.testId, name: t.testName, unitCost: t.cost, costLabel: "Cost",
  }))
  const equipItems = equipData.map((e: CatalogueEquipmentResponse) => ({
    id: e.equipmentId, name: e.equipmentName, unitCost: e.cost, costLabel: "Cost",
  }))
  const resourceItems = resourcesData.map((r: CatalogueResourceResponse) => ({
    id: r.resourceId, name: r.resourceName, unitCost: r.costPerUnit, costLabel: "Per unit",
  }))

  // Qty change helpers
  const makeQtyChanger = (setter: React.Dispatch<React.SetStateAction<SelectedItem[]>>) =>
    (id: number, qty: number) =>
      setter((prev) => prev.map((s) => (s.id === id ? { ...s, qty } : s)))

  const makeRemover = (setter: React.Dispatch<React.SetStateAction<SelectedItem[]>>) =>
    (id: number) => setter((prev) => prev.filter((s) => s.id !== id))

  // Running grand total
  const grandTotal = useMemo(() => {
    const sum = (items: SelectedItem[]) =>
      items.reduce((s, i) => s + i.unitCost * i.qty, 0)
    return sum(selectedTests) + sum(selectedEquip) + sum(selectedResources)
  }, [selectedTests, selectedEquip, selectedResources])

  const hasSelections =
    selectedTests.length > 0 || selectedEquip.length > 0 || selectedResources.length > 0

  const handleSaveCosts = () => {
    if (!patient) return
    saveCostsMutation.mutate(
      {
        visitId: patient.visitId,
        tests: selectedTests.map(({ id, qty }) => ({ testId: id, quantity: qty })),
        equipment: selectedEquip.map(({ id, qty }) => ({ equipmentId: id, quantity: qty })),
        resources: selectedResources.map(({ id, qty }) => ({ resourceId: id, quantityUsed: qty })),
      },
      {
        onSuccess: () => {
          toast.success("Lab costs saved")
          setCostsSaved(true)
          if (!resultFile) router.push("/lab/patients")
        },
        onError: () => toast.error("Failed to save costs"),
      }
    )
  }

  const handleUpload = () => {
    if (!patient || !resultFile) return
    uploadMutation.mutate(
      { visitId: patient.visitId, file: resultFile },
      {
        onSuccess: () => {
          toast.success("Test result uploaded")
          router.push("/lab/patients")
        },
        onError: () => toast.error("Upload failed"),
      }
    )
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Lab Work" breadcrumb={[{ label: "Lab", href: "/lab" }, { label: "Patients", href: "/lab/patients" }, { label: patientId }]} />
        <Card><CardContent className="p-6 space-y-3">
          <Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-64" /><Skeleton className="h-32 w-full mt-4" />
        </CardContent></Card>
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div>
        <PageHeader title="Lab Work" breadcrumb={[{ label: "Lab", href: "/lab" }, { label: "Patients", href: "/lab/patients" }, { label: patientId }]} />
        <EmptyState icon={UserX} title="Patient not found" description="This patient could not be loaded." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Work"
        breadcrumb={[
          { label: "Lab", href: "/lab" },
          { label: "Patients", href: "/lab/patients" },
          { label: `P-${patient.patientId}` },
        ]}
      />

      {/* Patient info banner */}
      <Card className="border-primary-100 bg-primary-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-mono bg-white border border-primary-200 px-2 py-0.5 rounded text-primary-700 font-medium">
              P-{patient.patientId}
            </span>
            <span className="font-medium text-neutral-800">{patient.name}</span>
            <span className="text-neutral-500">{patient.age}y</span>
            <span className="text-neutral-600">Dr. {patient.assignedDoctor}</span>
            <span className="font-mono text-neutral-400 text-xs">Visit V-{patient.visitId}</span>
            {patient.prescriptionReady ? (
              <Badge className="bg-success-100 text-success-700 border-success-300">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Prescription Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-warning-600 border-warning-300">
                Prescription Pending
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order builder */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-800">Lab Order</h3>
            {grandTotal > 0 && (
              <span className="text-sm font-semibold text-primary-700">
                Total: {formatCurrency(grandTotal)}
              </span>
            )}
          </div>

          {/* Tests section */}
          <SectionBlock
            icon={FlaskConical}
            label="Tests"
            items={selectedTests}
            onAdd={() => setTestsOpen(true)}
            onQtyChange={makeQtyChanger(setSelectedTests)}
            onRemove={makeRemover(setSelectedTests)}
          />

          <div className="border-t border-neutral-100" />

          {/* Equipment section */}
          <SectionBlock
            icon={Wrench}
            label="Equipment"
            items={selectedEquip}
            onAdd={() => setEquipOpen(true)}
            onQtyChange={makeQtyChanger(setSelectedEquip)}
            onRemove={makeRemover(setSelectedEquip)}
          />

          <div className="border-t border-neutral-100" />

          {/* Resources section */}
          <SectionBlock
            icon={Package}
            label="Resources"
            items={selectedResources}
            onAdd={() => setResourcesOpen(true)}
            onQtyChange={makeQtyChanger(setSelectedResources)}
            onRemove={makeRemover(setSelectedResources)}
          />

          {/* Summary row */}
          {grandTotal > 0 && (
            <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-md px-4 py-3">
              <span className="text-sm text-neutral-600">Grand total (lab costs)</span>
              <span className="font-semibold text-neutral-800">{formatCurrency(grandTotal)}</span>
            </div>
          )}

          {costsSaved && (
            <div className="flex items-center gap-2 text-success-700 text-sm bg-success-50 border border-success-200 rounded-md px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Lab costs saved and added to invoice.
            </div>
          )}

          <Button
            variant="accent"
            onClick={handleSaveCosts}
            disabled={saveCostsMutation.isPending || !hasSelections}
          >
            {saveCostsMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
            ) : "Save Lab Costs"}
          </Button>
        </CardContent>
      </Card>

      {/* Test result upload */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-neutral-800">Upload Test Result</h3>
          <p className="text-sm text-neutral-500">Upload the final test result report (PDF) for this visit.</p>
          <FileUploadZone onFileSelect={setResultFile} onClear={() => setResultFile(null)} />
          <Button
            variant="outline"
            onClick={handleUpload}
            disabled={!resultFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Upload Result</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Catalogue picker dialogs */}
      <CataloguePickerDialog
        open={testsOpen}
        onOpenChange={setTestsOpen}
        title="Tests"
        icon={FlaskConical}
        items={testItems}
        selected={selectedTests}
        onConfirm={setSelectedTests}
        isLoading={testsLoading}
      />
      <CataloguePickerDialog
        open={equipOpen}
        onOpenChange={setEquipOpen}
        title="Equipment"
        icon={Wrench}
        items={equipItems}
        selected={selectedEquip}
        onConfirm={setSelectedEquip}
        isLoading={equipLoading}
      />
      <CataloguePickerDialog
        open={resourcesOpen}
        onOpenChange={setResourcesOpen}
        title="Resources"
        icon={Package}
        items={resourceItems}
        selected={selectedResources}
        onConfirm={setSelectedResources}
        isLoading={resourcesLoading}
      />
    </div>
  )
}
