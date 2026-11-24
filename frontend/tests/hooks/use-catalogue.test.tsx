import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"
import {
  useTests, useCreateTest, useUpdateTest,
  useEquipment, useCreateEquipment, useUpdateEquipment,
  useResources, useCreateResource, useUpdateResource,
  useAvailableTests, useActiveEquipment, useActiveResources,
} from "@/hooks/use-catalogue"

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

describe("useTests", () => {
  it("calls GET /admin/catalogue/tests", async () => {
    mockApi.get.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useTests(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/admin/catalogue/tests")
  })
})

describe("useCreateTest", () => {
  it("calls POST /admin/catalogue/tests", async () => {
    mockApi.post.mockResolvedValue({ data: { testId: 1, testName: "Blood Panel" } })
    const { result } = renderHook(() => useCreateTest(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ testName: "Blood Panel", cost: 200, isAvailable: true }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/admin/catalogue/tests", expect.objectContaining({ testName: "Blood Panel" }))
  })
})

describe("useUpdateTest", () => {
  it("calls PUT /admin/catalogue/tests/:id", async () => {
    mockApi.put.mockResolvedValue({ data: { testId: 2, testName: "Updated" } })
    const { result } = renderHook(() => useUpdateTest(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ testId: 2, testName: "Updated", cost: 300, isAvailable: true }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.put).toHaveBeenCalledWith("/admin/catalogue/tests/2", expect.objectContaining({ testName: "Updated" }))
  })
})

describe("useEquipment", () => {
  it("calls GET /admin/catalogue/equipment", async () => {
    mockApi.get.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useEquipment(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/admin/catalogue/equipment")
  })
})

describe("useCreateEquipment", () => {
  it("calls POST /admin/catalogue/equipment", async () => {
    mockApi.post.mockResolvedValue({ data: { equipmentId: 1, equipmentName: "X-Ray" } })
    const { result } = renderHook(() => useCreateEquipment(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ equipmentName: "X-Ray", cost: 1000, isActive: true }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/admin/catalogue/equipment", expect.objectContaining({ equipmentName: "X-Ray" }))
  })
})

describe("useUpdateEquipment", () => {
  it("calls PUT /admin/catalogue/equipment/:id", async () => {
    mockApi.put.mockResolvedValue({ data: { equipmentId: 3 } })
    const { result } = renderHook(() => useUpdateEquipment(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ equipmentId: 3, equipmentName: "MRI", cost: 2000, isActive: true }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.put).toHaveBeenCalledWith("/admin/catalogue/equipment/3", expect.objectContaining({ equipmentName: "MRI" }))
  })
})

describe("useResources", () => {
  it("calls GET /admin/catalogue/resources", async () => {
    mockApi.get.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useResources(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/admin/catalogue/resources")
  })
})

describe("useCreateResource", () => {
  it("calls POST /admin/catalogue/resources", async () => {
    mockApi.post.mockResolvedValue({ data: { resourceId: 1, resourceName: "Bandages" } })
    const { result } = renderHook(() => useCreateResource(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ resourceName: "Bandages", costPerUnit: 5, isActive: true }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.post).toHaveBeenCalledWith("/admin/catalogue/resources", expect.objectContaining({ resourceName: "Bandages" }))
  })
})

describe("useUpdateResource", () => {
  it("calls PUT /admin/catalogue/resources/:id", async () => {
    mockApi.put.mockResolvedValue({ data: { resourceId: 4 } })
    const { result } = renderHook(() => useUpdateResource(), { wrapper: wrapper() })
    act(() => { result.current.mutate({ resourceId: 4, resourceName: "Gauze", costPerUnit: 10, isActive: true }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.put).toHaveBeenCalledWith("/admin/catalogue/resources/4", expect.objectContaining({ resourceName: "Gauze" }))
  })
})

describe("useAvailableTests", () => {
  it("calls GET /catalogue/tests (lookup endpoint)", async () => {
    mockApi.get.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useAvailableTests(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/catalogue/tests")
  })
})

describe("useActiveEquipment", () => {
  it("calls GET /catalogue/equipment (lookup endpoint)", async () => {
    mockApi.get.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useActiveEquipment(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/catalogue/equipment")
  })
})

describe("useActiveResources", () => {
  it("calls GET /catalogue/resources (lookup endpoint)", async () => {
    mockApi.get.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useActiveResources(), { wrapper: wrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.get).toHaveBeenCalledWith("/catalogue/resources")
  })
})
