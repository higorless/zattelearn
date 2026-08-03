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

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<ZettelNote> & { id: number }) =>
      api.put<ZettelNote>(`/zettel/notes/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.notes }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/zettel/notes/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEYS.notes })
      const previous = qc.getQueryData<ZettelNote[]>(KEYS.notes)
      qc.setQueryData<ZettelNote[]>(KEYS.notes, old => old?.filter(n => n.id !== id) ?? [])
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEYS.notes, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.notes }),
  })
}
