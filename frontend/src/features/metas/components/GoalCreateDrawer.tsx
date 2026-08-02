import { useState } from 'react'
import { toast } from 'sonner'
import { X, Target, Clock, CalendarDays, BookOpen, Hash } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useCreateGoal } from '@/services/goals'
import { useSubjects, useTopics } from '@/services/subjects'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const fieldBase =
  'w-full bg-transparent text-sm text-foreground border-b border-border/40 pb-1.5 pt-0.5 outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/40'

function FieldRow({
  label,
  icon,
  children,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
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

export function GoalCreateDrawer({ open, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState<number | ''>('')
  const [topicId, setTopicId] = useState<number | ''>('')
  const [targetHours, setTargetHours] = useState('')
  const [deadline, setDeadline] = useState('')

  const { data: subjects = [] } = useSubjects()
  const { data: topics = [] } = useTopics(subjectId as number)
  const createGoal = useCreateGoal()

  const selectedSubject = subjects.find(s => s.id === subjectId)
  const accentColor = selectedSubject?.color ?? 'hsl(var(--primary))'

  const isValid = title.trim().length > 0 && subjectId !== '' && Number(targetHours) > 0

  function reset() {
    setTitle('')
    setSubjectId('')
    setTopicId('')
    setTargetHours('')
    setDeadline('')
  }

  async function handleCreate() {
    if (!isValid) return
    try {
      await createGoal.mutateAsync({
        title: title.trim(),
        subject_id: subjectId as number,
        topic_id: topicId !== '' ? (topicId as number) : undefined,
        target_hours: Number(targetHours),
        deadline: deadline || undefined,
      })
      toast.success('Meta criada')
      reset()
      onClose()
    } catch {
      toast.error('Erro ao criar meta — tente novamente')
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={next => { if (!next) onClose() }}
      onOpenChangeComplete={next => { if (!next) reset() }}
      swipeDirection="right"
    >
      <DrawerContent style={{ '--drawer-content-width': '26rem' } as React.CSSProperties}>
        <div className="h-0.5 shrink-0 transition-colors duration-300" style={{ backgroundColor: accentColor }} />

        <DrawerHeader className="px-5 pt-4 pb-3 gap-1 border-b border-border/30">
          <div className="flex items-start gap-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Título da meta"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && isValid) handleCreate() }}
              className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none leading-snug"
            />
            <DrawerClose className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <FieldRow label="Matéria" icon={<BookOpen className="h-3.5 w-3.5" />}>
            <select
              value={subjectId}
              onChange={e => {
                setSubjectId(e.target.value ? Number(e.target.value) : '')
                setTopicId('')
              }}
              className={cn(fieldBase, 'cursor-pointer')}
            >
              <option value="">Selecionar matéria...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </FieldRow>

          {subjectId !== '' && topics.length > 0 && (
            <FieldRow label="Tópico (opcional)" icon={<Hash className="h-3.5 w-3.5" />}>
              <select
                value={topicId}
                onChange={e => setTopicId(e.target.value ? Number(e.target.value) : '')}
                className={cn(fieldBase, 'cursor-pointer')}
              >
                <option value="">Qualquer tópico</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </FieldRow>
          )}

          <FieldRow label="Meta de horas" icon={<Clock className="h-3.5 w-3.5" />}>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={targetHours}
                onChange={e => setTargetHours(e.target.value)}
                placeholder="Ex: 20"
                className={cn(fieldBase, 'w-28')}
              />
              <span className="text-xs text-muted-foreground/50">horas</span>
            </div>
          </FieldRow>

          <FieldRow label="Prazo (opcional)" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className={cn(fieldBase, 'cursor-pointer')}
            />
          </FieldRow>
        </div>

        <DrawerFooter className="px-5 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/40">
              {targetHours ? `${targetHours}h de estudo` : 'Defina sua meta de horas'}
            </span>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={onClose} disabled={createGoal.isPending}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!isValid || createGoal.isPending}>
              {createGoal.isPending ? 'Criando...' : 'Criar meta'}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
