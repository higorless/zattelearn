import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useKanbanColumns } from '@/services/kanban'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, ChevronLeft, ChevronRight, GripVertical, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { KanbanCard, KanbanColumn } from '@/types'
import { api } from '@/services/api'

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getWeekDays(anchor: Date) {
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function CalendarCardItem({ card, overlay }: { card: KanbanCard; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `cal-card-${card.id}`,
    data: { type: 'cal-card', card },
  })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const color = card.subject?.color ?? '#6b7280'

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: isDragging ? 0.3 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12 }}
        className="relative group"
      >
        {/* Card */}
        <div
          className={cn(
            'border-l-[3px] h-20 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 cursor-default select-none',
            (isDragging || overlay) && 'shadow-2xl ring-2 ring-primary/30',
            overlay && 'rotate-1',
          )}
          style={{ borderLeftColor: color }}
        >
          <div className="p-2 h-full flex items-start gap-1.5">
            <div
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/70 shrink-0 transition-colors"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs font-medium leading-snug line-clamp-2 text-left">{card.title}</p>
              {card.subject && (
                <p className="text-[10px] truncate mt-1" style={{ color }}>{card.subject.name}</p>
              )}
              {card.topic && (
                <p className="text-[10px] text-muted-foreground/50 truncate">{card.topic.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Hover tooltip */}
        {!isDragging && !overlay && (
          <div className="absolute left-full ml-2 top-0 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-300 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3 min-w-[180px] max-w-[220px] flex flex-col gap-1.5">
            <p className="text-xs font-medium leading-snug">{card.title}</p>
            {card.description && (
              <p className="text-[11px] text-muted-foreground leading-snug">{card.description}</p>
            )}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {card.subject && (
                <Badge variant="outline" className="text-[10px] h-4 px-1" style={{ borderColor: color, color }}>
                  {card.subject.name}
                </Badge>
              )}
              {card.topic && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  {card.topic.name}
                </Badge>
              )}
              {card.scheduledFor && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1 tabular-nums">
                  {new Date(card.scheduledFor + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </Badge>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function DayColumn({ day, cards, isToday }: { day: Date; cards: KanbanCard[]; isToday: boolean }) {
  const iso = toISO(day)
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${iso}`,
    data: { type: 'day', date: iso },
  })

  return (
    <div className={cn(
      'flex flex-col gap-2 flex-1 min-w-0 rounded-xl p-1 -m-1',
      isToday && 'bg-sidebar-primary/[0.04]',
    )}>
      <div
        className={cn(
          'rounded-lg px-2 py-2 text-center border transition-colors',
          isToday
            ? 'bg-sidebar-primary text-white border-sidebar-primary'
            : 'bg-muted/40 border-border/40',
        )}
      >
        <p className={cn('text-xs font-semibold uppercase tracking-widest', isToday ? 'text-white/70' : 'text-muted-foreground')}>
          {DAY_NAMES[day.getDay()]}
        </p>
        <p className="text-xl font-bold tabular-nums leading-tight mt-0.5">{day.getDate()}</p>
        <Badge
          variant="secondary"
          className={cn(
            'mt-1 h-4 px-1.5 tabular-nums text-xs',
            isToday ? 'bg-white/20 text-white border-0 hover:bg-white/20' : '',
            cards.length === 0 && !isToday ? 'text-muted-foreground/40' : '',
          )}
        >
          {cards.length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-1.5 flex-1 min-h-[8rem] rounded-lg p-1.5 transition-all duration-150',
          isOver
            ? 'bg-sidebar-primary/10 ring-2 ring-sidebar-primary/40 ring-dashed'
            : 'bg-transparent',
        )}
      >
        <AnimatePresence mode="popLayout">
          {cards.map(card => (
            <CalendarCardItem key={card.id} card={card} />
          ))}
        </AnimatePresence>

        {isOver ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center text-xs text-sidebar-primary font-medium select-none"
          >
            Solte aqui
          </motion.div>
        ) : cards.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/25 select-none">
            —
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function CalendarPage() {
  const [anchor, setAnchor] = useState(new Date())
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)
  const { data: columns = [], isLoading, isError, refetch } = useKanbanColumns()
  const qc = useQueryClient()

  const weekDays = getWeekDays(anchor)
  const today = toISO(new Date())

  const allCards = columns.flatMap(c => c.cards)

  const cardsByDay = weekDays.reduce<Record<string, KanbanCard[]>>((acc, day) => {
    const iso = toISO(day)
    acc[iso] = allCards.filter(card => card.scheduledFor?.slice(0, 10) === iso)
    return acc
  }, {})

  const unscheduled = allCards.filter(c => !c.scheduledFor)
  const scheduledThisWeek = weekDays.reduce((acc, d) => acc + (cardsByDay[toISO(d)]?.length ?? 0), 0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function prevWeek() {
    const d = new Date(anchor)
    d.setDate(d.getDate() - 7)
    setAnchor(d)
  }

  function nextWeek() {
    const d = new Date(anchor)
    d.setDate(d.getDate() + 7)
    setAnchor(d)
  }

  function onDragStart({ active }: DragStartEvent) {
    const cardId = Number(String(active.id).replace('cal-card-', ''))
    const card = allCards.find(c => c.id === cardId)
    if (card) setActiveCard(card)
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null)
    if (!over) return

    const cardId = Number(String(active.id).replace('cal-card-', ''))
    const overId = String(over.id)

    let newDate: string | null = null

    if (overId.startsWith('day-')) {
      newDate = overId.replace('day-', '')
    } else if (overId.startsWith('cal-card-')) {
      const overCardId = Number(overId.replace('cal-card-', ''))
      for (const day of weekDays) {
        const iso = toISO(day)
        if (cardsByDay[iso]?.some(c => c.id === overCardId)) {
          newDate = iso
          break
        }
      }
      if (!newDate) return
    } else {
      return
    }

    // Optimistic update — move the card in cache immediately so there's no flash
    const snapshot = qc.getQueryData<KanbanColumn[]>(['kanban', 'columns'])
    qc.setQueryData<KanbanColumn[]>(['kanban', 'columns'], old =>
      old?.map(col => ({
        ...col,
        cards: col.cards.map(c =>
          c.id === cardId ? { ...c, scheduledFor: newDate } : c
        ),
      }))
    )

    try {
      await api.put(`/kanban/cards/${cardId}`, { scheduledFor: newDate })
      qc.invalidateQueries({ queryKey: ['kanban', 'columns'] })
    } catch {
      qc.setQueryData(['kanban', 'columns'], snapshot)
      toast.error('Erro ao agendar card — tente novamente')
    }
  }

  const monthLabel = weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 overflow-hidden">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-baseline gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 self-center" />
            <h1 className="font-display text-xl font-normal">Semana</h1>
          </div>
          <span className="text-sm text-muted-foreground capitalize">{monthLabel}</span>
          {scheduledThisWeek > 0 && (
            <span className="text-xs text-muted-foreground/50">
              · {scheduledThisWeek} {scheduledThisWeek === 1 ? 'card' : 'cards'} agendado{scheduledThisWeek !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={prevWeek} className="h-7 w-7" aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setAnchor(new Date())} className="h-7 text-xs px-3">
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek} className="h-7 w-7" aria-label="Próxima semana">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1 text-muted-foreground">
          <p className="text-sm">Não foi possível carregar os cards.</p>
          <button onClick={() => refetch()} className="text-xs underline underline-offset-4 hover:text-foreground transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex gap-3 flex-1">
          {[...Array(7)].map((_, i) => <Skeleton key={i} className="flex-1 rounded-lg" />)}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-2 flex-1 overflow-hidden min-h-0">
            {weekDays.map(day => (
              <DayColumn
                key={toISO(day)}
                day={day}
                cards={cardsByDay[toISO(day)] ?? []}
                isToday={toISO(day) === today}
              />
            ))}
          </div>

          <div className="border-t border-border/40 pt-3 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Inbox className="h-3.5 w-3.5 text-muted-foreground/50" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Não agendados
              </p>
              {unscheduled.length > 0 && (
                <>
                  <Badge variant="secondary" className="text-xs h-4 px-1.5 tabular-nums">
                    {unscheduled.length}
                  </Badge>
                  <p className="text-xs text-muted-foreground/40 ml-auto">Arraste para um dia</p>
                </>
              )}
            </div>

            {unscheduled.length === 0 ? (
              <div className="flex items-center justify-center py-3 text-xs text-muted-foreground/35 border border-dashed border-border/30 rounded-lg">
                Todos os cards estão agendados esta semana
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {unscheduled.map(card => (
                  <div key={card.id} className="w-48 shrink-0">
                    <CalendarCardItem card={card} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {activeCard && <CalendarCardItem card={activeCard} overlay />}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
