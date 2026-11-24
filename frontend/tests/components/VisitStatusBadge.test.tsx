import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { VisitStatusBadge } from "@/components/hms/VisitStatusBadge"
import { VisitStatus } from "@/types"

describe("VisitStatusBadge", () => {
  it.each([
    [VisitStatus.ADMITTED,            "Admitted"],
    [VisitStatus.TREATMENT_IN_PROGRESS, "In Treatment"],
    [VisitStatus.DISCHARGED,          "Discharged"],
    [VisitStatus.DECEASED,            "Deceased"],
  ])("renders correct label for %s", (status, label) => {
    render(<VisitStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("applies ADMITTED warning colour classes", () => {
    const { container } = render(<VisitStatusBadge status={VisitStatus.ADMITTED} />)
    expect(container.firstChild).toHaveClass("bg-warning-50")
  })

  it("applies TREATMENT_IN_PROGRESS info colour classes", () => {
    const { container } = render(<VisitStatusBadge status={VisitStatus.TREATMENT_IN_PROGRESS} />)
    expect(container.firstChild).toHaveClass("bg-info-50")
  })

  it("applies DISCHARGED success colour classes", () => {
    const { container } = render(<VisitStatusBadge status={VisitStatus.DISCHARGED} />)
    expect(container.firstChild).toHaveClass("bg-success-50")
  })

  it("applies DECEASED danger colour classes", () => {
    const { container } = render(<VisitStatusBadge status={VisitStatus.DECEASED} />)
    expect(container.firstChild).toHaveClass("bg-danger-50")
  })

  it("merges extra className prop", () => {
    const { container } = render(
      <VisitStatusBadge status={VisitStatus.ADMITTED} className="ml-2" />
    )
    expect(container.firstChild).toHaveClass("ml-2")
  })
})
