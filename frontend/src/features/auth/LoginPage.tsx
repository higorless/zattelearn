import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const fieldBase =
  'w-full bg-transparent text-sm text-foreground border-b border-border/40 pb-1.5 pt-0.5 outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/30'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsPending(true)
    try {
      await login(email.trim(), password)
      navigate('/kanban', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Email ou senha incorretos')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-80 space-y-10"
      >
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl tracking-tight">ZetteLearn</h1>
          <p className="text-xs text-muted-foreground/50">Sistema operacional de aprendizado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/55">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoFocus
              required
              className={fieldBase}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/55">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e) }}
              className={fieldBase}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            className="w-full h-9"
            disabled={isPending || !email || !password}
          >
            {isPending
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Entrando...</>
              : 'Entrar'
            }
          </Button>
        </form>

        <p className="text-xs text-muted-foreground/45 text-center">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-muted-foreground/70 hover:text-foreground underline underline-offset-4 transition-colors">
            Criar conta
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
