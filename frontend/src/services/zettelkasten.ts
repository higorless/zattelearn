import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { ZettelNote } from '@/types'

const KEYS = {
  notes: ['zettel', 'notes'] as const,
  note: (id: number) => ['zettel', 'notes', id] as const,
}

export function useZettelNotes() {
  return useQuery({
    queryKey: KEYS.notes,
    queryFn: () => api.get<ZettelNote[]>('/zettel/notes').then(r => r.data),
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ZettelNote>) => api.post('/zettel/notes', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.notes }),
  })
}
