import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, Trash2, Clock, CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useGoals, useDeleteGoal } from '@/services/goals'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { GoalCreateDrawer } from './components/GoalCreateDrawer'
import type { Goal } from '@/types'
import { cn } from '@/lib/utils'

function formatHours(seconds: number): string {
  const h = seconds / 3600
  if (h < 1) return `${Math.round(h * 60)}min`
  return `${h.toFixed(1).replace('.0', '')}h`
}

function daysUntil(date: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(date + 'T00:00:00')
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function GoalCard({ goal, warnNoTopic }: { goal: Goal; warnNoTopic?: boolean }) {
  const deleteGoal = useDeleteGoal()
  const studiedHours = goal.studiedSeconds / 3600
  const progress = Math.min(studiedHours / goal.targetHours, 1)
  const isComplete = studiedHours >= goal.targetHours
  const remaining = Math.max(goal.targetHours - studiedHours, 0)

  const days = goal.deadline ? daysUntil(goal.deadline) : null
  const isOverdue = days !== null && days < 0 && !isComplete

  async function handleDelete() {
    try {
      await deleteGoal.mutateAsync(goal.id)
      toast.success('Meta removida')
    } catch {
      toast.error('Erro ao remover meta')
    }
  }

  return (
    <div
      className={cn(
        'group relative border border-border/40 bg-card overflow-hidden',
        isComplete && 'border-border/20',
      )}
    >
      <div className="h-0.5 w-full" style={{ backgroundColor: goal.subjectColor }} />

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              {isComplete && (
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: goal.subjectColor }}
                />
              )}
              <span
                className={cn(
                  'text-sm font-medium truncate',
                  isComplete && 'text-muted-foreground/60',
                )}
              >
                {goal.title}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] px-1.5 py-0.5 border border-current/20"
                style={{ color: goal.subjectColor }}
              >
                {goal.subjectName}
              </span>
              {goal.topicName ? (
                <span className="text-[11px] text-muted-foreground/50 border border-border/30 px-1.5 py-0.5">
                  {goal.topicName}
                </span>
              ) : warnNoTopic && (
                <span className="flex items-center gap-1 text-[11px] text-amber-500/60">
                  <AlertTriangle className="h-3 w-3" />
                  Sem tópico — conta só cards sem categoria
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleteGoal.isPending}
            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/40 hover:text-destructive transition-all mt-0.5"
            aria-label="Remover meta"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-1 w-full bg-muted/40 overflow-hidden">
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ backgroundColor: goal.subjectColor }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              <span className="tabular-nums">
                {formatHours(goal.studiedSeconds)}
                <span className="text-muted-foreground/35"> / {goal.targetHours}h</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {goal.deadline && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px]',
                    isComplete
                      ? 'text-muted-foreground/30'
                      : isOverdue
                        ? 'text-destructive/70'
                        : days !== null && days <= 7
                          ? 'text-amber-500/70'
                          : 'text-muted-foreground/40',
                  )}
                >
                  <CalendarDays className="h-3 w-3" />
                  <span>
                    {isComplete
                      ? 'Concluída'
                      : isOverdue
                        ? `${Math.abs(days!)} dias atrás`
                        : days === 0
                          ? 'Hoje'
                          : `${days}d`}
                  </span>
                </div>
              )}
              {isComplete ? (
                <span className="text-[11px] font-medium" style={{ color: goal.subjectColor }}>
                  Concluída
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground/40 tabular-nums">
                  faltam {formatHours(remaining * 3600)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MetasPage() {
  const { data: goals = [], isLoading, isError, refetch } = useGoals()
  const [createOpen, setCreateOpen] = useState(false)

  const active = goals.filter(g => g.studiedSeconds / 3600 < g.targetHours)
  const completed = goals.filter(g => g.studiedSeconds / 3600 >= g.targetHours)

  // subjects that already have at least one topic-scoped goal
  const subjectsWithTopicGoals = new Set(
    goals.filter(g => g.topicName).map(g => g.subjectId)
  )

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 overflow-auto">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4" />
        <h1 className="font-display text-xl font-normal">Metas</h1>
        <div className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCreateOpen(true)}
          className="gap-1.5 h-7 text-xs px-3"
        >
          <Plus className="h-3 w-3" />
          Nova meta
        </Button>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-20 text-muted-foreground">
          <p className="text-sm">Não foi possível carregar as metas.</p>
          <button
            onClick={() => refetch()}
            className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2 max-w-2xl">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-20 text-muted-foreground">
          <Target className="h-8 w-8 opacity-20" />
          <p className="text-sm">Nenhuma meta criada ainda.</p>
          <p className="text-xs text-muted-foreground/50 text-center max-w-xs">
            Crie metas de horas de estudo por matéria e acompanhe seu progresso.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-xs underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {active.length > 0 && (
            <div className="space-y-2">
              {active.length !== goals.length && (
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  Em andamento
                </p>
              )}
              <div className="space-y-2">
                {active.map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    warnNoTopic={!g.topicName && subjectsWithTopicGoals.has(g.subjectId)}
                  />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                Concluídas
              </p>
              <div className="space-y-2 opacity-60">
                {completed.map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    warnNoTopic={!g.topicName && subjectsWithTopicGoals.has(g.subjectId)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GoalCreateDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
