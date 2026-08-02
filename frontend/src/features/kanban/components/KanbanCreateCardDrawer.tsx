import { useState } from 'react'
import { toast } from 'sonner'
import { X, BookOpen, Tag, Calendar, Columns3, AlignLeft, Target, Plus, Check, Loader2 } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useKanbanColumns, useCreateCard } from '@/services/kanban'
import {
  useSubjects, useTopics, useObjectives,
  useCreateSubject, useCreateTopic, useCreateObjective,
} from '@/services/subjects'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  columnId: number
  onClose: () => void
  onExited?: () => void
}

const fieldBase =
  'w-full bg-transparent text-sm text-foreground border-b border-border/40 pb-1.5 pt-0.5 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40 [color-scheme:dark]'

function InlineCreate({ placeholder, onConfirm, onCancel, isPending }: {
  placeholder: string
  onConfirm: (value: string) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [value, setValue] = useState('')
  return (
    <div className="flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus
        onKeyDown={e => {
          if (e.key === 'Enter' && value.trim()) onConfirm(value.trim())
          if (e.key === 'Escape') onCancel()
        }}
        className="flex-1 bg-transparent text-xs text-foreground border-b border-primary/40 pb-1 outline-none placeholder:text-muted-foreground/40"
      />
      <button
        onClick={() => value.trim() && onConfirm(value.trim())}
        disabled={!value.trim() || isPending}
        className="text-primary/70 hover:text-primary disabled:opacity-30 transition-colors"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      </button>
      <button onClick={onCancel} className="text-muted-foreground/50 hover:text-foreground transition-colors">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

function FieldRow({ label, icon, onAdd, children }: {
  label: string
  icon: React.ReactNode
  onAdd?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground/60">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        {onAdd && (
          <button
            onClick={onAdd}
            className="ml-auto text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            title={`Criar novo ${label.toLowerCase()}`}
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export function KanbanCreateCardDrawer({ open, columnId, onClose, onExited }: Props) {
  const { data: columns = [] } = useKanbanColumns()
  const { data: subjects = [] } = useSubjects()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [topicId, setTopicId] = useState<number | null>(null)
  const [objectiveId, setObjectiveId] = useState<number | null>(null)
  const [scheduledFor, setScheduledFor] = useState('')
  const [targetColumnId, setTargetColumnId] = useState(columnId)

  const [creatingSubject, setCreatingSubject] = useState(false)
  const [creatingTopic, setCreatingTopic] = useState(false)
  const [creatingObjective, setCreatingObjective] = useState(false)

  const { data: topics = [] } = useTopics(subjectId ?? 0)
  const { data: objectives = [] } = useObjectives(subjectId ?? 0)
  const createCard = useCreateCard()
  const createSubject = useCreateSubject()
  const createTopic = useCreateTopic()
  const createObjective = useCreateObjective()

  const titleIsValid = title.trim().length > 0 && title.trim().length <= 255
  const accentColor = subjects.find(s => s.id === subjectId)?.color ?? 'oklch(0.556 0 0)'

  function handleSubjectChange(val: string) {
    setSubjectId(val ? Number(val) : null)
    setTopicId(null)
    setObjectiveId(null)
    setCreatingTopic(false)
    setCreatingObjective(false)
  }

  function reset() {
    setTitle('')
    setDescription('')
    setSubjectId(null)
    setTopicId(null)
    setObjectiveId(null)
    setScheduledFor('')
    setTargetColumnId(columnId)
    setCreatingSubject(false)
    setCreatingTopic(false)
    setCreatingObjective(false)
  }

  async function handleCreateSubject(name: string) {
    try {
      const subject = await createSubject.mutateAsync({ name })
      setSubjectId(subject.id)
      setCreatingSubject(false)
    } catch {
      toast.error('Erro ao criar matéria')
    }
  }

  async function handleCreateTopic(name: string) {
    if (!subjectId) return
    try {
      const topic = await createTopic.mutateAsync({ subjectId, name })
      setTopicId(topic.id)
      setCreatingTopic(false)
    } catch {
      toast.error('Erro ao criar tópico')
    }
  }

  async function handleCreateObjective(title: string) {
    if (!subjectId) return
    try {
      const objective = await createObjective.mutateAsync({ subjectId, title })
      setObjectiveId(objective.id)
      setCreatingObjective(false)
    } catch {
      toast.error('Erro ao criar objetivo')
    }
  }

  async function handleCreate() {
    if (!titleIsValid) return
    try {
      await createCard.mutateAsync({
        columnId: targetColumnId,
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId ?? undefined,
        topicId: topicId ?? undefined,
        objectiveId: objectiveId ?? undefined,
        scheduledFor: scheduledFor || undefined,
      })
      toast.success('Card criado')
      reset()
      onClose()
    } catch {
      toast.error('Erro ao criar card — tente novamente')
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={next => { if (!next) onClose() }}
      onOpenChangeComplete={next => { if (!next) { reset(); onExited?.() } }}
      swipeDirection="right"
    >
      <DrawerContent style={{ '--drawer-content-width': '28rem' } as React.CSSProperties}>
        <div className="h-0.5 shrink-0 transition-colors duration-300" style={{ backgroundColor: accentColor }} />

        <DrawerHeader className="px-5 pt-4 pb-3 gap-1 border-b border-border/30">
          <div className="flex items-start gap-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Título do card"
              autoFocus
              className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none leading-snug"
            />
            <DrawerClose className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
          {!titleIsValid && title.length > 255 && (
            <span className="text-xs text-destructive">Título muito longo</span>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          <FieldRow
            label="Matéria"
            icon={<BookOpen className="h-3.5 w-3.5" />}
            onAdd={() => { setCreatingSubject(v => !v) }}
          >
            <select value={subjectId ?? ''} onChange={e => handleSubjectChange(e.target.value)} className={fieldBase}>
              <option value="">Nenhuma</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {creatingSubject && (
              <InlineCreate
                placeholder="Nome da matéria"
                onConfirm={handleCreateSubject}
                onCancel={() => setCreatingSubject(false)}
                isPending={createSubject.isPending}
              />
            )}
          </FieldRow>

          <FieldRow
            label="Objetivo"
            icon={<Target className="h-3.5 w-3.5" />}
            onAdd={subjectId ? () => setCreatingObjective(v => !v) : undefined}
          >
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
            {creatingObjective && subjectId && (
              <InlineCreate
                placeholder="Título do objetivo"
                onConfirm={handleCreateObjective}
                onCancel={() => setCreatingObjective(false)}
                isPending={createObjective.isPending}
              />
            )}
          </FieldRow>

          <FieldRow
            label="Tópico"
            icon={<Tag className="h-3.5 w-3.5" />}
            onAdd={subjectId ? () => setCreatingTopic(v => !v) : undefined}
          >
            <select
              value={topicId ?? ''}
              onChange={e => setTopicId(e.target.value ? Number(e.target.value) : null)}
              disabled={!subjectId}
              className={cn(fieldBase, !subjectId && 'opacity-35 cursor-not-allowed')}
            >
              <option value="">Nenhum</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {creatingTopic && subjectId && (
              <InlineCreate
                placeholder="Nome do tópico"
                onConfirm={handleCreateTopic}
                onCancel={() => setCreatingTopic(false)}
                isPending={createTopic.isPending}
              />
            )}
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
            <select value={targetColumnId} onChange={e => setTargetColumnId(Number(e.target.value))} className={fieldBase}>
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

        <DrawerFooter className="px-5 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={onClose} disabled={createCard.isPending}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!titleIsValid || createCard.isPending}>
              {createCard.isPending ? 'Criando...' : 'Criar card'}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
