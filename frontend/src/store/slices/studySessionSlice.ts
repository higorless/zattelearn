import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ActiveSession {
  id: number
  cardId: number
  startedAt: string
  elapsedSeconds: number
  isRunning: boolean
}

interface StudySessionState {
  active: ActiveSession | null
}

const initialState: StudySessionState = {
  active: null,
}

const studySessionSlice = createSlice({
  name: 'studySession',
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<{ id: number; cardId: number; startedAt: string; elapsedSeconds?: number }>) {
      state.active = { ...action.payload, elapsedSeconds: action.payload.elapsedSeconds ?? 0, isRunning: true }
    },
    pauseSession(state) {
      if (state.active) state.active.isRunning = false
    },
    resumeSession(state) {
      if (state.active) state.active.isRunning = true
    },
    tickSession(state) {
      if (state.active?.isRunning) state.active.elapsedSeconds += 1
    },
    endSession(state) {
      state.active = null
    },
  },
})

export const { startSession, pauseSession, resumeSession, tickSession, endSession } =
  studySessionSlice.actions
export default studySessionSlice.reducer
