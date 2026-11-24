import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { InvoiceBreakdown } from "@/components/hms/InvoiceBreakdown"
import { PaymentStatus, type InvoiceResponse } from "@/types"

const pendingInvoice: InvoiceResponse = {
  invoiceId: 1,
  doctorFee: 500,
  testCost: 200,
  equipmentCost: 100,
  resourceCost: 50,
  totalAmount: 850,
  paymentStatus: PaymentStatus.PENDING,
}

const paidInvoice: InvoiceResponse = {
  ...pendingInvoice,
  paymentStatus: PaymentStatus.PAID,
}

describe("InvoiceBreakdown", () => {
  it("renders invoice ID in header", () => {
    render(<InvoiceBreakdown invoice={pendingInvoice} />)
    expect(screen.getByText(/Invoice #1/)).toBeInTheDocument()
  })

  it("renders all four line item labels", () => {
    render(<InvoiceBreakdown invoice={pendingInvoice} />)
    expect(screen.getByText("Doctor Consultation Fee")).toBeInTheDocument()
    expect(screen.getByText("Tests")).toBeInTheDocument()
    expect(screen.getByText("Equipment")).toBeInTheDocument()
    expect(screen.getByText("Resources")).toBeInTheDocument()
  })

  it("renders formatted total amount", () => {
    render(<InvoiceBreakdown invoice={pendingInvoice} />)
    // formatCurrency(850) → ₹850
    expect(screen.getByText(/850/)).toBeInTheDocument()
  })

  it("shows 'Payment Pending' badge for PENDING status", () => {
    render(<InvoiceBreakdown invoice={pendingInvoice} />)
    expect(screen.getByText("Payment Pending")).toBeInTheDocument()
  })

  it("shows 'Paid' badge for PAID status", () => {
    render(<InvoiceBreakdown invoice={paidInvoice} />)
    expect(screen.getByText("Paid")).toBeInTheDocument()
  })

  it("shows 'Payment received' footer only for PAID invoices", () => {
    render(<InvoiceBreakdown invoice={paidInvoice} />)
    expect(screen.getByText("Payment received")).toBeInTheDocument()
  })

  it("does NOT show 'Payment received' for PENDING invoices", () => {
    render(<InvoiceBreakdown invoice={pendingInvoice} />)
    expect(screen.queryByText("Payment received")).not.toBeInTheDocument()
  })

  it("renders zero amounts without crashing", () => {
    const zeroInvoice: InvoiceResponse = {
      ...pendingInvoice,
      doctorFee: 0,
      testCost: 0,
      equipmentCost: 0,
      resourceCost: 0,
      totalAmount: 0,
    }
    render(<InvoiceBreakdown invoice={zeroInvoice} />)
    expect(screen.getByText(/Invoice #1/)).toBeInTheDocument()
  })
})
