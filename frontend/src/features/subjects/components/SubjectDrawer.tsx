import { motion } from 'framer-motion'
import { X, Check, Target, Tag, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
} from '@/components/ui/drawer'
import { useTopics, useObjectives, useUpdateObjective } from '@/services/subjects'
import { useKanbanColumns } from '@/services/kanban'
import type { Objective, Subject } from '@/types'
import { cn } from '@/lib/utils'

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

interface Props {
  subject: Subject
  open: boolean
  onClose: () => void
}

export function SubjectDrawer({ subject, open, onClose }: Props) {
  const { data: topics = [], isLoading: loadingTopics } = useTopics(subject.id)
  const { data: objectives = [], isLoading: loadingObjectives } = useObjectives(subject.id)
  const { data: columns = [] } = useKanbanColumns()
  const updateObjective = useUpdateObjective()

  const allCards = columns.flatMap(c => c.cards)
  const cardsByObjective = objectives.reduce<Record<number, typeof allCards>>((acc, o) => {
    acc[o.id] = allCards.filter(c => c.objectiveId === o.id)
    return acc
  }, {})
  const orphanCards = allCards.filter(c => c.subjectId === subject.id && !c.objectiveId)

  const doneCount = objectives.filter(o => o.status === 'done').length
  const progress = objectives.length > 0 ? (doneCount / objectives.length) * 100 : 0

  return (
    <Drawer
      open={open}
      onOpenChange={next => { if (!next) onClose() }}
      swipeDirection="right"
    >
      <DrawerContent style={{ '--drawer-content-width': '30rem' } as React.CSSProperties}>
        <div className="h-0.5 shrink-0" style={{ backgroundColor: subject.color }} />

        <DrawerHeader className="px-5 pt-4 pb-4 border-b border-border/30 gap-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-base font-semibold leading-snug">{subject.name}</h2>
              {subject.description && (
                <p className="text-sm text-muted-foreground/60 font-body leading-relaxed">
                  {subject.description}
                </p>
              )}
            </div>
            <DrawerClose className="rounded p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors shrink-0 mt-0.5">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>

          {objectives.length > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Progresso
                </span>
                <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                  {doneCount}/{objectives.length} objetivos
                </span>
              </div>
              <div className="h-0.5 bg-muted/40 overflow-hidden">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  style={{ backgroundColor: subject.color }}
                />
              </div>
            </div>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          {loadingTopics || loadingObjectives ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Carregando...</span>
            </div>
          ) : (
            <div className="px-5 py-5 space-y-7">

              {/* Objectives */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Objetivos
                  </p>
                </div>

                {objectives.length === 0 ? (
                  <p className="text-sm text-muted-foreground/40 font-body">Nenhum objetivo cadastrado.</p>
                ) : (
                  <ul className="space-y-4">
                    {objectives.map(o => {
                      const linkedCards = cardsByObjective[o.id] ?? []
                      return (
                        <li key={o.id} className="space-y-2">
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => updateObjective.mutate({ id: o.id, subjectId: o.subjectId, status: STATUS_NEXT[o.status] })}
                              title={`${STATUS_LABEL[o.status]} — clique para avançar`}
                              className="shrink-0 h-3.5 w-3.5 mt-0.5 transition-all hover:scale-110 focus:outline-none"
                              style={{
                                backgroundColor: o.status === 'done' ? subject.color : 'transparent',
                                outline: `1.5px solid ${o.status === 'pending' ? `${subject.color}60` : subject.color}`,
                                outlineOffset: '0px',
                              }}
                            />
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-start gap-2 justify-between">
                                <span className={cn(
                                  'text-sm font-body leading-snug',
                                  o.status === 'done' && 'text-muted-foreground/40 line-through decoration-muted-foreground/20',
                                )}>
                                  {o.title}
                                </span>
                                <span className={cn('text-[11px] shrink-0 mt-0.5', STATUS_COLOR[o.status])}>
                                  {STATUS_LABEL[o.status]}
                                </span>
                              </div>
                            </div>
                          </div>

                          {linkedCards.length > 0 && (
                            <ul className="ml-6 space-y-1.5">
                              {linkedCards.map(card => {
                                const col = columns.find(c => c.id === card.columnId)
                                return (
                                  <li key={card.id} className="flex items-start gap-2 text-xs text-muted-foreground/55">
                                    <span
                                      className="h-1 w-1 rounded-full shrink-0 mt-1.5 opacity-50"
                                      style={{ backgroundColor: subject.color }}
                                    />
                                    <span className="flex-1 font-body leading-snug">{card.title}</span>
                                    {col && (
                                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
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
              </div>

              {/* Orphan cards */}
              {orphanCards.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Cards sem objetivo
                  </p>
                  <ul className="space-y-2">
                    {orphanCards.map(card => {
                      const col = columns.find(c => c.id === card.columnId)
                      return (
                        <li key={card.id} className="flex items-start gap-2 text-xs text-muted-foreground/55">
                          <span
                            className="h-1 w-1 rounded-full shrink-0 mt-1.5 opacity-50"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="flex-1 font-body leading-snug">{card.title}</span>
                          {col && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                              {col.title}
                            </Badge>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Topics */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground/40" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Tópicos
                  </p>
                </div>

                {topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground/40 font-body">Nenhum tópico cadastrado.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topics.map(t => (
                      <span
                        key={t.id}
                        className="text-xs px-2.5 py-1 bg-muted border border-border/40 text-muted-foreground/70"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
