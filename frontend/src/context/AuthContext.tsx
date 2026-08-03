import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest } from '../api/client'
import type { AuthResult, User } from '../types/user'

interface RegisterInput {
  fullName: string
  birthDate: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'uss_token'
const USER_KEY = 'uss_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const persist = (nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  const login = async (input: LoginInput) => {
    setIsLoading(true)
    try {
      const result = await apiRequest<AuthResult>('/api/users/login', {
        method: 'POST',
        body: input,
      })
      persist(result.token, result.user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (input: RegisterInput) => {
    setIsLoading(true)
    try {
      const result = await apiRequest<AuthResult>('/api/users/register', {
        method: 'POST',
        body: input,
      })
      persist(result.token, result.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!token || !user) return
    try {
      const result = await apiRequest<{ user: User }>(`/api/users/${user.id}`, { token })
      setUser(result.user)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
    } catch {
      logout()
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshUser()
  }, [])

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout, refreshUser }),
    [user, token, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
