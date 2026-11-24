import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { usePatients, usePatient, useRegisterPatient } from "@/hooks/use-patient"

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from "@/lib/api"
const mockApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("usePatients", () => {
  it("calls GET /patients and returns data", async () => {
    const patients = [{ patientId: 1, firstName: "Alice" }]
    mockApi.get.mockResolvedValue({ data: patients })

    const { result } = renderHook(() => usePatients(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.get).toHaveBeenCalledWith("/patients")
    expect(result.current.data).toEqual(patients)
  })
})

describe("usePatient", () => {
  it("calls GET /patients/{id} when patientId is provided", async () => {
    const patient = { patientId: 5, firstName: "Bob" }
    mockApi.get.mockResolvedValue({ data: patient })

    const { result } = renderHook(() => usePatient(5), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.get).toHaveBeenCalledWith("/patients/5")
  })

  it("is disabled when patientId is null", () => {
    const { result } = renderHook(() => usePatient(null), { wrapper: wrapper() })
    expect(result.current.fetchStatus).toBe("idle")
    expect(mockApi.get).not.toHaveBeenCalled()
  })
})

describe("useRegisterPatient", () => {
  it("calls POST /patients with request body", async () => {
    mockApi.post.mockResolvedValue({ data: { patientId: 10, message: "Patient registered successfully" } })

    const { result } = renderHook(() => useRegisterPatient(), { wrapper: wrapper() })
    result.current.mutate({
      firstName: "Carol",
      lastName: "Test",
      phone: "9000000001",
      address: "1 Main St",
      gender: "FEMALE" as never,
      age: 30,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/patients", expect.any(Object))
  })
})
