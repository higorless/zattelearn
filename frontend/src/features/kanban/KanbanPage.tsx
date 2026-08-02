import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { useKanbanColumns } from '@/services/kanban'
import { KanbanColumnView } from './components/KanbanColumn'
import { KanbanCardItem } from './components/KanbanCard'
import { KanbanCardDrawer } from './components/KanbanCardDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { LayoutDashboard } from 'lucide-react'
import type { KanbanCard, KanbanColumn } from '@/types'
import { useAppDispatch } from '@/store/hooks'
import { setActiveCard } from '@/store/slices/kanbanSlice'
import { startSession } from '@/store/slices/studySessionSlice'
import { useStartSession } from '@/services/studySessions'

export function KanbanPage() {
  const { data: serverColumns = [], isLoading, isError, refetch } = useKanbanColumns()
  const [localColumns, setLocalColumns] = useState<KanbanColumn[] | null>(null)
  const [activeCard, setActiveCardState] = useState<KanbanCard | null>(null)
  const [drawerCard, setDrawerCard] = useState<KanbanCard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const startSessionMutation = useStartSession()

  const columns = localColumns ?? serverColumns

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function openDrawer(card: KanbanCard) {
    setDrawerCard(card)
    setDrawerOpen(true)
  }

  async function handleStartSession(card: KanbanCard) {
    if (startSessionMutation.isPending) return
    try {
      const session = await startSessionMutation.mutateAsync({ cardId: card.id })
      dispatch(startSession({ id: session.id, cardId: card.id, startedAt: session.startedAt }))
    } catch {
      toast.error('Erro ao iniciar sessão')
    }
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  function handleDrawerExited() {
    setDrawerCard(null)
  }

  const findCard = useCallback((cardId: number) => {
    for (const col of columns) {
      const card = col.cards.find(c => c.id === cardId)
      if (card) return { card, column: col }
    }
    return null
  }, [columns])

  const findColumnByDropId = useCallback((droppableId: string) => {
    if (droppableId.startsWith('col-')) {
      const colId = Number(droppableId.replace('col-', ''))
      return columns.find(c => c.id === colId) ?? null
    }
    if (droppableId.startsWith('card-')) {
      const cardId = Number(droppableId.replace('card-', ''))
      return columns.find(c => c.cards.some(card => card.id === cardId)) ?? null
    }
    return null
  }, [columns])

  function onDragStart({ active }: DragStartEvent) {
    const cardId = Number(String(active.id).replace('card-', ''))
    const result = findCard(cardId)
    if (result) {
      setActiveCardState(result.card)
      dispatch(setActiveCard(result.card.id))
      setLocalColumns(columns.map(c => ({ ...c, cards: [...c.cards] })))
    }
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || !localColumns) return

    const activeCardId = Number(String(active.id).replace('card-', ''))
    const overTarget = String(over.id)

    const activeResult = findCard(activeCardId)
    if (!activeResult) return

    const targetColumn = findColumnByDropId(overTarget)
    if (!targetColumn) return

    if (activeResult.column.id === targetColumn.id) return

    setLocalColumns(prev => {
      if (!prev) return prev
      const next = prev.map(c => ({ ...c, cards: [...c.cards] }))
      const srcCol = next.find(c => c.id === activeResult.column.id)!
      const dstCol = next.find(c => c.id === targetColumn.id)!
      const cardIdx = srcCol.cards.findIndex(c => c.id === activeCardId)
      const [movedCard] = srcCol.cards.splice(cardIdx, 1)
      movedCard.columnId = dstCol.id
      dstCol.cards.push(movedCard)
      return next
    })
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCardState(null)
    dispatch(setActiveCard(null))

    if (!over || !localColumns) {
      setLocalColumns(null)
      return
    }

    const activeCardId = Number(String(active.id).replace('card-', ''))
    const overTarget = String(over.id)

    const activeResult = localColumns
      .flatMap(c => c.cards.map(card => ({ card, column: c })))
      .find(r => r.card.id === activeCardId)

    if (!activeResult) { setLocalColumns(null); return }

    const targetColumn = findColumnByDropId(overTarget)
    if (!targetColumn) { setLocalColumns(null); return }

    let finalColumns = localColumns

    if (activeResult.column.id === targetColumn.id && overTarget.startsWith('card-')) {
      const overId = Number(overTarget.replace('card-', ''))
      const colIdx = localColumns.findIndex(c => c.id === targetColumn.id)
      const cards = localColumns[colIdx].cards
      const oldIdx = cards.findIndex(c => c.id === activeCardId)
      const newIdx = cards.findIndex(c => c.id === overId)
      if (oldIdx !== newIdx) {
        finalColumns = localColumns.map((c, i) =>
          i === colIdx ? { ...c, cards: arrayMove(c.cards, oldIdx, newIdx) } : c,
        )
        setLocalColumns(finalColumns)
      }
    }

    const movedCard = finalColumns
      .flatMap(c => c.cards.map((card, pos) => ({ card, column: c, pos })))
      .find(r => r.card.id === activeCardId)

    if (movedCard) {
      try {
        await api.put(`/kanban/cards/${activeCardId}`, {
          columnId: movedCard.column.id,
          position: movedCard.pos,
        })
        qc.invalidateQueries({ queryKey: ['kanban', 'columns'] })
      } catch {
        toast.error('Erro ao salvar — tente novamente')
        setLocalColumns(null)
      }
    }

    setLocalColumns(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <h1 className="font-display text-xl font-normal">Kanban</h1>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 w-72 rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <h1 className="font-display text-xl font-normal">Kanban</h1>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 flex-1 text-muted-foreground">
          <p className="text-sm">Não foi possível carregar o quadro.</p>
          <button onClick={() => refetch()} className="text-xs underline underline-offset-4 hover:text-foreground transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <h1 className="font-display text-xl font-normal">Kanban</h1>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 flex-1 text-muted-foreground">
          <LayoutDashboard className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nenhuma coluna criada ainda.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 overflow-hidden">
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LayoutDashboard className="h-4 w-4" />
        <h1 className="font-display text-xl font-normal">Kanban</h1>
      </motion.div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full pb-4">
            <AnimatePresence>
              {columns.map(col => (
                <KanbanColumnView
                  key={col.id}
                  column={col}
                  onCardClick={openDrawer}
                  onStartSession={handleStartSession}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {activeCard && <KanbanCardItem card={activeCard} overlay />}
        </DragOverlay>
      </DndContext>

      {drawerCard && (
        <KanbanCardDrawer
          card={drawerCard}
          open={drawerOpen}
          onClose={closeDrawer}
          onExited={handleDrawerExited}
        />
      )}
    </div>
  )
}
