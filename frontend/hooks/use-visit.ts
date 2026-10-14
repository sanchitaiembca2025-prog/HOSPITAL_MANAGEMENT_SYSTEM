import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { VisitResponse, InvoiceResponse, CreateVisitRequest } from "@/types"

export function useVisit(visitId: string | number | null) {
  return useQuery({
    queryKey: ["visit", String(visitId)],
    queryFn: async () => {
      const res = await api.get<VisitResponse>(`/visits/${visitId}`)
      return res.data
    },
    enabled: !!visitId,
  })
}

export function useVisitInvoice(visitId: string | number | null) {
  return useQuery({
    queryKey: ["visit", String(visitId), "invoice"],
    queryFn: async () => {
      const res = await api.get<InvoiceResponse>(`/visits/${visitId}/invoice`)
      return res.data
    },
    enabled: !!visitId,
    retry: false,
  })
}

export function useCreateVisit(patientId: string | number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateVisitRequest) => {
      const res = await api.post<{ visitId: number; status: string }>(
        `/patients/${patientId}/visits`,
        data
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", String(patientId)] })
    },
  })
}

export function useAdmitVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (visitId: number) => {
      const res = await api.patch(`/visits/${visitId}/admit`)
      return res.data
    },
    onSuccess: (_data, visitId) => {
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
    },
  })
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (visitId: number) => {
      const res = await api.post<InvoiceResponse>(`/visits/${visitId}/invoice`)
      return res.data
    },
    onSuccess: (_data, visitId) => {
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId), "invoice"] })
    },
  })
}

export function usePayInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (visitId: number) => {
      const res = await api.patch(`/visits/${visitId}/invoice/pay`)
      return res.data
    },
    onSuccess: (_data, visitId) => {
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId), "invoice"] })
    },
  })
}
