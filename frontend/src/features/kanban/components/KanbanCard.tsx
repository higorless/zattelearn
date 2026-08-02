import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GripVertical, Play } from 'lucide-react'
import type { KanbanCard } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  card: KanbanCard
  onStartSession?: (card: KanbanCard) => void
  onCardClick?: (card: KanbanCard) => void
  overlay?: boolean
}

export function KanbanCardItem({ card, onStartSession, onCardClick, overlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', card },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const color = card.subject?.color ?? '#6b7280'

  function handleCardClick() {
    if (!isDragging && !overlay && onCardClick) onCardClick(card)
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <Card
          onClick={handleCardClick}
          className={cn(
            'border-l-[3px] group select-none transition-[box-shadow]',
            onCardClick && !overlay && 'cursor-pointer',
            isDragging && 'shadow-2xl ring-2 ring-primary/30',
            overlay && 'shadow-2xl rotate-2 ring-2 ring-primary/40',
            !isDragging && !overlay && onCardClick && 'hover:ring-foreground/20',
          )}
          style={{ borderLeftColor: color }}
        >
          <CardContent className={cn('p-2.5 overflow-hidden', onStartSession && 'pb-0')}>
            <div className="flex items-start gap-2">
              <div
                {...listeners}
                onClick={e => e.stopPropagation()}
                className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm font-medium leading-snug line-clamp-2">{card.title}</p>
                {card.description && (
                  <p className="font-body text-xs text-muted-foreground line-clamp-1">{card.description}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {card.subject && (
                    <Badge
                      variant="outline"
                      className="text-xs h-5"
                      style={{ borderColor: color, color }}
                    >
                      {card.subject.name}
                    </Badge>
                  )}
                  {card.topic && (
                    <Badge variant="secondary" className="text-xs h-5">
                      {card.topic.name}
                    </Badge>
                  )}
                  {card.scheduledFor && (
                    <Badge variant="secondary" className="text-xs h-5 tabular-nums shrink-0">
                      {new Date(card.scheduledFor + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          {onStartSession && (
            <div data-slot="card-footer" className="h-0 overflow-hidden group-hover:h-7 transition-all duration-150">
              <button
                onClick={e => { e.stopPropagation(); onStartSession(card) }}
                className="w-full h-7 flex items-center justify-center gap-1.5 text-xs font-medium border-t"
                style={{ borderColor: `${color}30`, backgroundColor: `${color}10`, color }}
              >
                <Play className="h-3 w-3" />
                Iniciar sessão
              </button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
