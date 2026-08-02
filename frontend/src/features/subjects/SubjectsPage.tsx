import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubjects, useTopics, useObjectives, useUpdateObjective, useCreateTopic, useCreateObjective } from '@/services/subjects'
import { useKanbanColumns } from '@/services/kanban'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Check, ChevronRight, Loader2, Plus, Target, X } from 'lucide-react'
import type { Objective, Subject } from '@/types'
import { SubjectCreateDrawer } from './components/SubjectCreateDrawer'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function InlineCreate({ placeholder, onConfirm, onCancel, isPending }: {
  placeholder: string
  onConfirm: (value: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [value, setValue] = useState('')
  return (
    <div className="flex items-center gap-1.5 mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter' && value.trim()) onConfirm(value.trim())
          if (e.key === 'Escape') onCancel()
        }}
        className="flex-1 bg-transparent text-xs text-foreground border-b border-primary/40 pb-1 outline-none placeholder:text-muted-foreground/40"
      />
      <button
        onClick={() => value.trim() && onConfirm(value.trim())}
        disabled={!value.trim() || isPending}
        className="text-primary/70 hover:text-primary disabled:opacity-30 transition-colors"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      </button>
      <button onClick={onCancel} className="text-muted-foreground/50 hover:text-foreground transition-colors">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

const STATUS_NEXT: Record<Objective['status'], Objective['status']> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
}

const STATUS_LABEL: Record<Objective['status'], string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluído',
}

const STATUS_COLOR: Record<Objective['status'], string> = {
  pending: 'text-muted-foreground/40',
  in_progress: 'text-foreground/70',
  done: 'text-muted-foreground/35',
}

