import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { Subject, Topic, Objective } from '@/types'

const KEYS = {
  subjects: ['subjects'] as const,
  subject: (id: number) => ['subjects', id] as const,
  topics: (subjectId: number) => ['topics', subjectId] as const,
  objectives: (subjectId: number) => ['objectives', subjectId] as const,
}

export function useSubjects() {
  return useQuery({
    queryKey: KEYS.subjects,
    queryFn: () => api.get<Subject[]>('/subjects').then(r => r.data),
  })
}

export function useTopics(subjectId: number) {
  return useQuery({
    queryKey: KEYS.topics(subjectId),
    queryFn: () => api.get<Topic[]>(`/topics?subject_id=${subjectId}`).then(r => r.data),
    enabled: !!subjectId,
  })
}

export function useObjectives(subjectId: number) {
  return useQuery({
    queryKey: KEYS.objectives(subjectId),
    queryFn: () => api.get<Objective[]>(`/objectives?subject_id=${subjectId}`).then(r => r.data),
    enabled: !!subjectId,
  })
}

export function useCreateSubject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Subject>) => api.post('/subjects', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.subjects }),
  })
}

export function useUpdateObjective() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, subjectId, ...data }: Partial<Objective> & { id: number; subjectId: number }) =>
      api.put<Objective>(`/objectives/${id}`, data).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.objectives(vars.subjectId) })
    },
  })
}
