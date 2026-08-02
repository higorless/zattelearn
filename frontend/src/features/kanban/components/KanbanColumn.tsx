import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { KanbanCardItem } from './KanbanCard'
import { KanbanCreateCardDrawer } from './KanbanCreateCardDrawer'
import type { KanbanColumn, KanbanCard } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  column: KanbanColumn
  onStartSession?: (card: KanbanCard) => void
  onCardClick?: (card: KanbanCard) => void
}

export function KanbanColumnView({ column, onStartSession, onCardClick }: Props) {
  const cardIds = column.cards.map(c => `card-${c.id}`)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  return (
    <motion.div
      layout
      className="flex w-72 shrink-0 flex-col gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 bg-muted px-3 py-2 border border-border">
        <span className="text-xs font-semibold tracking-tight flex-1">{column.title}</span>
        <Badge variant="secondary" className="text-xs tabular-nums font-semibold">{column.cards.length}</Badge>
        <button
          onClick={() => setDrawerOpen(true)}
          className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Adicionar card"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-3 min-h-[4rem] transition-colors',
          isOver && 'bg-primary/5 ring-2 ring-primary/20 ring-dashed p-1',
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {column.cards.map(card => (
              <KanbanCardItem
                key={card.id}
                card={card}
                onStartSession={onStartSession}
                onCardClick={onCardClick}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {column.cards.length === 0 && !isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed p-4 text-center text-xs text-muted-foreground/60"
          >
            Arraste um card aqui
          </motion.div>
        )}
      </div>

      <KanbanCreateCardDrawer
        open={drawerOpen}
        columnId={column.id}
        onClose={() => setDrawerOpen(false)}
      />
    </motion.div>
  )
}
