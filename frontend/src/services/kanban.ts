import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { KanbanColumn, KanbanCard } from '@/types'

const KEYS = {
  columns: ['kanban', 'columns'] as const,
  card: (id: number) => ['kanban', 'cards', id] as const,
}

export function useKanbanColumns() {
  return useQuery({
    queryKey: KEYS.columns,
    queryFn: () => api.get<KanbanColumn[]>('/kanban/columns').then(r => r.data),
  })
}

export function useMoveCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: number; columnId: number; position: number }) =>
      api.put(`/kanban/cards/${data.id}`, { columnId: data.columnId, position: data.position }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.columns }),
  })
}

export function useCreateCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<KanbanCard>) => api.post('/kanban/cards', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.columns }),
  })
}

export function useUpdateCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<KanbanCard> & { id: number }) =>
      api.put(`/kanban/cards/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.columns }),
  })
}

export function useDeleteCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/kanban/cards/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEYS.columns })
      const previous = qc.getQueryData<KanbanColumn[]>(KEYS.columns)
      qc.setQueryData<KanbanColumn[]>(KEYS.columns, old =>
        old?.map(col => ({ ...col, cards: col.cards.filter(c => c.id !== id) })) ?? []
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEYS.columns, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.columns }),
  })
}

export function useCreateColumn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string }) => api.post('/kanban/columns', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.columns }),
  })
}