function SubjectRow({ subject }: { subject: Subject }) {
  const [expanded, setExpanded] = useState(false)

  const { data: topics = [], isLoading: loadingTopics } = useTopics(subject.id)
  const { data: objectives = [], isLoading: loadingObjectives } = useObjectives(subject.id)
  const { data: columns = [] } = useKanbanColumns()
  const updateObjective = useUpdateObjective()
  const createTopic = useCreateTopic()
  const createObjective = useCreateObjective()

  const [addingTopic, setAddingTopic] = useState(false)
  const [addingObjective, setAddingObjective] = useState(false)

  async function handleCreateTopic(name: string) {
    try {
      await createTopic.mutateAsync({ subjectId: subject.id, name })
      setAddingTopic(false)
    } catch {
      toast.error('Erro ao criar tópico')
    }
  }

  async function handleCreateObjective(title: string) {
    try {
      await createObjective.mutateAsync({ subjectId: subject.id, title })
      setAddingObjective(false)
    } catch {
      toast.error('Erro ao criar objetivo')
    }
  }

  const allCards = columns.flatMap(c => c.cards)
  const cardsByObjective = objectives.reduce<Record<number, typeof allCards>>((acc, o) => {
    acc[o.id] = allCards.filter(c => c.objectiveId === o.id)
    return acc
  }, {})
  const orphanCards = allCards.filter(c => c.subjectId === subject.id && !c.objectiveId)

  const doneCount = objectives.filter(o => o.status === 'done').length
  const progress = objectives.length > 0 ? (doneCount / objectives.length) * 100 : 0

  function cycleStatus(o: Objective) {
    updateObjective.mutate({ id: o.id, subjectId: o.subjectId, status: STATUS_NEXT[o.status] })
  }

  return (
    <div className="border-l-2 bg-card border border-border/40 overflow-hidden" style={{ borderLeftColor: subject.color }}>
      <button
        className="w-full flex items-start gap-4 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0 space-y-0.5">
          <span className="text-sm font-medium">{subject.name}</span>
          {subject.description && (
            <p className="font-body text-xs text-muted-foreground line-clamp-1">{subject.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          {objectives.length > 0 && (
            <span className="text-[11px] text-muted-foreground/50 tabular-nums">
              {doneCount}/{objectives.length} objetivos
            </span>
          )}
          <ChevronRight className={cn('h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-150', expanded && 'rotate-90')} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30">
              {loadingTopics || loadingObjectives ? (
                <div className="px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Carregando...
                </div>
              ) : (
                <div className="px-4 py-4 space-y-5">

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        Objetivos
                      </p>
                      {objectives.length > 0 && (
                        <span className="text-[11px] text-muted-foreground/35 tabular-nums">
                          {doneCount}/{objectives.length}
                        </span>
                      )}
                      <div className="flex-1 h-px bg-border/30 relative">
                        <motion.div
                          className="absolute inset-y-0 left-0 h-px"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                          style={{ backgroundColor: subject.color }}
                        />
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setAddingObjective(v => !v) }}
                        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
                        title="Novo objetivo"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {objectives.length === 0 && !addingObjective && (
                      <p className="text-xs text-muted-foreground/40">Nenhum objetivo ainda.</p>
                    )}

                    {objectives.length > 0 && (
                      <ul className="space-y-3">
                        {objectives.map(o => {
                          const linkedCards = cardsByObjective[o.id] ?? []
                          return (
                            <li key={o.id} className="space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => cycleStatus(o)}
                                  title={`${STATUS_LABEL[o.status]} — clique para avançar`}
                                  className="shrink-0 h-3 w-3 transition-all hover:scale-110 focus:outline-none"
                                  style={{
                                    backgroundColor: o.status === 'done' ? subject.color : 'transparent',
                                    outline: `1.5px solid ${o.status === 'pending' ? `${subject.color}60` : subject.color}`,
                                    outlineOffset: '0px',
                                  }}
                                />
                                <span className={cn(
                                  'flex-1 text-xs font-body',
                                  o.status === 'done' && 'text-muted-foreground/40 line-through decoration-muted-foreground/20',
                                )}>
                                  {o.title}
                                </span>
                                <span className={cn('text-[11px] shrink-0', STATUS_COLOR[o.status])}>
                                  {STATUS_LABEL[o.status]}
                                </span>
                              </div>

                              {linkedCards.length > 0 && (
                                <ul className="ml-5 space-y-1">
                                  {linkedCards.map(card => {
                                    const col = columns.find(c => c.id === card.columnId)
                                    return (
                                      <li key={card.id} className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                                        <span
                                          className="h-1 w-1 rounded-full shrink-0 opacity-50"
                                          style={{ backgroundColor: subject.color }}
                                        />
                                        <span className="flex-1 truncate font-body">{card.title}</span>
                                        {col && (
                                          <Badge variant="secondary" className="text-[10px] h-3.5 px-1 shrink-0">
                                            {col.title}
                                          </Badge>
                                        )}
                                      </li>
                                    )
                                  })}
                                </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {addingObjective && (
                      <InlineCreate
                        placeholder="Título do objetivo"
                        onConfirm={handleCreateObjective}
                        onCancel={() => setAddingObjective(false)}
                        isPending={createObjective.isPending}
                      />
                    )}
                  </div>

                  {orphanCards.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        Cards sem objetivo
                      </p>
                      <ul className="space-y-1">
                        {orphanCards.map(card => {
                          const col = columns.find(c => c.id === card.columnId)
                          return (
                            <li key={card.id} className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                              <span
                                className="h-1 w-1 rounded-full shrink-0 opacity-50"
                                style={{ backgroundColor: subject.color }}
                              />
                              <span className="flex-1 truncate font-body">{card.title}</span>
                              {col && (
                                <Badge variant="secondary" className="text-[10px] h-3.5 px-1 shrink-0">
                                  {col.title}
                                </Badge>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        Tópicos
                      </p>
                      <div className="flex-1" />
                      <button
                        onClick={e => { e.stopPropagation(); setAddingTopic(v => !v) }}
                        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
                        title="Novo tópico"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {topics.length === 0 && !addingTopic && (
                      <p className="text-xs text-muted-foreground/40">Nenhum tópico ainda.</p>
                    )}

                    {topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {topics.map(t => (
                          <span key={t.id} className="text-[11px] px-2 py-0.5 bg-muted border border-border/40 text-muted-foreground">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {addingTopic && (
                      <InlineCreate
                        placeholder="Nome do tópico"
                        onConfirm={handleCreateTopic}
                        onCancel={() => setAddingTopic(false)}
                        isPending={createTopic.isPending}
                      />
                    )}
                  </div>

                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SubjectsPage() {
  const { data: subjects = [], isLoading, isError, refetch } = useSubjects()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 overflow-auto">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        <h1 className="font-display text-xl font-normal">Matérias</h1>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1.5 h-7 text-xs px-3">
          <Plus className="h-3 w-3" />
          Nova matéria
        </Button>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-20 text-muted-foreground">
          <p className="text-sm">Não foi possível carregar as matérias.</p>
          <button onClick={() => refetch()} className="text-xs underline underline-offset-4 hover:text-foreground transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-20 text-muted-foreground">
          <Target className="h-8 w-8 opacity-20" />
          <p className="text-sm">Nenhuma matéria cadastrada ainda.</p>
          <button onClick={() => setCreateOpen(true)} className="text-xs underline underline-offset-4 hover:text-foreground transition-colors">
            Criar primeira matéria
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 max-w-2xl">
          {subjects.map(s => <SubjectRow key={s.id} subject={s} />)}
        </div>
      )}

      <SubjectCreateDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
