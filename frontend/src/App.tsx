import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { store } from '@/store'
import { useAppSelector } from '@/store/hooks'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { KanbanPage } from '@/features/kanban/KanbanPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { SubjectsPage } from '@/features/subjects/SubjectsPage'
import { ZettelkastenPage } from '@/features/zettelkasten/ZettelkastenPage'
import { StudyPage } from '@/features/study-sessions/StudyPage'
import { MetasPage } from '@/features/metas/MetasPage'

function ThemeSync() {
  const theme = useAppSelector(s => s.ui.theme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      root.classList.toggle('dark', mq.matches)
      const handler = (e: MediaQueryListEvent) => root.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])
  return null
}

function ProtectedRoute() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
      </div>
    )
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeSync />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{ className: 'font-sans text-sm' }}
        />
        <TooltipProvider delay={400}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Navigate to="/kanban" replace />} />
                  <Route path="kanban" element={<KanbanPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="subjects" element={<SubjectsPage />} />
                  <Route path="zettelkasten" element={<ZettelkastenPage />} />
                  <Route path="metas" element={<MetasPage />} />
                </Route>
                <Route path="/study/:cardId" element={<StudyPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  )
}
