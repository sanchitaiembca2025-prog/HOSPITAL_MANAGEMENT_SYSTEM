import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { PersonnelResponse, UpdatePersonnelRequest, CreateUserRequest } from "@/types"

export function usePersonnel(role: string) {
  return useQuery({
    queryKey: ["personnel", role],
    queryFn: async () => {
      const res = await api.get<PersonnelResponse[]>(`/admin/personnel?role=${role}`)
      return res.data
    },
    enabled: !!role,
  })
}

export function usePersonnelById(id: number | null) {
  return useQuery({
    queryKey: ["personnel", id],
    queryFn: async () => {
      const res = await api.get<PersonnelResponse>(`/admin/personnel/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const res = await api.post<PersonnelResponse>("/admin/personnel", data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["personnel"] }),
  })
}

export function useUpdatePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePersonnelRequest & { id: number }) => {
      const res = await api.put<PersonnelResponse>(`/admin/personnel/${id}`, data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["personnel"] }),
  })
}

export function useTogglePersonnelStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await api.patch(`/admin/personnel/${id}/status`, { isActive })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["personnel"] }),
  })
}
