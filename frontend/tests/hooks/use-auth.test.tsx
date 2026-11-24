import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { useLogin, useRegister, useLogout } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"

vi.mock("@/lib/api", () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockReplace = vi.fn()
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import api from "@/lib/api"
import { toast } from "sonner"
const mockPost = (api as { post: ReturnType<typeof vi.fn> }).post
const mockToast = toast as { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> }

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ token: null, role: null, userId: null, name: null })
})

describe("useLogin", () => {
  it("on success: sets auth store, shows welcome toast, navigates to role home", async () => {
    mockPost.mockResolvedValue({
      data: { token: "jwt-123", role: "CLERK", userId: 5, name: "Clerk User" },
    })

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ username: "clerk1", password: "pass" }) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useAuthStore.getState().token).toBe("jwt-123")
    expect(useAuthStore.getState().role).toBe(Role.CLERK)
    expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining("Clerk User"))
    expect(mockReplace).toHaveBeenCalledWith("/clerk")
  })

  it("navigates to /admin for ADMIN role", async () => {
    mockPost.mockResolvedValue({
      data: { token: "jwt-456", role: "ADMIN", userId: 1, name: "Admin" },
    })

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ username: "admin1", password: "pass" }) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockReplace).toHaveBeenCalledWith("/admin")
  })

  it("on error: shows error toast", async () => {
    mockPost.mockRejectedValue(new Error("Unauthorized"))

    const { result } = renderHook(() => useLogin(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ username: "bad", password: "wrong" }) })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining("Invalid username or password")
    )
  })
})

describe("useRegister", () => {
  it("on success: shows success toast and navigates to /login", async () => {
    mockPost.mockResolvedValue({ data: {} })

    const { result } = renderHook(() => useRegister(), { wrapper: wrapper() })
    act(() => {
      result.current.mutate({
        fullName: "New Doctor",
        username: "newdoc",
        password: "pass123",
        role: "DOCTOR",
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockToast.success).toHaveBeenCalledWith(
      expect.stringContaining("New Doctor")
    )
    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("on error: shows extracted error message", async () => {
    const apiError = { response: { data: { message: "Username already taken" } } }
    mockPost.mockRejectedValue(apiError)

    const { result } = renderHook(() => useRegister(), { wrapper: wrapper() })
    act(() => {
      result.current.mutate({ fullName: "X", username: "taken", password: "pass123", role: "CLERK" })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockToast.error).toHaveBeenCalledWith("Username already taken")
  })
})

describe("useLogout", () => {
  it("clears auth store, shows toast, and navigates to /login", () => {
    useAuthStore.setState({ token: "tok", role: Role.ADMIN, userId: 1, name: "Admin" })
    const { result } = renderHook(() => useLogout(), { wrapper: wrapper() })
    act(() => { result.current() })

    expect(useAuthStore.getState().token).toBeNull()
    expect(mockToast.info).toHaveBeenCalledWith(expect.stringContaining("logged out"))
    expect(mockReplace).toHaveBeenCalledWith("/login")
  })
})
