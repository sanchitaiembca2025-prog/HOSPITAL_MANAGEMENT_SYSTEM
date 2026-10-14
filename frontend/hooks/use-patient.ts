import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { PatientResponse, RegisterPatientRequest } from "@/types"

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get<PatientResponse[]>("/patients")
      return res.data
    },
  })
}

export function usePatient(patientId: string | number | null) {
  return useQuery({
    queryKey: ["patient", String(patientId)],
    queryFn: async () => {
      const res = await api.get<PatientResponse>(`/patients/${patientId}`)
      return res.data
    },
    enabled: !!patientId,
  })
}

export function useRegisterPatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: RegisterPatientRequest) => {
      const res = await api.post<{ patientId: number; message: string }>("/patients", data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}
