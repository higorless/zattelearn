import axios from 'axios'
import { keysToCamel, keysToSnake } from '@/lib/caseTransform'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data) config.data = keysToSnake(config.data)
  return config
})

api.interceptors.response.use(
  res => {
    if (res.data) res.data = keysToCamel(res.data)
    return res
  },
  err => {
    if (err?.response?.status === 401 && localStorage.getItem('auth_token')) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    console.error('[API]', err?.response?.data ?? err.message)
    return Promise.reject(err)
  },
)
