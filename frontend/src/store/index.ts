import { configureStore } from '@reduxjs/toolkit'
import kanbanReducer from './slices/kanbanSlice'
import studySessionReducer from './slices/studySessionSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    kanban: kanbanReducer,
    studySession: studySessionReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
