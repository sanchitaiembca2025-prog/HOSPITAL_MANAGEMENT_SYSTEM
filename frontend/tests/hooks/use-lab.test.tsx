import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { useLabPatient, useSaveLabCosts, useUploadTestResult } from "@/hooks/use-lab"

vi.mock("@/lib/api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import api from "@/lib/api"
const mockApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

beforeEach(() => vi.clearAllMocks())

describe("useLabPatient", () => {
  it("is disabled when patientId is null", () => {
    const { result } = renderHook(() => useLabPatient(null), { wrapper: wrapper() })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("calls GET /lab/patients/:id when patientId provided", async () => {
    mockApi.get.mockResolvedValue({ data: { name: "John Doe", canProceed: true } })
    const { result } = renderHook(() => useLabPatient(3), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/lab/patients/3")
  })
})

describe("useSaveLabCosts", () => {
  it("calls POST /visits/:visitId/costs", async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const { result } = renderHook(() => useSaveLabCosts(), { wrapper: wrapper() })
    act(() => {
      result.current.mutate({ visitId: 5, testIds: [1, 2], equipmentIds: [3], resourceIds: [] })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith(
      "/visits/5/costs",
      expect.objectContaining({ testIds: [1, 2] })
    )
  })
})

describe("useUploadTestResult", () => {
  it("calls POST /visits/:visitId/test-result with FormData", async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const file = new File(["pdf"], "result.pdf", { type: "application/pdf" })
    const { result } = renderHook(() => useUploadTestResult(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ visitId: 8, file }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/visits/8/test-result", expect.any(FormData))
  })
})
