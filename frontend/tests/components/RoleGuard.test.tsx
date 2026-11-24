import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { RoleGuard } from "@/components/hms/RoleGuard"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

beforeEach(() => {
  useAuthStore.setState({ token: null, role: null, userId: null, name: null })
})

describe("RoleGuard", () => {
  it("renders children when user has an allowed role", () => {
    useAuthStore.setState({ token: "tok", role: Role.CLERK, userId: 1, name: "Clerk" })
    render(
      <RoleGuard allowedRoles={[Role.CLERK, Role.ADMIN]}>
        <div>Protected Content</div>
      </RoleGuard>
    )
    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })

  it("renders nothing (null) when user has wrong role", () => {
    useAuthStore.setState({ token: "tok", role: Role.LAB, userId: 2, name: "Lab" })
    const { container } = render(
      <RoleGuard allowedRoles={[Role.CLERK]}>
        <div>Clerk Only</div>
      </RoleGuard>
    )
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText("Clerk Only")).not.toBeInTheDocument()
  })

  it("renders nothing when token is null (unauthenticated)", () => {
    const { container } = render(
      <RoleGuard allowedRoles={[Role.ADMIN]}>
        <div>Admin Only</div>
      </RoleGuard>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("renders nothing when role is null even if token exists", () => {
    useAuthStore.setState({ token: "tok", role: null, userId: 1, name: "User" })
    const { container } = render(
      <RoleGuard allowedRoles={[Role.DOCTOR]}>
        <div>Doctor Area</div>
      </RoleGuard>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("renders children when multiple roles are allowed and user has one", () => {
    useAuthStore.setState({ token: "tok", role: Role.DOCTOR, userId: 3, name: "Dr" })
    render(
      <RoleGuard allowedRoles={[Role.DOCTOR, Role.CLERK, Role.LAB]}>
        <span>Shared Area</span>
      </RoleGuard>
    )
    expect(screen.getByText("Shared Area")).toBeInTheDocument()
  })
})
