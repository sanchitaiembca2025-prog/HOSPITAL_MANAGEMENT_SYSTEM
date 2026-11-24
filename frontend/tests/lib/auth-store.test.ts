import { describe, it, expect, beforeEach } from "vitest"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"

// Reset store state before each test
beforeEach(() => {
  useAuthStore.setState({
    token: null,
    role: null,
    userId: null,
    name: null,
  })
})

describe("useAuthStore", () => {
  it("initialises with null values", () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.role).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.name).toBeNull()
  })

  it("setAuth stores all values correctly", () => {
    useAuthStore.getState().setAuth("tok-123", Role.DOCTOR, 42, "Dr. Alice")
    const state = useAuthStore.getState()
    expect(state.token).toBe("tok-123")
    expect(state.role).toBe(Role.DOCTOR)
    expect(state.userId).toBe(42)
    expect(state.name).toBe("Dr. Alice")
  })

  it("logout clears all values", () => {
    useAuthStore.getState().setAuth("tok-abc", Role.ADMIN, 1, "Admin")
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.role).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.name).toBeNull()
  })

  it("setAuth can be called multiple times and overwrites previous state", () => {
    useAuthStore.getState().setAuth("tok-1", Role.CLERK, 10, "Clerk Bob")
    useAuthStore.getState().setAuth("tok-2", Role.LAB, 20, "Lab Sara")
    const state = useAuthStore.getState()
    expect(state.token).toBe("tok-2")
    expect(state.role).toBe(Role.LAB)
    expect(state.userId).toBe(20)
    expect(state.name).toBe("Lab Sara")
  })

  it("stores all four Role enum values correctly", () => {
    for (const role of [Role.ADMIN, Role.CLERK, Role.DOCTOR, Role.LAB]) {
      useAuthStore.getState().setAuth("tok", role, 1, "User")
      expect(useAuthStore.getState().role).toBe(role)
    }
  })

  it("getState reflects latest state without subscription", () => {
    expect(useAuthStore.getState().token).toBeNull()
    useAuthStore.getState().setAuth("new-token", Role.ADMIN, 99, "Super Admin")
    expect(useAuthStore.getState().token).toBe("new-token")
  })
})
