import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface User {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
}

interface AuthResponse {
  token: string
  user: User
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
}

export interface SignupData {
  first_name: string
  last_name: string
  email: string
  password: string
}

const TOKEN_KEY = 'cc_token'
const AuthContext = createContext<AuthContextValue | null>(null)

/** Pull a human-readable message out of FastAPI's error shapes. */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      return String(body.detail[0].msg).replace(/^Value error, /, '')
    }
  } catch {
    /* ignore */
  }
  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On load (or token change), confirm the token is still valid.
  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    let active = true
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((u: User) => active && setUser(u))
      .catch(() => {
        if (active) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [token])

  const apply = useCallback((data: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error(await errorMessage(res, 'Could not log in.'))
      apply(await res.json())
    },
    [apply],
  )

  const signup = useCallback(
    async (data: SignupData) => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await errorMessage(res, 'Could not create account.'))
      apply(await res.json())
    },
    [apply],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  )
  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
