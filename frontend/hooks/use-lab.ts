import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { LabPatientResponse, SaveLabCostsRequest } from "@/types"

export function useLabPatient(patientId: string | number | null) {
  return useQuery({
    queryKey: ["lab", "patient", String(patientId)],
    queryFn: async () => {
      const res = await api.get<LabPatientResponse>(`/lab/patients/${patientId}`)
      return res.data
    },
    enabled: !!patientId,
    retry: false,
  })
}

export function useSaveLabCosts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      visitId,
      ...data
    }: SaveLabCostsRequest & { visitId: number }) => {
      const res = await api.post(`/visits/${visitId}/costs`, data)
      return res.data
    },
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
    },
  })
}

export function useUploadTestResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ visitId, file }: { visitId: number; file: File }) => {
      const formData = new FormData()
      formData.append("file", file)
      // Do NOT set Content-Type manually — browser must add the multipart boundary.
      const res = await api.post(`/visits/${visitId}/test-result`, formData)
      return res.data
    },
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
    },
  })
}
