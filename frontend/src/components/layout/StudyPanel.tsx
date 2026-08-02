import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Play, Pause, Square, RefreshCw, ArrowRight, PenLine, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  startSession,
  pauseSession,
  resumeSession,
  tickSession,
  endSession,
} from '@/store/slices/studySessionSlice'
import { useKanbanColumns } from '@/services/kanban'
import { useZettelNotes } from '@/services/zettelkasten'
import { useGoals } from '@/services/goals'
import { useTodaySessions, useStartSession, useFinishSession } from '@/services/studySessions'
import { useCreateNote } from '@/services/zettelkasten'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatHoursShort(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`
  const m = Math.floor(totalSeconds / 60)
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h}h` : `${h}h ${rem}min`
}

export function StudyPanel() {
  const dispatch = useAppDispatch()
  const qc = useQueryClient()
  const active = useAppSelector(s => s.studySession.active)

  const { data: columns = [] } = useKanbanColumns()
  const { data: notes = [] } = useZettelNotes()
  const { data: goals = [] } = useGoals()
  const { data: todaySessions = [] } = useTodaySessions()

  const startSessionMutation = useStartSession()
  const finishSessionMutation = useFinishSession()
  const createNote = useCreateNote()

  // Cards from all non-last columns (skip "Concluído")
  const availableCards = useMemo(() => {
    if (!columns.length) return []
    const nonFinal = columns.slice(0, -1)
    return nonFinal.flatMap(c => c.cards)
  }, [columns])

  const [cardIndex, setCardIndex] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteTags, setNoteTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [recoveryDismissed, setRecoveryDismissed] = useState<number | null>(null)

  // Tick the active session every second
  useEffect(() => {
    if (!active?.isRunning) return
    const id = setInterval(() => dispatch(tickSession()), 1000)
    return () => clearInterval(id)
  }, [active?.isRunning, dispatch])

  // Detect sessions left open (e.g. after page refresh)
  const openOrphanSession = !active
    ? todaySessions.find(s => !s.endedAt && s.id !== recoveryDismissed) ?? null
    : null

  const focusCard = availableCards.length > 0
    ? availableCards[cardIndex % availableCards.length]
    : null

  const allCards = columns.flatMap(c => c.cards)
  const activeCard = active ? allCards.find(c => c.id === active.cardId) ?? null : null

  const todayTotalSeconds = todaySessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0)
  const displayTotalSeconds = todayTotalSeconds + (active?.elapsedSeconds ?? 0)

  const activeGoals = goals
    .filter(g => g.studiedSeconds / 3600 < g.targetHours)
    .slice(0, 3)

  const recentNotes = notes.slice(0, 2)

  const accentColor = active
    ? (activeCard?.subject?.color ?? 'oklch(0.488 0.243 264.376)')
    : (focusCard?.subject?.color ?? 'oklch(0.488 0.243 264.376)')

  function shuffleCard() {
    if (availableCards.length <= 1) return
    setCardIndex(i => {
      let next = i
      while (next === i) next = Math.floor(Math.random() * availableCards.length)
      return next
    })
  }

  async function handleStartInlineSession() {
    if (!focusCard || active) return
    try {
      const session = await startSessionMutation.mutateAsync({ cardId: focusCard.id })
      dispatch(startSession({ id: session.id, cardId: focusCard.id, startedAt: session.startedAt }))
    } catch {
      toast.error('Erro ao iniciar sessão')
    }
  }

  function handleRequestFinish() {
    if (!active) return
    dispatch(pauseSession())
    setIsFinishing(true)
    const suggested: string[] = []
    if (activeCard?.subject?.name) suggested.push(activeCard.subject.name)
    if (activeCard?.topic?.name) suggested.push(activeCard.topic.name)
    setNoteTags(suggested)
  }

  async function handleQuickEnd() {
    if (!active) return
    try {
      await finishSessionMutation.mutateAsync({
        id: active.id,
        endedAt: new Date().toISOString(),
        durationSeconds: active.elapsedSeconds,
      })
      dispatch(endSession())
      qc.invalidateQueries({ queryKey: ['study-sessions', 'today'] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Sessão encerrada')
    } catch {
      toast.error('Erro ao encerrar sessão — tente novamente')
    }
  }

  function handleCancelFinish() {
    setIsFinishing(false)
    dispatch(resumeSession())
  }

  async function handleConfirmFinalize() {
    if (!active) return

    // Step 1: close the session — if this fails, nothing else proceeds
    try {
      await finishSessionMutation.mutateAsync({
        id: active.id,
        endedAt: new Date().toISOString(),
        durationSeconds: active.elapsedSeconds,
      })
    } catch {
      toast.error('Erro ao finalizar sessão — tente novamente')
      dispatch(resumeSession())
      setIsFinishing(false)
      return
    }

    // Session is closed on backend; clear Redux immediately
    const sessionId = active.id
    const cardTitle = activeCard?.title ?? 'Sessão de estudo'
    const cardSubject = activeCard?.subject
    dispatch(endSession())
    qc.invalidateQueries({ queryKey: ['study-sessions', 'today'] })
    qc.invalidateQueries({ queryKey: ['goals'] })

    // Step 2: save note — non-blocking, session is already done
    if (noteContent.trim()) {
      try {
        await createNote.mutateAsync({
          sessionId,
          title: cardTitle,
          content: noteContent.trim(),
          tags: noteTags,
        })
        toast.success('Sessão finalizada · nota salva no Zettelkasten')
      } catch {
        toast.error('Sessão encerrada, mas houve erro ao salvar a nota')
      }
    } else {
      toast.success('Sessão finalizada')
    }

    setIsFinishing(false)
    setNoteContent('')
    setNoteTags([])
    setTagInput('')
  }

  function handleRecoverSession() {
    if (!openOrphanSession) return
    const elapsed = Math.floor((Date.now() - new Date(openOrphanSession.startedAt).getTime()) / 1000)
    dispatch(startSession({
      id: openOrphanSession.id,
      cardId: openOrphanSession.cardId,
      startedAt: openOrphanSession.startedAt,
      elapsedSeconds: elapsed,
    }))
  }

  async function handleAbandonSession() {
    if (!openOrphanSession) return
    try {
      await finishSessionMutation.mutateAsync({
        id: openOrphanSession.id,
        endedAt: new Date().toISOString(),
        durationSeconds: 0,
      })
      qc.invalidateQueries({ queryKey: ['study-sessions', 'today'] })
      setRecoveryDismissed(openOrphanSession.id)
    } catch {
      toast.error('Erro ao encerrar sessão em aberto')
    }
  }

  const isPanelBusy = startSessionMutation.isPending ||
    finishSessionMutation.isPending ||
    createNote.isPending

  return (
    <aside
      className="shrink-0 border-l border-border/40 bg-sidebar flex flex-col overflow-hidden relative"
      style={{ flex: 1, minWidth: '300px', maxWidth: '520px' }}
    >
      {/* Accent line at top */}
      <motion.div
        className="h-0.5 shrink-0"
        animate={{ backgroundColor: accentColor }}
        transition={{ duration: 0.6 }}
      />

      {/* ── ORPHAN SESSION RECOVERY ── */}
      <AnimatePresence>
        {openOrphanSession && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden shrink-0"
          >
            <div className="px-4 py-2.5 bg-amber-500/8 border-b border-amber-500/20 space-y-2">
              <p className="text-[11px] text-amber-400/80 font-medium leading-snug">
                Sessão em aberto encontrada. Retomar de onde parou?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRecoverSession}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Retomar
                </button>
                <span className="text-amber-500/30 text-[11px]">·</span>
                <button
                  onClick={handleAbandonSession}
                  disabled={finishSessionMutation.isPending}
                  className="text-[11px] text-amber-500/50 hover:text-amber-400/70 transition-colors"
                >
                  Abandonar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP SECTION: φ ratio ── */}
      <div className="flex-[1.618] min-h-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>

          {/* ── STATE: ACTIVE SESSION ── */}
          {active && !isFinishing && (
            <motion.div
              key="session"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col h-full"
            >
              <div className="px-4 pt-4 pb-3 border-b border-border/30 flex items-center gap-2 shrink-0">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundColor: accentColor }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Em sessão
                </span>
              </div>

              <div className="px-4 py-3 border-b border-border/30 space-y-1.5 shrink-0">
                {activeCard?.subject && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 border border-current/40 inline-block"
                    style={{ color: activeCard.subject.color }}
                  >
                    {activeCard.subject.name}
                  </span>
                )}
                <p className="text-sm font-semibold leading-snug line-clamp-2">
                  {activeCard?.title ?? '—'}
                </p>
                {activeCard?.description && (
                  <p className="text-[11px] text-muted-foreground/55 line-clamp-1 font-body">
                    {activeCard.description}
                  </p>
                )}
              </div>

              {/* Timer */}
              <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
                <motion.div
                  className="font-mono font-bold tabular-nums select-none"
                  style={{
                    fontSize: '2.625rem',
                    letterSpacing: '-0.03em',
                    color: active.isRunning ? accentColor : 'oklch(0.556 0 0)',
                  }}
                  animate={{ opacity: active.isRunning ? 1 : 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatTime(active.elapsedSeconds)}
                </motion.div>

                <div className="flex flex-col items-center gap-2 w-full px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 px-4"
                    onClick={() =>
                      active.isRunning
                        ? dispatch(pauseSession())
                        : dispatch(resumeSession())
                    }
                    disabled={isPanelBusy}
                  >
                    {active.isRunning
                      ? <><Pause className="h-3 w-3" />Pausar</>
                      : <><Play className="h-3 w-3" />Retomar</>
                    }
                  </Button>

                  <div className="flex items-center gap-1 w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-7 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={handleQuickEnd}
                      disabled={isPanelBusy}
                    >
                      <Square className="h-3 w-3" />
                      Encerrar
                    </Button>
                    <div className="w-px h-4 bg-border/40 shrink-0" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={handleRequestFinish}
                      disabled={isPanelBusy}
                    >
                      <PenLine className="h-3 w-3" />
                      Com nota
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STATE: FINALIZING ── */}
          {isFinishing && (
            <motion.div
              key="finishing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col h-full"
            >
              <div className="px-4 pt-4 pb-3 border-b border-border/30 shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Finalizar sessão
                </p>
                <p className="text-xs text-muted-foreground/50 mt-0.5 tabular-nums">
                  {formatTime(active?.elapsedSeconds ?? 0)} estudado
                </p>
              </div>

              <div className="flex-1 px-4 py-4 flex flex-col gap-3 min-h-0 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Anotação rápida
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    placeholder="O que você aprendeu? (opcional)"
                    autoFocus
                    rows={4}
                    className="w-full bg-muted/20 border border-border/40 p-2.5 text-xs leading-relaxed resize-none outline-none focus:border-border/70 transition-colors placeholder:text-muted-foreground/35 font-body"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Tags
                  </label>
                  {noteTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {noteTags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted/40 border border-border/40 text-muted-foreground/70">
                          {tag}
                          <button
                            onClick={() => setNoteTags(t => t.filter(x => x !== tag))}
                            className="text-muted-foreground/40 hover:text-foreground transition-colors"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                        e.preventDefault()
                        const newTag = tagInput.trim().replace(/,$/, '')
                        if (newTag && !noteTags.includes(newTag)) {
                          setNoteTags(t => [...t, newTag])
                        }
                        setTagInput('')
                      }
                      if (e.key === 'Backspace' && !tagInput && noteTags.length > 0) {
                        setNoteTags(t => t.slice(0, -1))
                      }
                    }}
                    placeholder={noteTags.length === 0 ? 'Adicionar tag… (Enter ou vírgula)' : 'Nova tag…'}
                    className="w-full bg-transparent text-[11px] text-foreground border-b border-border/30 pb-1 outline-none placeholder:text-muted-foreground/35 focus:border-border/60 transition-colors"
                  />
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleCancelFinish}
                    disabled={isPanelBusy}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={handleConfirmFinalize}
                    disabled={isPanelBusy}
                  >
                    {isPanelBusy ? 'Salvando...' : 'Confirmar'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STATE: CARD SPOTLIGHT (default) ── */}
          {!active && !isFinishing && (
            <motion.div
              key="spotlight"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-border/30 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Próximo para estudar
                </span>
                {availableCards.length > 1 && (
                  <button
                    onClick={shuffleCard}
                    className="p-1 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors"
                    aria-label="Outro card"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                )}
              </div>

              {focusCard ? (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Card preview */}
                  <div className="px-4 py-4 border-b border-border/30 space-y-2 shrink-0">
                    <div className="flex gap-3">
                      {/* Accent bar — 2px, full opacity */}
                      <div
                        className="w-0.5 shrink-0 self-stretch"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div className="space-y-1.5 min-w-0">
                        {focusCard.subject && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 border border-current/40 inline-block font-medium"
                            style={{ color: focusCard.subject.color }}
                          >
                            {focusCard.subject.name}
                          </span>
                        )}
                        <p className="text-sm font-semibold leading-snug">
                          {focusCard.title}
                        </p>
                        {focusCard.description && (
                          <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-3 font-body">
                            {focusCard.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent zettel notes */}
                  {recentNotes.length > 0 && (
                    <div className="px-4 py-4 flex-1 min-h-0 overflow-y-auto">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
                        Anotações recentes
                      </p>
                      <div className="space-y-3.5">
                        {recentNotes.map(note => (
                          <div key={note.id} className="space-y-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground/70 truncate">
                              {note.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground/45 line-clamp-2 font-body leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="px-4 pb-4 pt-3 border-t border-border/30 mt-auto shrink-0">
                    <button
                      onClick={handleStartInlineSession}
                      disabled={startSessionMutation.isPending}
                      className="w-full flex items-center justify-between group px-4 py-3 border border-border/50 hover:border-border/80 bg-muted/20 hover:bg-muted/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock
                          className="h-3.5 w-3.5 shrink-0 transition-colors"
                          style={{ color: startSessionMutation.isPending ? 'oklch(0.556 0 0)' : accentColor }}
                        />
                        <span className="text-xs font-semibold">
                          {startSessionMutation.isPending ? 'Iniciando...' : 'Iniciar sessão'}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                  <Clock className="h-6 w-6 text-muted-foreground/25" />
                  <p className="text-xs text-muted-foreground/45 leading-relaxed">
                    Nenhum card pendente.<br />Crie tarefas no Kanban para começar.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/40 shrink-0" />

      {/* ── BOTTOM SECTION: 1 unit of golden ratio ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Today header */}
        <div className="px-4 pt-3.5 pb-2.5 flex items-baseline gap-2 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Hoje
          </span>
          {displayTotalSeconds > 0 ? (
            <span className="text-xs font-medium text-muted-foreground/80 tabular-nums">
              {formatHoursShort(displayTotalSeconds)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/35">—</span>
          )}
          {todaySessions.length > 0 && (
            <span className="text-[10px] text-muted-foreground/40 ml-auto">
              {todaySessions.length} {todaySessions.length === 1 ? 'sessão' : 'sessões'}
            </span>
          )}
        </div>

        {/* Goals progress */}
        {activeGoals.length > 0 ? (
          <div className="px-4 pb-4 space-y-3 overflow-y-auto flex-1 min-h-0">
            {activeGoals.map(goal => {
              const progress = Math.min(goal.studiedSeconds / (goal.targetHours * 3600), 1)
              const studiedH = (goal.studiedSeconds / 3600).toFixed(1).replace('.0', '')
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs text-muted-foreground/70 truncate flex-1 leading-tight">
                      {goal.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
                      {studiedH}/{goal.targetHours}h
                    </span>
                  </div>
                  <div className="h-0.5 bg-muted/40 overflow-hidden">
                    <motion.div
                      className="h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      style={{ backgroundColor: goal.subjectColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 pb-4">
            <p className="text-xs text-muted-foreground/35 text-center leading-relaxed">
              Sem metas ativas.<br />Crie em Metas para rastrear horas.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
