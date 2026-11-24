import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatCard } from "@/components/hms/StatCard"
import { Users } from "lucide-react"

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Total Patients" value={42} icon={Users} />)
    expect(screen.getByText("Total Patients")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("renders string value", () => {
    render(<StatCard label="Status" value="Active" icon={Users} />)
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("renders description when provided", () => {
    render(<StatCard label="X" value={1} icon={Users} description="Up 10%" />)
    expect(screen.getByText("Up 10%")).toBeInTheDocument()
  })

  it("does not render description when omitted", () => {
    render(<StatCard label="X" value={1} icon={Users} />)
    // No description prop → no extra <p> beyond the label and value
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument()
    // The card renders label + value only — no trend-coloured text
    expect(document.querySelector(".text-success-700")).toBeNull()
    expect(document.querySelector(".text-danger-500")).toBeNull()
  })

  it("applies success colour class for trend='up'", () => {
    render(<StatCard label="X" value={1} icon={Users} description="Good" trend="up" />)
    const desc = screen.getByText("Good")
    expect(desc).toHaveClass("text-success-700")
  })

  it("applies danger colour class for trend='down'", () => {
    render(<StatCard label="X" value={1} icon={Users} description="Bad" trend="down" />)
    const desc = screen.getByText("Bad")
    expect(desc).toHaveClass("text-danger-500")
  })

  it("applies neutral colour class for trend='neutral'", () => {
    render(<StatCard label="X" value={1} icon={Users} description="Flat" trend="neutral" />)
    const desc = screen.getByText("Flat")
    expect(desc).toHaveClass("text-neutral-600")
  })

  it("applies custom className to card wrapper", () => {
    const { container } = render(<StatCard label="X" value={1} icon={Users} className="my-custom" />)
    expect(container.firstChild).toHaveClass("my-custom")
  })
})
