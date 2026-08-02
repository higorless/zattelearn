import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Network, Menu, CalendarDays, Target, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { StudyPanel } from './StudyPanel'

const nav = [
  { to: '/kanban', label: 'Kanban', icon: LayoutDashboard },
  { to: '/calendar', label: 'Semana', icon: CalendarDays },
  { to: '/subjects', label: 'Matérias', icon: BookOpen },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/zettelkasten', label: 'Zettelkasten', icon: Network },
]

export function AppLayout() {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector(s => s.ui.sidebarOpen)
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
    : user?.email.slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="flex h-screen bg-background">
      <motion.aside
        animate={{ width: sidebarOpen ? 224 : 56 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col border-r bg-sidebar overflow-hidden shrink-0"
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="shrink-0"
            aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.1, delay: 0.1 } }}
                exit={{ opacity: 0, transition: { duration: 0.07 } }}
                className="ml-2 text-xs font-medium tracking-wider uppercase whitespace-nowrap text-muted-foreground/50"
              >
                ZetteLearn
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 relative overflow-hidden transition-colors',
                    !isActive && 'text-muted-foreground hover:text-foreground font-normal',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-sidebar-primary/12"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Icon
                    className="h-4 w-4 shrink-0 relative z-10"
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.1, delay: 0.1 } }}
                        exit={{ opacity: 0, transition: { duration: 0.07 } }}
                        className="relative z-10 whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border/30 p-2 shrink-0">
          <div className="flex items-center gap-2 px-1 py-1.5">
            <div
              className="h-6 w-6 shrink-0 flex items-center justify-center text-[10px] font-bold text-white select-none"
              style={{ backgroundColor: 'oklch(0.488 0.243 264.376)' }}
            >
              {initials}
            </div>

            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.1, delay: 0.1 } }}
                  exit={{ opacity: 0, transition: { duration: 0.07 } }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-medium leading-tight truncate">{user?.name ?? user?.email}</p>
                  <p className="text-[10px] text-muted-foreground/45 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {sidebarOpen && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.1, delay: 0.1 } }}
                  exit={{ opacity: 0, transition: { duration: 0.07 } }}
                  onClick={logout}
                  className="p-1 text-muted-foreground/35 hover:text-muted-foreground hover:bg-muted transition-colors shrink-0"
                  aria-label="Sair"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main content — φ units */}
      <main className="flex flex-col overflow-hidden min-w-0" style={{ flex: 1.618 }}>
        <Outlet />
      </main>

      {/* Study panel — 1 unit (golden ratio with main) */}
      <StudyPanel />
    </div>
  )
}
