import { useState } from 'react'
import { toast } from 'sonner'
import { X, BookOpen, AlignLeft, Palette } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useCreateSubject } from '@/services/subjects'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onExited?: () => void
}

const PRESET_COLORS = [
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#a3a3a3', // neutral
]

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

export function SubjectCreateDrawer({ open, onClose, onExited }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const createSubject = useCreateSubject()

  const nameIsValid = name.trim().length > 0 && name.trim().length <= 255

  function reset() {
    setName('')
    setDescription('')
    setColor(PRESET_COLORS[0])
  }

  async function handleCreate() {
    if (!nameIsValid) return
    try {
      await createSubject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      })
      toast.success('Matéria criada')
      reset()
      onClose()
    } catch {
      toast.error('Erro ao criar matéria — tente novamente')
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={next => { if (!next) onClose() }}
      onOpenChangeComplete={next => { if (!next) { reset(); onExited?.() } }}
      swipeDirection="right"
    >
      <DrawerContent
        style={{ '--drawer-content-width': '26rem' } as React.CSSProperties}
      >
        <div className="h-0.5 shrink-0 transition-colors duration-300" style={{ backgroundColor: color }} />

        <DrawerHeader className="px-5 pt-4 pb-3 gap-1 border-b border-border/30">
          <div className="flex items-start gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={255}
              placeholder="Nome da matéria"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && nameIsValid) handleCreate() }}
              className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none leading-snug"
            />
            <DrawerClose className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
          {!nameIsValid && name.length > 255 && (
            <span className="text-xs text-destructive">Nome muito longo</span>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <FieldRow label="Cor" icon={<Palette className="h-3.5 w-3.5" />}>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-6 w-6 transition-all',
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground/60 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105',
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
              <div className="relative h-6 w-6">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  aria-label="Cor personalizada"
                />
                <div
                  className="h-6 w-6 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground/50 text-[10px] hover:border-border/100 transition-colors"
                  style={{ backgroundColor: PRESET_COLORS.includes(color) ? 'transparent' : color }}
                >
                  {PRESET_COLORS.includes(color) ? '+' : ''}
                </div>
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Descrição" icon={<AlignLeft className="h-3.5 w-3.5" />}>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Sobre esta matéria..."
              rows={4}
              className={cn(
                fieldBase,
                'font-body resize-none leading-relaxed border-b-0 border border-border/30 p-2.5 focus:border-border/60',
              )}
            />
          </FieldRow>

          <FieldRow label="Matéria" icon={<BookOpen className="h-3.5 w-3.5" />}>
            <p className="font-body text-xs text-muted-foreground/50 leading-relaxed">
              Tópicos e objetivos podem ser adicionados após criar a matéria, expandindo o card na listagem.
            </p>
          </FieldRow>
        </div>

        <DrawerFooter className="px-5 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={createSubject.isPending}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!nameIsValid || createSubject.isPending}
            >
              {createSubject.isPending ? 'Criando...' : 'Criar matéria'}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
