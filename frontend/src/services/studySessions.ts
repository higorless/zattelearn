import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from './api'
import type { StudySession } from '@/types'

export function useTodaySessions() {
  const today = new Date().toISOString().slice(0, 10)
  return useQuery({
    queryKey: ['study-sessions', 'today', today],
    queryFn: () => api.get<StudySession[]>(`/study-sessions?date=${today}`).then(r => r.data),
    staleTime: 30_000,
  })
}

export function useStartSession() {
  return useMutation({
    mutationFn: (data: { cardId: number }) =>
      api.post<StudySession>('/study-sessions', data).then(r => r.data),
  })
}

export function useFinishSession() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; endedAt: string; durationSeconds: number }) =>
      api.put<StudySession>(`/study-sessions/${id}`, data).then(r => r.data),
  })
}
