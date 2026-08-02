import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { Goal } from '@/types'

const KEYS = {
  goals: ['goals'] as const,
  goal: (id: number) => ['goals', id] as const,
}

export function useGoals() {
  return useQuery({
    queryKey: KEYS.goals,
    queryFn: () => api.get<Goal[]>('/goals').then(r => r.data),
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      subject_id: number
      topic_id?: number
      title: string
      target_hours: number
      deadline?: string
    }) => api.post<Goal>('/goals', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.goals }),
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/goals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.goals }),
  })
}
