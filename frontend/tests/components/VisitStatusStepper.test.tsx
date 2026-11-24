import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { VisitStatusStepper } from "@/components/hms/VisitStatusStepper"
import { VisitStatus } from "@/types"

describe("VisitStatusStepper", () => {
  it("renders all three step labels", () => {
    render(<VisitStatusStepper currentStatus={VisitStatus.ADMITTED} />)
    expect(screen.getByText("Admitted")).toBeInTheDocument()
    expect(screen.getByText("In Treatment")).toBeInTheDocument()
    expect(screen.getByText("Discharged")).toBeInTheDocument()
  })

  it("ADMITTED: first step is current (primary colour), others pending", () => {
    const { container } = render(<VisitStatusStepper currentStatus={VisitStatus.ADMITTED} />)
    const circles = container.querySelectorAll(".rounded-full")
    expect(circles[0]).toHaveClass("bg-primary-600")
    expect(circles[1]).not.toHaveClass("bg-primary-600")
    expect(circles[2]).not.toHaveClass("bg-primary-600")
  })

  it("TREATMENT_IN_PROGRESS: first step completed, second current", () => {
    const { container } = render(
      <VisitStatusStepper currentStatus={VisitStatus.TREATMENT_IN_PROGRESS} />
    )
    const circles = container.querySelectorAll(".rounded-full")
    expect(circles[0]).toHaveClass("bg-success-700")
    expect(circles[1]).toHaveClass("bg-primary-600")
  })

  it("DISCHARGED: first two steps completed, third current", () => {
    const { container } = render(<VisitStatusStepper currentStatus={VisitStatus.DISCHARGED} />)
    const circles = container.querySelectorAll(".rounded-full")
    expect(circles[0]).toHaveClass("bg-success-700")
    expect(circles[1]).toHaveClass("bg-success-700")
    expect(circles[2]).toHaveClass("bg-primary-600")
  })

  it("DECEASED: shows '(Deceased)' label on last step", () => {
    render(<VisitStatusStepper currentStatus={VisitStatus.DECEASED} />)
    expect(screen.getByText(/Deceased/)).toBeInTheDocument()
  })

  it("DECEASED: last step circle has danger colour", () => {
    const { container } = render(<VisitStatusStepper currentStatus={VisitStatus.DECEASED} />)
    const circles = container.querySelectorAll(".rounded-full")
    expect(circles[2]).toHaveClass("bg-danger-500")
  })

  it("applies custom className to wrapper", () => {
    const { container } = render(
      <VisitStatusStepper currentStatus={VisitStatus.ADMITTED} className="my-stepper" />
    )
    expect(container.firstChild).toHaveClass("my-stepper")
  })
})
