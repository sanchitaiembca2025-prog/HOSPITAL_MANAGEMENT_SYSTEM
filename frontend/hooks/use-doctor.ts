import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { DoctorProfileResponse, UpdateDoctorProfileRequest, PatientResponse } from "@/types"

export function useDoctorProfile() {
  return useQuery({
    queryKey: ["doctor", "profile"],
    queryFn: async () => {
      const res = await api.get<DoctorProfileResponse>("/doctor/profile")
      return res.data
    },
  })
}

export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateDoctorProfileRequest) => {
      const res = await api.put<DoctorProfileResponse>("/doctor/profile", data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", "profile"] })
    },
  })
}

export function useDoctorPatient(patientId: string | number | null) {
  return useQuery({
    queryKey: ["doctor", "patient", String(patientId)],
    queryFn: async () => {
      const res = await api.get<PatientResponse>(`/doctor/patients/${patientId}`)
      return res.data
    },
    enabled: !!patientId,
    retry: false,
  })
}

export function useUploadPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ visitId, file }: { visitId: number; file: File }) => {
      const formData = new FormData()
      formData.append("file", file)
      // Do NOT set Content-Type manually — let the browser set it with the correct
      // multipart boundary. Axios will strip the default application/json header.
      const res = await api.post(`/visits/${visitId}/prescription`, formData)
      return res.data
    },
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
      queryClient.invalidateQueries({ queryKey: ["doctor", "patient"] })
    },
  })
}

export function useMarkDeceased() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      visitId,
      causeOfDeath,
      timeOfDeath,
      dateOfDeath,
      postMortemFile,
    }: {
      visitId: number
      causeOfDeath: string
      timeOfDeath: string
      dateOfDeath: string
      postMortemFile: File
    }) => {
      const formData = new FormData()
      formData.append("causeOfDeath", causeOfDeath)
      formData.append("timeOfDeath", timeOfDeath)
      formData.append("dateOfDeath", dateOfDeath)
      formData.append("postMortemFile", postMortemFile)
      // Do NOT set Content-Type manually — browser must add the multipart boundary.
      const res = await api.post(`/visits/${visitId}/deceased`, formData)
      return res.data
    },
    onSuccess: (_data, { visitId }) => {
      queryClient.invalidateQueries({ queryKey: ["visit", String(visitId)] })
      queryClient.invalidateQueries({ queryKey: ["doctor", "patient"] })
    },
  })
}
