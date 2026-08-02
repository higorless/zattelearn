import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface KanbanCard {
  id: number
  columnId: number
  subjectId: number | null
  topicId: number | null
  title: string
  description: string | null
  position: number
}

interface KanbanColumn {
  id: number
  title: string
  position: number
  cards: KanbanCard[]
}

interface KanbanState {
  columns: KanbanColumn[]
  activeCardId: number | null
}

const initialState: KanbanState = {
  columns: [],
  activeCardId: null,
}

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setColumns(state, action: PayloadAction<KanbanColumn[]>) {
      state.columns = action.payload
    },
    setActiveCard(state, action: PayloadAction<number | null>) {
      state.activeCardId = action.payload
    },
    moveCard(state, action: PayloadAction<{ cardId: number; toColumnId: number; toPosition: number }>) {
      const { cardId, toColumnId, toPosition } = action.payload
      let movedCard: KanbanCard | undefined

      for (const col of state.columns) {
        const idx = col.cards.findIndex(c => c.id === cardId)
        if (idx !== -1) {
          ;[movedCard] = col.cards.splice(idx, 1)
          break
        }
      }

      if (!movedCard) return

      movedCard.columnId = toColumnId
      movedCard.position = toPosition

      const targetCol = state.columns.find(c => c.id === toColumnId)
      if (targetCol) {
        targetCol.cards.splice(toPosition, 0, movedCard)
      }
    },
  },
})

export const { setColumns, setActiveCard, moveCard } = kanbanSlice.actions
export default kanbanSlice.reducer
