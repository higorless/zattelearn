import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Pause, Play, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useKanbanColumns } from '@/services/kanban'
import { useTopics } from '@/services/subjects'
import { useStartSession, useFinishSession } from '@/services/studySessions'
import { useCreateNote } from '@/services/zettelkasten'

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function StudyPage() {
  const { cardId } = useParams<{ cardId: string }>()
  const navigate = useNavigate()

  const { data: columns = [], isLoading: columnsLoading } = useKanbanColumns()
  const card = columns.flatMap(c => c.cards).find(c => c.id === Number(cardId)) ?? null

  const { data: topics = [] } = useTopics(card?.subjectId ?? 0)

  const [sessionId, setSessionId] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  const [noteContent, setNoteContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const sessionStarted = useRef(false)
  const startSession = useStartSession()
  const finishSession = useFinishSession()
  const createNote = useCreateNote()

  useEffect(() => {
    if (!cardId || sessionStarted.current) return
    sessionStarted.current = true
    startSession.mutateAsync({ cardId: Number(cardId) }).then(session => {
      setSessionId(session.id)
      setIsRunning(true)
    }).catch(() => {
      toast.error('Erro ao iniciar sessão — verifique a conexão')
    })
  }, [cardId])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed])
    setTagInput('')
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  async function handleFinalize() {
    if (!sessionId) return
    setIsRunning(false)
    setIsFinishing(true)

    try {
      await finishSession.mutateAsync({
        id: sessionId,
        endedAt: new Date().toISOString(),
        durationSeconds: elapsed,
      })

      if (noteContent.trim()) {
        await createNote.mutateAsync({
          sessionId,
          title: card?.title ?? 'Sessão de estudo',
          content: noteContent.trim(),
          tags,
        })
      }

      toast.success('Sessão finalizada!')
      navigate('/kanban')
    } catch {
      toast.error('Erro ao finalizar — tente novamente')
      setIsFinishing(false)
      setIsRunning(true)
    }
  }

  const color = card?.subject?.color ?? 'oklch(0.556 0 0)'
  const isLoading = columnsLoading && !card

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-0.5 shrink-0 transition-colors duration-300" style={{ backgroundColor: color }} />

      <header className="flex items-center gap-3 px-6 py-4 border-b border-border/30 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/kanban')} className="h-8 w-8 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <h1 className="font-semibold text-base truncate leading-tight">
                {card?.title ?? 'Card não encontrado'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {card?.subject && (
                  <Badge
                    variant="outline"
                    className="text-xs h-4 px-1.5"
                    style={{ borderColor: color, color }}
                  >
                    {card.subject.name}
                  </Badge>
                )}
                {card?.topic && (
                  <Badge variant="secondary" className="text-xs h-4 px-1.5">
                    {card.topic.name}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        <Button
          size="sm"
          variant="destructive"
          onClick={handleFinalize}
          disabled={isFinishing || !sessionId}
          className="gap-1.5 shrink-0"
        >
          <Square className="h-3.5 w-3.5" />
          {isFinishing ? 'Finalizando...' : 'Finalizar sessão'}
        </Button>
      </header>

      {/* Timer */}
      <div className="flex flex-col items-center py-10 gap-4 shrink-0">
        <div
          className="font-mono font-bold tabular-nums tracking-tight select-none transition-all"
          style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            color: isRunning ? color : 'oklch(0.556 0 0)',
          }}
        >
          {formatTime(elapsed)}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRunning(r => !r)}
          disabled={!sessionId}
          className="gap-1.5"
        >
          {isRunning ? (
            <><Pause className="h-3.5 w-3.5" />Pausar</>
          ) : (
            <><Play className="h-3.5 w-3.5" />Retomar</>
          )}
        </Button>
      </div>

      {/* Notes + Tags */}
      <div className="flex-1 px-6 pb-10 w-full max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Anotações
          </label>
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Escreva suas anotações aqui... Elas serão salvas no Zettelkasten ao finalizar a sessão."
            rows={10}
            className="w-full bg-muted/20 border border-border/30 rounded-lg p-4 text-sm font-body leading-relaxed resize-none outline-none focus:border-border/60 transition-colors placeholder:text-muted-foreground/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Tags / Temas
          </label>
          <div className="flex flex-wrap gap-1.5 p-3 bg-muted/20 border border-border/30 rounded-lg min-h-[2.75rem] focus-within:border-border/60 transition-colors">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
                {tag}
                <button
                  onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                  className="text-muted-foreground/60 hover:text-foreground transition-colors ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput) addTag(tagInput) }}
              placeholder={tags.length === 0 ? 'Adicionar tag... (Enter ou vírgula para confirmar)' : ''}
              className="flex-1 min-w-[8rem] bg-transparent outline-none text-sm placeholder:text-muted-foreground/30"
            />
          </div>

          {topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground/40">Sugestões:</span>
              {topics
                .filter(t => !tags.includes(t.name))
                .map(t => (
                  <button
                    key={t.id}
                    onClick={() => addTag(t.name)}
                    className="text-xs text-muted-foreground/60 hover:text-foreground border border-border/30 hover:border-border/60 rounded px-1.5 py-0.5 transition-colors"
                  >
                    {t.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
