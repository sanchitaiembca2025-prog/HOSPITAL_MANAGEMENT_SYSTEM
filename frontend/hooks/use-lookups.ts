import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { MedicalSectionResponse, DoctorProfileResponse } from "@/types"

export function useMedicalSections() {
  return useQuery({
    queryKey: ["lookups", "sections"],
    queryFn: async () => {
      const res = await api.get<MedicalSectionResponse[]>("/medical-sections")
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useDoctorsBySection(sectionId: number | null) {
  return useQuery({
    queryKey: ["lookups", "doctors", sectionId],
    queryFn: async () => {
      const res = await api.get<DoctorProfileResponse[]>(`/doctors?sectionId=${sectionId}`)
      return res.data
    },
    enabled: !!sectionId,
  })
}

export function useAllDoctors() {
  return useQuery({
    queryKey: ["lookups", "doctors", "all"],
    queryFn: async () => {
      const res = await api.get<DoctorProfileResponse[]>("/doctors")
      return res.data
    },
  })
}
