import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network, Plus, Search, Tag, X, Trash2, Check, Loader2, PenLine, AlignLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Drawer, DrawerContent, DrawerClose, DrawerHeader, DrawerFooter,
} from '@/components/ui/drawer'
import { useZettelNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/services/zettelkasten'
import type { ZettelNote } from '@/types'
import { cn } from '@/lib/utils'

// ─── Note Drawer ────────────────────────────────────────────────────────────

interface DrawerProps {
  note: ZettelNote | null
  open: boolean
  onClose: () => void
}

function NoteDrawer({ note, open, onClose }: DrawerProps) {
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  function reset(n: ZettelNote | null) {
    setMode('view')
    setTitle(n?.title ?? '')
    setContent(n?.content ?? '')
    setTags(n?.tags ?? [])
    setTagInput('')
    setDeleteConfirm(false)
  }

  const isDirty = note
    ? title.trim() !== note.title ||
      content.trim() !== note.content ||
      JSON.stringify(tags) !== JSON.stringify(note.tags)
    : false

  async function handleSave() {
    if (!note || !title.trim() || !content.trim()) return
    try {
      await updateNote.mutateAsync({ id: note.id, title: title.trim(), content: content.trim(), tags })
      toast.success('Nota salva')
      setMode('view')
    } catch {
      toast.error('Erro ao salvar nota')
    }
  }

  async function handleDelete() {
    if (!note) return
    try {
      await deleteNote.mutateAsync(note.id)
      toast.success('Nota excluída')
      onClose()
    } catch {
      toast.error('Erro ao excluir nota')
    }
  }

  function addTag(value: string) {
    const t = value.trim().replace(/,$/, '')
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  return (
    <Drawer
      open={open}
      onOpenChange={next => { if (!next) onClose() }}
      onOpenChangeComplete={next => { if (!next) reset(null) }}
      swipeDirection="right"
    >
      <DrawerContent style={{ '--drawer-content-width': '30rem' } as React.CSSProperties}>
        <DrawerHeader className="px-5 pt-4 pb-3 border-b border-border/30 gap-0">
          <div className="flex items-start gap-2">
            {mode === 'edit' ? (
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={255}
                placeholder="Título da nota"
                className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none leading-snug"
              />
            ) : (
              <span className="flex-1 text-base font-semibold leading-snug">{note?.title}</span>
            )}
            <DrawerClose className="rounded p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
          {(note?.tags ?? []).length > 0 && mode === 'view' && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(note?.tags ?? []).map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted/40 border border-border/40 text-muted-foreground/70">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </DrawerHeader>

        {mode === 'view' ? (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {note?.content ? (
              <p className="text-sm font-body text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground/30">
                <AlignLeft className="h-3.5 w-3.5" />
                <span className="text-xs font-body italic">Sem conteúdo</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Conteúdo
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Conteúdo da nota..."
                rows={8}
                autoFocus
                className="w-full bg-muted/20 border border-border/30 p-2.5 text-sm font-body leading-relaxed resize-none outline-none focus:border-border/60 transition-colors placeholder:text-muted-foreground/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Tags
              </label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted/40 border border-border/40 text-muted-foreground/70">
                      {tag}
                      <button
                        onClick={() => setTags(t => t.filter(x => x !== tag))}
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
                    addTag(tagInput)
                  }
                  if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                    setTags(t => t.slice(0, -1))
                  }
                }}
                placeholder={tags.length === 0 ? 'Adicionar tag… (Enter ou vírgula)' : 'Nova tag…'}
                className="w-full bg-transparent text-[11px] border-b border-border/30 pb-1 outline-none placeholder:text-muted-foreground/35 focus:border-border/60 transition-colors"
              />
            </div>
          </div>
        )}

        <DrawerFooter className="px-5 pt-3 border-t border-border/30">
          {mode === 'view' ? (
            <div className="flex items-center gap-2">
              {!deleteConfirm ? (
                <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)} disabled={deleteNote.isPending} className="gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteNote.isPending}>
                    {deleteNote.isPending ? 'Excluindo...' : 'Confirmar exclusão'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)} disabled={deleteNote.isPending}>
                    Cancelar
                  </Button>
                </div>
              )}
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => setMode('edit')} className="gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                Editar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => { setMode('view'); reset(note) }} disabled={updateNote.isPending}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!isDirty || !title.trim() || !content.trim() || updateNote.isPending}>
                {updateNote.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ─── Create Note Drawer ──────────────────────────────────────────────────────

function CreateNoteDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createNote = useCreateNote()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  function reset() {
    setTitle('')
    setContent('')
    setTags([])
    setTagInput('')
  }

  async function handleCreate() {
    if (!title.trim() || !content.trim()) return
    try {
      await createNote.mutateAsync({ title: title.trim(), content: content.trim(), tags })
      toast.success('Nota criada')
      reset()
      onClose()
    } catch {
      toast.error('Erro ao criar nota')
    }
  }

  function addTag(value: string) {
    const t = value.trim().replace(/,$/, '')
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  return (
    <Drawer
      open={open}
      onOpenChange={next => { if (!next) onClose() }}
      onOpenChangeComplete={next => { if (!next) reset() }}
      swipeDirection="right"
    >
      <DrawerContent style={{ '--drawer-content-width': '30rem' } as React.CSSProperties}>
        <DrawerHeader className="px-5 pt-4 pb-3 border-b border-border/30 gap-0">
          <div className="flex items-start gap-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Título da nota"
              autoFocus
              className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none leading-snug"
            />
            <DrawerClose className="rounded p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors mt-0.5 shrink-0">
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Conteúdo
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="O que você aprendeu ou quer registrar?"
              rows={8}
              className="w-full bg-muted/20 border border-border/30 p-2.5 text-sm font-body leading-relaxed resize-none outline-none focus:border-border/60 transition-colors placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Tags
            </label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted/40 border border-border/40 text-muted-foreground/70">
                    {tag}
                    <button
                      onClick={() => setTags(t => t.filter(x => x !== tag))}
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
                  addTag(tagInput)
                }
                if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                  setTags(t => t.slice(0, -1))
                }
              }}
              placeholder={tags.length === 0 ? 'Adicionar tag… (Enter ou vírgula)' : 'Nova tag…'}
              className="w-full bg-transparent text-[11px] border-b border-border/30 pb-1 outline-none placeholder:text-muted-foreground/35 focus:border-border/60 transition-colors"
            />
          </div>
        </div>

        <DrawerFooter className="px-5 pt-3 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="flex-1" />
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">Cancelar</Button>
            </DrawerClose>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!title.trim() || !content.trim() || createNote.isPending}
              className="gap-1.5"
            >
              {createNote.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Criar nota
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ─── Note Card ───────────────────────────────────────────────────────────────

function NoteCard({ note, onClick }: { note: ZettelNote; onClick: () => void }) {
  const tags = Array.isArray(note.tags) ? note.tags : []

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="w-full text-left border border-border/40 bg-card p-4 space-y-2.5 hover:border-border/70 hover:bg-card/80 transition-colors"
    >
      <p className="text-sm font-semibold leading-snug line-clamp-2">{note.title}</p>
      <p className="text-xs font-body text-muted-foreground/60 leading-relaxed line-clamp-3">
        {note.content}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted/40 border border-border/30 text-muted-foreground/60">
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/35 tabular-nums">
        {new Date(note.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </motion.button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ZettelkastenPage() {
  const { data: notes = [], isLoading, isError, refetch } = useZettelNotes()

  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<ZettelNote | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const allTags = useMemo(() => {
    const set = new Set<string>()
    notes.forEach(n => (Array.isArray(n.tags) ? n.tags : []).forEach(t => set.add(t)))
    return [...set].sort()
  }, [notes])

  const filtered = useMemo(() => {
    let list = notes
    if (activeTag) list = list.filter(n => (Array.isArray(n.tags) ? n.tags : []).includes(activeTag))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (Array.isArray(n.tags) ? n.tags : []).some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [notes, activeTag, search])

  return (
    <div className="flex flex-1 flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 shrink-0">
        <Network className="h-4 w-4" />
        <h1 className="font-display text-xl font-normal">Zettelkasten</h1>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1.5 h-7 text-xs px-3">
          <Plus className="h-3 w-3" />
          Nova nota
        </Button>
      </div>

      {/* Search + tag filters */}
      <div className="px-4 pb-3 space-y-2 shrink-0">
        <div className="flex items-center gap-2 border border-border/40 bg-muted/20 px-2.5 h-8">
          <Search className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar notas…"
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/40 text-foreground"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground/40 hover:text-foreground transition-colors">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(t => t === tag ? null : tag)}
                className={cn(
                  'flex items-center gap-1 text-[10px] px-1.5 py-0.5 border transition-colors',
                  activeTag === tag
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-muted/20 border-border/40 text-muted-foreground/60 hover:border-border/70 hover:text-muted-foreground'
                )}
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <p className="text-sm">Não foi possível carregar as notas.</p>
            <button onClick={() => refetch()} className="text-xs underline underline-offset-4 hover:text-foreground transition-colors">
              Tentar novamente
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
            <Network className="h-8 w-8 opacity-20" />
            {notes.length === 0 ? (
              <>
                <p className="text-sm">Nenhuma nota ainda.</p>
                <p className="text-xs text-muted-foreground/60">Crie uma nota manualmente ou finalize uma sessão de estudo.</p>
              </>
            ) : (
              <p className="text-sm">Nenhuma nota encontrada para esse filtro.</p>
            )}
          </div>
        ) : (
          <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map(n => (
                <NoteCard key={n.id} note={n} onClick={() => setSelectedNote(n)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <NoteDrawer
        note={selectedNote}
        open={!!selectedNote}
        onClose={() => setSelectedNote(null)}
      />
      <CreateNoteDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
