import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { AppSidebar } from "@/components/hms/AppSidebar"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"

let mockPathname = "/admin"

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}))

// next/link renders an <a> tag in jsdom
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

beforeEach(() => {
  useAuthStore.setState({ token: null, role: null, userId: null, name: null })
  mockPathname = "/admin"
})

describe("AppSidebar", () => {
  it("renders ADMIN nav items", () => {
    useAuthStore.setState({ token: "t", role: Role.ADMIN, userId: 1, name: "Admin" })
    render(<AppSidebar />)
    expect(screen.getByText("Personnel")).toBeInTheDocument()
    expect(screen.getByText("Wards")).toBeInTheDocument()
    expect(screen.getByText("Seminars")).toBeInTheDocument()
  })

  it("renders CLERK nav items", () => {
    mockPathname = "/clerk"
    useAuthStore.setState({ token: "t", role: Role.CLERK, userId: 2, name: "Clerk" })
    render(<AppSidebar />)
    expect(screen.getByText("Register Patient")).toBeInTheDocument()
    expect(screen.getByText("Active Visits")).toBeInTheDocument()
  })

  it("renders DOCTOR nav items", () => {
    mockPathname = "/doctor"
    useAuthStore.setState({ token: "t", role: Role.DOCTOR, userId: 3, name: "Dr" })
    render(<AppSidebar />)
    expect(screen.getByText("My Profile")).toBeInTheDocument()
    expect(screen.getByText("Search Patient")).toBeInTheDocument()
  })

  it("renders LAB nav items", () => {
    mockPathname = "/lab"
    useAuthStore.setState({ token: "t", role: Role.LAB, userId: 4, name: "Lab" })
    render(<AppSidebar />)
    expect(screen.getByText("Search Patient")).toBeInTheDocument()
  })

  it("marks exact matching nav item as active with aria-current=page", () => {
    mockPathname = "/admin"
    useAuthStore.setState({ token: "t", role: Role.ADMIN, userId: 1, name: "Admin" })
    render(<AppSidebar />)
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute("aria-current", "page")
  })

  it("marks longest-matching path as active (sub-path prefers deeper match)", () => {
    mockPathname = "/admin/personnel"
    useAuthStore.setState({ token: "t", role: Role.ADMIN, userId: 1, name: "Admin" })
    render(<AppSidebar />)
    const personnelLink = screen.getByRole("link", { name: /personnel/i })
    expect(personnelLink).toHaveAttribute("aria-current", "page")
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i })
    expect(dashboardLink).not.toHaveAttribute("aria-current")
  })

  it("renders no nav items when role is null", () => {
    useAuthStore.setState({ token: null, role: null, userId: null, name: null })
    render(<AppSidebar />)
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("renders HMS footer text", () => {
    useAuthStore.setState({ token: "t", role: Role.ADMIN, userId: 1, name: "Admin" })
    render(<AppSidebar />)
    expect(screen.getByText(/HMS v1\.0/)).toBeInTheDocument()
  })
})
