import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { RoleBadge } from "@/components/hms/RoleBadge"
import { Role } from "@/types"

describe("RoleBadge", () => {
  it("renders 'Admin' label for ADMIN role", () => {
    render(<RoleBadge role={Role.ADMIN} />)
    expect(screen.getByText("Admin")).toBeInTheDocument()
  })

  it("renders 'Doctor' label for DOCTOR role", () => {
    render(<RoleBadge role={Role.DOCTOR} />)
    expect(screen.getByText("Doctor")).toBeInTheDocument()
  })

  it("renders 'Clerk' label for CLERK role", () => {
    render(<RoleBadge role={Role.CLERK} />)
    expect(screen.getByText("Clerk")).toBeInTheDocument()
  })

  it("renders 'Lab' label for LAB role", () => {
    render(<RoleBadge role={Role.LAB} />)
    expect(screen.getByText("Lab")).toBeInTheDocument()
  })

  it("applies a role-specific class to ADMIN badge", () => {
    const { container } = render(<RoleBadge role={Role.ADMIN} />)
    expect(container.firstChild).toHaveClass("bg-primary-100")
  })

  it("applies a role-specific class to DOCTOR badge", () => {
    const { container } = render(<RoleBadge role={Role.DOCTOR} />)
    expect(container.firstChild).toHaveClass("bg-info-50")
  })

  it("merges custom className prop", () => {
    const { container } = render(<RoleBadge role={Role.CLERK} className="extra-class" />)
    expect(container.firstChild).toHaveClass("extra-class")
  })
})
