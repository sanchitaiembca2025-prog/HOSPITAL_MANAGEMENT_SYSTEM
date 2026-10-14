import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { SeminarResponse, SeminarRequest } from "@/types"

export function useSeminars() {
  return useQuery({
    queryKey: ["seminars"],
    queryFn: async () => {
      const res = await api.get<SeminarResponse[]>("/admin/seminars")
      return res.data
    },
  })
}

export function useCreateSeminar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: SeminarRequest) => {
      const res = await api.post<SeminarResponse>("/admin/seminars", data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seminars"] }),
  })
}

export function useUpdateSeminar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ seminarId, ...data }: SeminarRequest & { seminarId: number }) => {
      const res = await api.put<SeminarResponse>(`/admin/seminars/${seminarId}`, data)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seminars"] }),
  })
}
