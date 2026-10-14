import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import {
  CatalogueTestResponse, CatalogueTestRequest,
  CatalogueEquipmentResponse, CatalogueEquipmentRequest,
  CatalogueResourceResponse, CatalogueResourceRequest,
} from "@/types"

// ── Tests ─────────────────────────────────────────────────────────────────────

export function useTests() {
  return useQuery({
    queryKey: ["catalogue", "tests"],
    queryFn: async () => {
      const res = await api.get<CatalogueTestResponse[]>("/admin/catalogue/tests")
      return res.data
    },
  })
}

export function useCreateTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CatalogueTestRequest) => {
      const res = await api.post<CatalogueTestResponse>("/admin/catalogue/tests", data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogue", "tests"] }),
  })
}

export function useUpdateTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ testId, ...data }: CatalogueTestRequest & { testId: number }) => {
      const res = await api.put<CatalogueTestResponse>(`/admin/catalogue/tests/${testId}`, data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogue", "tests"] }),
  })
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export function useEquipment() {
  return useQuery({
    queryKey: ["catalogue", "equipment"],
    queryFn: async () => {
      const res = await api.get<CatalogueEquipmentResponse[]>("/admin/catalogue/equipment")
      return res.data
    },
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CatalogueEquipmentRequest) => {
      const res = await api.post<CatalogueEquipmentResponse>("/admin/catalogue/equipment", data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogue", "equipment"] }),
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ equipmentId, ...data }: CatalogueEquipmentRequest & { equipmentId: number }) => {
      const res = await api.put<CatalogueEquipmentResponse>(`/admin/catalogue/equipment/${equipmentId}`, data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogue", "equipment"] }),
  })
}

// ── Resources ─────────────────────────────────────────────────────────────────

export function useResources() {
  return useQuery({
    queryKey: ["catalogue", "resources"],
    queryFn: async () => {
      const res = await api.get<CatalogueResourceResponse[]>("/admin/catalogue/resources")
      return res.data
    },
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CatalogueResourceRequest) => {
      const res = await api.post<CatalogueResourceResponse>("/admin/catalogue/resources", data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogue", "resources"] }),
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ resourceId, ...data }: CatalogueResourceRequest & { resourceId: number }) => {
      const res = await api.put<CatalogueResourceResponse>(`/admin/catalogue/resources/${resourceId}`, data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catalogue", "resources"] }),
  })
}

// ── Lookup versions (no admin prefix) ─────────────────────────────────────────

export function useAvailableTests() {
  return useQuery({
    queryKey: ["lookup", "tests"],
    queryFn: async () => {
      const res = await api.get<CatalogueTestResponse[]>("/catalogue/tests")
      return res.data
    },
    staleTime: 60_000,
  })
}

export function useActiveEquipment() {
  return useQuery({
    queryKey: ["lookup", "equipment"],
    queryFn: async () => {
      const res = await api.get<CatalogueEquipmentResponse[]>("/catalogue/equipment")
      return res.data
    },
    staleTime: 60_000,
  })
}

export function useActiveResources() {
  return useQuery({
    queryKey: ["lookup", "resources"],
    queryFn: async () => {
      const res = await api.get<CatalogueResourceResponse[]>("/catalogue/resources")
      return res.data
    },
    staleTime: 60_000,
  })
}
