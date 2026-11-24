import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AppHeader } from "@/components/hms/AppHeader"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"

const mockReplace = vi.fn()
const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}))

vi.mock("sonner", () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}))

beforeEach(() => {
  useAuthStore.setState({ token: null, role: null, userId: null, name: null })
  mockReplace.mockClear()
  mockPush.mockClear()
})

describe("AppHeader", () => {
  it("renders HMS logo text", () => {
    useAuthStore.setState({ token: "t", role: Role.CLERK, userId: 1, name: "Clerk User" })
    render(<AppHeader />)
    expect(screen.getAllByText(/HMS/)[0]).toBeInTheDocument()
  })

  it("renders hamburger button that calls onMenuClick", () => {
    useAuthStore.setState({ token: "t", role: Role.CLERK, userId: 1, name: "Clerk User" })
    const onMenuClick = vi.fn()
    render(<AppHeader onMenuClick={onMenuClick} />)
    const btn = screen.getByRole("button", { name: /open sidebar/i })
    fireEvent.click(btn)
    expect(onMenuClick).toHaveBeenCalledOnce()
  })

  it("shows user initials in avatar when logged in", () => {
    useAuthStore.setState({ token: "t", role: Role.DOCTOR, userId: 2, name: "Dr. Alice Brown" })
    render(<AppHeader />)
    expect(screen.getByText("DA")).toBeInTheDocument()
  })

  it("shows fallback 'U' when name is null", () => {
    useAuthStore.setState({ token: "t", role: Role.CLERK, userId: 1, name: null })
    render(<AppHeader />)
    expect(screen.getByText("U")).toBeInTheDocument()
  })

  it("shows 'My Profile' menu item only for DOCTOR role", async () => {
    const user = userEvent.setup()
    useAuthStore.setState({ token: "t", role: Role.DOCTOR, userId: 1, name: "Dr. Alice" })
    render(<AppHeader />)
    await user.click(screen.getByRole("button", { name: /user menu/i }))
    await waitFor(() =>
      expect(document.body.querySelector('[role="menuitem"]')).not.toBeNull()
    )
    expect(document.body).toHaveTextContent("My Profile")
  })

  it("does NOT show 'My Profile' for CLERK role", async () => {
    const user = userEvent.setup()
    useAuthStore.setState({ token: "t", role: Role.CLERK, userId: 1, name: "Clerk User" })
    render(<AppHeader />)
    await user.click(screen.getByRole("button", { name: /user menu/i }))
    await waitFor(() =>
      expect(document.body.querySelector('[role="menuitem"]')).not.toBeNull()
    )
    expect(document.body).not.toHaveTextContent("My Profile")
  })

  it("logout clears auth store and redirects to /login", async () => {
    const user = userEvent.setup()
    const logout = vi.fn(() => {
      useAuthStore.setState({ token: null, role: null, userId: null, name: null })
    })
    useAuthStore.setState({ token: "t", role: Role.CLERK, userId: 1, name: "Clerk", logout })
    render(<AppHeader />)
    await user.click(screen.getByRole("button", { name: /user menu/i }))
    await waitFor(() =>
      expect(document.body.querySelector('[role="menuitem"]')).not.toBeNull()
    )
    const logoutItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((el) => el.textContent?.includes("Logout"))
    expect(logoutItem).not.toBeNull()
    await user.click(logoutItem as Element)
    expect(logout).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith("/login")
  })
})
