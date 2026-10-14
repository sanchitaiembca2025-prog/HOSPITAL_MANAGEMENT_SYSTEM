import { Invoice, PaymentStatus } from "@/types"
import { InvoiceStatusBadge } from "./InvoiceStatusBadge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"

interface InvoiceBreakdownProps {
  invoice: Invoice
}

export function InvoiceBreakdown({ invoice }: InvoiceBreakdownProps) {
  const lineItems = [
    { label: "Doctor Consultation Fee", amount: invoice.doctorFee },
    { label: "Tests", amount: invoice.testCost },
    { label: "Equipment", amount: invoice.equipmentCost },
    { label: "Resources", amount: invoice.resourceCost },
  ]

  return (
    <div className="rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-neutral-100 border-b border-neutral-200">
        <span className="font-mono text-sm font-medium text-neutral-800">
          Invoice #{invoice.invoiceId}
        </span>
        <InvoiceStatusBadge status={invoice.paymentStatus} />
      </div>

      {/* Line items */}
      <div className="divide-y divide-neutral-200">
        {lineItems.map((item) => (
          <div key={item.label} className="flex justify-between px-5 py-2.5 text-sm">
            <span className="text-neutral-600">{item.label}</span>
            <span className="font-medium text-neutral-800 font-mono">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between items-center px-5 py-3 bg-neutral-100">
        <span className="font-semibold text-neutral-800">Total</span>
        <span className="font-bold text-lg text-primary-600 font-mono">
          {formatCurrency(invoice.totalAmount)}
        </span>
      </div>

      {invoice.paymentStatus === PaymentStatus.PAID && (
        <div className="px-5 py-2 text-xs text-success-700 bg-success-50 border-t border-success-200">
          Payment received
        </div>
      )}
    </div>
  )
}
