/**
 * Tests for lib/api.ts interceptors.
 *
 * We test the interceptor logic (token attachment, FormData header removal,
 * 401 logout) by directly invoking the interceptor functions that axios
 * registers — no network calls needed.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useAuthStore } from "@/lib/auth-store"
import { Role } from "@/types"

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeConfig(overrides: Record<string, unknown> = {}) {
  return {
    headers: { "Content-Type": "application/json" } as Record<string, unknown>,
    ...overrides,
  }
}

// ── Request interceptor: attaches Authorization header ────────────────────────

describe("API request interceptor", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, role: null, userId: null, name: null })
  })

  it("attaches Bearer token from auth store when token exists", async () => {
    useAuthStore.setState({ token: "my-jwt", role: Role.CLERK, userId: 5, name: "Clerk" })

    // Import after store state is set
    const { default: api } = await import("@/lib/api")

    // Pull the registered request interceptor directly off axios internals
    const handlers = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (cfg: unknown) => unknown }>
    }).handlers
    const interceptor = handlers[handlers.length - 1].fulfilled

    const config = makeConfig()
    const result = interceptor(config) as typeof config
    expect(result.headers["Authorization"]).toBe("Bearer my-jwt")
  })

  it("does not attach Authorization header when no token", async () => {
    const { default: api } = await import("@/lib/api")

    const handlers = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (cfg: unknown) => unknown }>
    }).handlers
    const interceptor = handlers[handlers.length - 1].fulfilled

    const config = makeConfig()
    const result = interceptor(config) as typeof config
    expect(result.headers["Authorization"]).toBeUndefined()
  })

  it("removes Content-Type for FormData requests", async () => {
    const { default: api } = await import("@/lib/api")

    const handlers = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled: (cfg: unknown) => unknown }>
    }).handlers
    const interceptor = handlers[handlers.length - 1].fulfilled

    const form = new FormData()
    form.append("file", new Blob(["data"], { type: "application/pdf" }), "test.pdf")
    const config = makeConfig({ data: form })
    const result = interceptor(config) as typeof config
    expect(result.headers["Content-Type"]).toBeUndefined()
  })
})

// ── Response interceptor: handles 401 ────────────────────────────────────────

describe("API response interceptor", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "valid-token", role: Role.DOCTOR, userId: 1, name: "Dr" })
  })

  afterEach(() => {
    useAuthStore.setState({ token: null, role: null, userId: null, name: null })
    vi.restoreAllMocks()
  })

  it("resolves successful responses normally", async () => {
    const { default: api } = await import("@/lib/api")

    const handlers = (api.interceptors.response as unknown as {
      handlers: Array<{ fulfilled: (r: unknown) => unknown; rejected: (e: unknown) => unknown }>
    }).handlers
    const interceptor = handlers[handlers.length - 1].fulfilled

    const fakeResponse = { status: 200, data: { token: "jwt-abc" } }
    const result = interceptor(fakeResponse)
    expect(result).toBe(fakeResponse)
  })

  it("calls logout and clears token on 401 response", async () => {
    useAuthStore.setState({ token: "expired-token", role: Role.DOCTOR, userId: 1, name: "Dr" })

    // Spy on window.location.href before importing api
    const locationSpy = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "",
    } as Location)

    const { default: api } = await import("@/lib/api")

    const handlers = (api.interceptors.response as unknown as {
      handlers: Array<{ fulfilled: (r: unknown) => unknown; rejected: (e: unknown) => unknown }>
    }).handlers
    const interceptor = handlers[handlers.length - 1].rejected

    const error = { response: { status: 401 } }

    try {
      await interceptor(error)
    } catch {
      // expected to reject
    }

    expect(useAuthStore.getState().token).toBeNull()
    locationSpy.mockRestore()
  })
})
