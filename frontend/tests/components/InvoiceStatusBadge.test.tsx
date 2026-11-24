import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { InvoiceStatusBadge } from "@/components/hms/InvoiceStatusBadge"
import { PaymentStatus } from "@/types"

describe("InvoiceStatusBadge", () => {
  it("renders 'Payment Pending' for PENDING", () => {
    render(<InvoiceStatusBadge status={PaymentStatus.PENDING} />)
    expect(screen.getByText("Payment Pending")).toBeInTheDocument()
  })

  it("renders 'Paid' for PAID", () => {
    render(<InvoiceStatusBadge status={PaymentStatus.PAID} />)
    expect(screen.getByText("Paid")).toBeInTheDocument()
  })

  it("applies warning class for PENDING", () => {
    const { container } = render(<InvoiceStatusBadge status={PaymentStatus.PENDING} />)
    expect(container.firstChild).toHaveClass("bg-warning-50")
  })

  it("applies success class for PAID", () => {
    const { container } = render(<InvoiceStatusBadge status={PaymentStatus.PAID} />)
    expect(container.firstChild).toHaveClass("bg-success-50")
  })

  it("accepts extra className", () => {
    const { container } = render(
      <InvoiceStatusBadge status={PaymentStatus.PAID} className="mt-1" />
    )
    expect(container.firstChild).toHaveClass("mt-1")
  })
})
