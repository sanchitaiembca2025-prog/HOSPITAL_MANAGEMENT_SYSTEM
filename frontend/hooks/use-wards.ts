import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { WardResponse, UpdateWardRequest } from "@/types"

export function useWards() {
  return useQuery({
    queryKey: ["wards"],
    queryFn: async () => {
      const res = await api.get<WardResponse[]>("/admin/wards")
      return res.data
    },
  })
}

export function useLookupWards() {
  return useQuery({
    queryKey: ["lookup", "wards"],
    queryFn: async () => {
      const res = await api.get<WardResponse[]>("/wards")
      return res.data
    },
  })
}

export function useUpdateWard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateWardRequest & { id: number }) => {
      const res = await api.put<WardResponse>(`/admin/wards/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wards"] })
      queryClient.invalidateQueries({ queryKey: ["lookup", "wards"] })
    },
  })
}
