import { useZettelNotes } from '@/services/zettelkasten'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Network, Tag } from 'lucide-react'
import type { ZettelNote } from '@/types'

function NoteCard({ note }: { note: ZettelNote }) {
  const tags = Array.isArray(note.tags) ? note.tags : (note.tags as unknown as string)?.split(',').filter(Boolean) ?? []

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{note.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-4">{note.content}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs gap-1">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {note.links?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {note.links.length} conexão{note.links.length !== 1 ? 'ões' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function ZettelkastenPage() {
  const { data: notes = [], isLoading, isError, refetch } = useZettelNotes()

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 overflow-auto">
      <div className="flex items-center gap-2">
        <Network className="h-4 w-4" />
        <h1 className="font-display text-xl font-normal">Zettelkasten</h1>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1 py-20 text-muted-foreground">
          <p className="text-sm">Não foi possível carregar as notas.</p>
          <button onClick={() => refetch()} className="text-xs underline underline-offset-4 hover:text-foreground transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
          <Network className="h-10 w-10 opacity-30" />
          <p>Nenhuma nota criada ainda.</p>
          <p className="text-xs">Finalize uma sessão de estudo para gerar notas automaticamente.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map(n => <NoteCard key={n.id} note={n} />)}
        </div>
      )}
    </div>
  )
}
