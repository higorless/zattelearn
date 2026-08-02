import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Trash2, BookOpen, Tag, Calendar, Columns3, AlignLeft, Target, Play, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useKanbanColumns, useUpdateCard, useDeleteCard } from '@/services/kanban'
import { useSubjects, useTopics, useObjectives } from '@/services/subjects'
import type { KanbanCard } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  card: KanbanCard
  open: boolean
  onClose: () => void
  onExited?: () => void
}

const fieldBase =
  'w-full bg-transparent text-sm text-foreground border-b border-border/40 pb-1.5 pt-0.5 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40 [color-scheme:dark]'

function FieldRow({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground/60">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  )
}

export function KanbanCardDrawer({ card, open, onClose, onExited }: Props) {
  const navigate = useNavigate()
  const { data: columns = [] } = useKanbanColumns()
  const { data: subjects = [] } = useSubjects()

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [subjectId, setSubjectId] = useState<number | null>(card.subjectId)
  const [topicId, setTopicId] = useState<number | null>(card.topicId)
  const [objectiveId, setObjectiveId] = useState<number | null>(card.objectiveId)
  const [scheduledFor, setScheduledFor] = useState(card.scheduledFor ?? '')
  const [columnId, setColumnId] = useState(card.columnId)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const { data: topics = [] } = useTopics(subjectId ?? 0)
  const { data: objectives = [] } = useObjectives(subjectId ?? 0)

  const updateCard = useUpdateCard()
  const deleteCard = useDeleteCard()

  useEffect(() => {
    if (!open) return
    setMode('view')
    setTitle(card.title)
    setDescription(card.description ?? '')
    setSubjectId(card.subjectId)
    setTopicId(card.topicId)
    setObjectiveId(card.objectiveId)
    setScheduledFor(card.scheduledFor ?? '')
    setColumnId(card.columnId)
    setDeleteConfirm(false)
  }, [card.id, open])

  const isDirty =
    title.trim() !== card.title ||
    description.trim() !== (card.description ?? '') ||
    subjectId !== card.subjectId ||
    topicId !== card.topicId ||
    objectiveId !== card.objectiveId ||
    scheduledFor !== (card.scheduledFor ?? '') ||
    columnId !== card.columnId

  const titleIsValid = title.trim().length > 0 && title.trim().length <= 255

  const accentColor =
    card.subject?.color ??
    subjects.find(s => s.id === subjectId)?.color ??
    'oklch(0.556 0 0)'

  function handleSubjectChange(val: string) {
    setSubjectId(val ? Number(val) : null)
    setTopicId(null)
    setObjectiveId(null)
  }

  async function handleSave() {
    if (!titleIsValid) return
    try {
      await updateCard.mutateAsync({
        id: card.id,
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId ?? undefined,
        topicId: topicId ?? undefined,
        objectiveId: objectiveId,
        scheduledFor: scheduledFor || undefined,
        columnId,
      })
      toast.success('Card salvo')
      setMode('view')
    } catch {
      toast.error('Erro ao salvar — tente novamente')
    }
  }

  async function handleDelete() {
    try {
      await deleteCard.mutateAsync(card.id)
      toast.success('Card excluído')
      onClose()
    } catch {
      toast.error('Erro ao excluir — tente novamente')
    }
  }

  const viewColumn = columns.find(c => c.id === card.columnId)
  const viewSubject = card.subject ?? subjects.find(s => s.id === card.subjectId)
  const viewTopic = topics.find(t => t.id === card.topicId)

  return (
    <Drawer
      open={open}
      onOpenChange={next => { if (!next) onClose() }}
      onOpenChangeComplete={next => { if (!next) onExited?.() }}
      swipeDirection="right"
    >
      <DrawerContent style={{ '--drawer-content-width': '28rem' } as React.CSSProperties}>
        <div className="h-0.5 shrink-0 transition-colors duration-300" style={{ backgroundColor: accentColor }} />

        <DrawerHeader className="px-5 pt-4 pb-3 gap-1 border-b border-border/30">
          <div className="flex items-start gap-2">
            {mode === 'edit' ? (
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={255}
                placeholder="Título do card"
                className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none leading-snug"
              />
            ) : (
              <span className="flex-1 text-base font-semibold text-foreground leading-snug">{card.title}</span>
            )}
            <DrawerClose className="rounded p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {viewColumn && (
              <span className="text-xs text-muted-foreground/50">{viewColumn.title}</span>
            )}
            {viewSubject && (
              <Badge variant="outline" className="text-xs h-4 px-1.5" style={{ borderColor: accentColor, color: accentColor }}>
                {viewSubject.name}
              </Badge>
            )}
            {card.objective && (
              <Badge variant="secondary" className="text-xs h-4 px-1.5 gap-1">
                <Target className="h-2.5 w-2.5" />
                {card.objective.title}
              </Badge>
            )}
            {mode === 'edit' && !titleIsValid && title.length > 0 && (
              <span className="text-xs text-destructive ml-auto">Título muito longo</span>
            )}
          </div>
        </DrawerHeader>

        {mode === 'view' ? (
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div className="flex flex-wrap gap-2">
              {viewTopic && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground/60">{viewTopic.name}</span>
                </div>
              )}
              {card.scheduledFor && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground/60">
                    {new Date(card.scheduledFor + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {card.description ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                  <AlignLeft className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Notas</span>
                </div>
                <p className="text-sm font-body text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {card.description}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground/30">
                <AlignLeft className="h-3.5 w-3.5" />
                <span className="text-xs font-body italic">Sem anotações</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            <FieldRow label="Matéria" icon={<BookOpen className="h-3.5 w-3.5" />}>
              <select value={subjectId ?? ''} onChange={e => handleSubjectChange(e.target.value)} className={fieldBase}>
                <option value="">Nenhuma</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FieldRow>

            <FieldRow label="Objetivo" icon={<Target className="h-3.5 w-3.5" />}>
              <select
                value={objectiveId ?? ''}
                onChange={e => setObjectiveId(e.target.value ? Number(e.target.value) : null)}
                disabled={!subjectId}
                className={cn(fieldBase, !subjectId && 'opacity-35 cursor-not-allowed')}
              >
                <option value="">Nenhum</option>
                {objectives.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
              </select>
              {!subjectId && (
                <p className="text-xs text-muted-foreground/40 mt-0.5">Selecione uma matéria primeiro</p>
              )}
            </FieldRow>

            <FieldRow label="Tópico" icon={<Tag className="h-3.5 w-3.5" />}>
              <select
                value={topicId ?? ''}
                onChange={e => setTopicId(e.target.value ? Number(e.target.value) : null)}
                disabled={!subjectId}
                className={cn(fieldBase, !subjectId && 'opacity-35 cursor-not-allowed')}
              >
                <option value="">Nenhum</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FieldRow>

            <FieldRow label="Agendar para" icon={<Calendar className="h-3.5 w-3.5" />}>
              <input
                type="date"
                value={scheduledFor}
                onChange={e => setScheduledFor(e.target.value)}
                className={fieldBase}
              />
              {scheduledFor && (
                <button onClick={() => setScheduledFor('')} className="text-xs text-muted-foreground/50 hover:text-muted-foreground mt-0.5 transition-colors">
                  Remover agendamento
                </button>
              )}
            </FieldRow>

            <FieldRow label="Coluna" icon={<Columns3 className="h-3.5 w-3.5" />}>
              <select value={columnId} onChange={e => setColumnId(Number(e.target.value))} className={fieldBase}>
                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </FieldRow>

            <FieldRow label="Notas" icon={<AlignLeft className="h-3.5 w-3.5" />}>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Adicionar notas sobre este card..."
                rows={5}
                className={cn(fieldBase, 'font-body resize-none leading-relaxed border-b-0 border border-border/30 p-2.5 focus:border-border/60')}
              />
            </FieldRow>
          </div>
        )}

        <DrawerFooter className="px-5 pt-3 border-t border-border/30">
          {mode === 'view' ? (
            <div className="flex items-center gap-2">
              {!deleteConfirm ? (
                <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)} disabled={deleteCard.isPending} className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteCard.isPending}>
                    {deleteCard.isPending ? 'Excluindo...' : 'Confirmar exclusão'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)} disabled={deleteCard.isPending}>
                    Cancelar
                  </Button>
                </div>
              )}
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => setMode('edit')} className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button size="sm" onClick={() => navigate(`/study/${card.id}`)} className="gap-1.5">
                <Play className="h-3.5 w-3.5" />
                Iniciar sessão
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => setMode('view')} disabled={updateCard.isPending}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!isDirty || !titleIsValid || updateCard.isPending}>
                {updateCard.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
