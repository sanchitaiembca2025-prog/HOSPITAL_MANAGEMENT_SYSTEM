import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { useVisit, useVisitInvoice, useCreateVisit, useGenerateInvoice, useAdmitVisit, usePayInvoice } from "@/hooks/use-visit"

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import api from "@/lib/api"
const mockApi = api as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
}

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return {
    qc,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    ),
  }
}

beforeEach(() => vi.clearAllMocks())

describe("useVisit", () => {
  it("is disabled when visitId is null", () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useVisit(null), { wrapper })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("calls GET /visits/{id} when visitId is provided", async () => {
    const visitData = { visitId: 10, status: "ADMITTED" }
    mockApi.get.mockResolvedValue({ data: visitData })
    const { wrapper } = makeWrapper()

    const { result } = renderHook(() => useVisit(10), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.get).toHaveBeenCalledWith("/visits/10")
  })
})

describe("useVisitInvoice", () => {
  it("is disabled when visitId is null", () => {
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useVisitInvoice(null), { wrapper })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("calls GET /visits/{id}/invoice when visitId is provided", async () => {
    mockApi.get.mockResolvedValue({ data: { invoiceId: 1 } })
    const { wrapper } = makeWrapper()

    const { result } = renderHook(() => useVisitInvoice(5), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockApi.get).toHaveBeenCalledWith("/visits/5/invoice")
  })
})

describe("useCreateVisit", () => {
  it("calls POST /patients/{patientId}/visits", async () => {
    mockApi.post.mockResolvedValue({ data: { visitId: 1, status: "ADMITTED" } })
    const { wrapper } = makeWrapper()

    const { result } = renderHook(() => useCreateVisit(7), { wrapper })
    act(() => {
      result.current.mutate({ issue: "Fever", doctorId: 1, patientType: "OUTPATIENT" as never })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/patients/7/visits", expect.any(Object))
  })
})

describe("useGenerateInvoice", () => {
  it("calls POST /visits/{id}/invoice", async () => {
    mockApi.post.mockResolvedValue({ data: { invoiceId: 2 } })
    const { wrapper } = makeWrapper()

    const { result } = renderHook(() => useGenerateInvoice(), { wrapper })
    act(() => { result.current.mutate(10) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/visits/10/invoice")
  })
})

describe("useAdmitVisit", () => {
  it("calls PATCH /visits/{id}/admit", async () => {
    mockApi.patch.mockResolvedValue({ data: {} })
    const { wrapper } = makeWrapper()

    const { result } = renderHook(() => useAdmitVisit(), { wrapper })
    act(() => { result.current.mutate(3) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.patch).toHaveBeenCalledWith("/visits/3/admit")
  })
})

describe("usePayInvoice", () => {
  it("calls PATCH /visits/{id}/invoice/pay", async () => {
    mockApi.patch.mockResolvedValue({ data: {} })
    const { wrapper } = makeWrapper()

    const { result } = renderHook(() => usePayInvoice(), { wrapper })
    act(() => { result.current.mutate(4) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.patch).toHaveBeenCalledWith("/visits/4/invoice/pay")
  })
})
