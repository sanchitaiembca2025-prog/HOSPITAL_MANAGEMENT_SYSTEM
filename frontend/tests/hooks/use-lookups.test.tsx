import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import { useMedicalSections, useDoctorsBySection, useAllDoctors } from "@/hooks/use-lookups"

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from "@/lib/api"
const mockGet = (api as { get: ReturnType<typeof vi.fn> }).get

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

beforeEach(() => vi.clearAllMocks())

describe("useMedicalSections", () => {
  it("calls GET /medical-sections", async () => {
    const sections = [{ sectionId: 1, sectionName: "Cardiology" }]
    mockGet.mockResolvedValue({ data: sections })

    const { result } = renderHook(() => useMedicalSections(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGet).toHaveBeenCalledWith("/medical-sections")
    expect(result.current.data).toEqual(sections)
  })
})

describe("useDoctorsBySection", () => {
  it("is disabled when sectionId is null", () => {
    const { result } = renderHook(() => useDoctorsBySection(null), { wrapper: wrapper() })
    expect(result.current.fetchStatus).toBe("idle")
    expect(mockGet).not.toHaveBeenCalled()
  })

  it("calls GET /doctors?sectionId= when sectionId is provided", async () => {
    mockGet.mockResolvedValue({ data: [] })

    const { result } = renderHook(() => useDoctorsBySection(3), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGet).toHaveBeenCalledWith("/doctors?sectionId=3")
  })
})

describe("useAllDoctors", () => {
  it("calls GET /doctors", async () => {
    mockGet.mockResolvedValue({ data: [] })

    const { result } = renderHook(() => useAllDoctors(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGet).toHaveBeenCalledWith("/doctors")
  })
})
