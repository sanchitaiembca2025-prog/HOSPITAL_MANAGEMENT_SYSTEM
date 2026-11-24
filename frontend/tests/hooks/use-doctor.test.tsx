import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import {
  useDoctorProfile, useUpdateDoctorProfile,
  useDoctorPatient, useUploadPrescription, useMarkDeceased,
} from "@/hooks/use-doctor"

vi.mock("@/lib/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

import api from "@/lib/api"
const mockApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> }

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

beforeEach(() => vi.clearAllMocks())

describe("useDoctorProfile", () => {
  it("calls GET /doctor/profile", async () => {
    mockApi.get.mockResolvedValue({ data: { username: "doc1" } })
    const { result } = renderHook(() => useDoctorProfile(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/doctor/profile")
  })
})

describe("useUpdateDoctorProfile", () => {
  it("calls PUT /doctor/profile", async () => {
    mockApi.put.mockResolvedValue({ data: { phone: "9876543210" } })
    const { result } = renderHook(() => useUpdateDoctorProfile(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ phone: "9876543210" }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.put).toHaveBeenCalledWith("/doctor/profile", expect.objectContaining({ phone: "9876543210" }))
  })
})

describe("useDoctorPatient", () => {
  it("is disabled when patientId is null", () => {
    const { result } = renderHook(() => useDoctorPatient(null), { wrapper: wrapper() })
    expect(result.current.fetchStatus).toBe("idle")
  })

  it("calls GET /doctor/patients/:id when patientId is provided", async () => {
    mockApi.get.mockResolvedValue({ data: { patientId: 5 } })
    const { result } = renderHook(() => useDoctorPatient(5), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/doctor/patients/5")
  })
})

describe("useUploadPrescription", () => {
  it("calls POST /visits/:visitId/prescription with FormData", async () => {
    mockApi.post.mockResolvedValue({ data: { message: "Prescription uploaded" } })
    const file = new File(["pdf"], "rx.pdf", { type: "application/pdf" })
    const { result } = renderHook(() => useUploadPrescription(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ visitId: 10, file }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/visits/10/prescription", expect.any(FormData))
  })
})

describe("useMarkDeceased", () => {
  it("calls POST /visits/:visitId/deceased with FormData", async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const file = new File(["pdf"], "pm.pdf", { type: "application/pdf" })
    const { result } = renderHook(() => useMarkDeceased(), { wrapper: wrapper() })
    act(() => {
      result.current.mutate({
        visitId: 7,
        causeOfDeath: "Cardiac arrest",
        timeOfDeath: "14:30",
        dateOfDeath: "2026-11-24",
        postMortemFile: file,
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/visits/7/deceased", expect.any(FormData))
  })
})
