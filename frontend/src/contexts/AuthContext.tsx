import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/services/api'
import { queryClient } from '@/lib/queryClient'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('auth_token'))

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) return

    api.get<User>('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('auth_token')
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('auth_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('auth_token')
    queryClient.clear()
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
