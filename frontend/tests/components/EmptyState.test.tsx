import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState } from "@/components/hms/EmptyState"
import { Users } from "lucide-react"

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No patients found" />)
    expect(screen.getByText("No patients found")).toBeInTheDocument()
  })

  it("renders optional description", () => {
    render(<EmptyState title="Empty" description="Try adding a new record." />)
    expect(screen.getByText("Try adding a new record.")).toBeInTheDocument()
  })

  it("omits description when not provided", () => {
    render(<EmptyState title="Empty" />)
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument()
  })

  it("renders actions slot", () => {
    render(
      <EmptyState
        title="Empty"
        actions={<button>Add Patient</button>}
      />
    )
    expect(screen.getByRole("button", { name: "Add Patient" })).toBeInTheDocument()
  })

  it("uses custom icon when provided", () => {
    const { container } = render(<EmptyState title="None" icon={Users} />)
    // Icon renders an SVG
    expect(container.querySelector("svg")).toBeInTheDocument()
  })

  it("applies extra className to wrapper", () => {
    const { container } = render(<EmptyState title="X" className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })

  it("has default Inbox icon when no icon provided", () => {
    const { container } = render(<EmptyState title="None" />)
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})
