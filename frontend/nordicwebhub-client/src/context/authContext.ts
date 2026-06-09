import { createContext } from 'react'
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth'

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  role: string | null
  loading: boolean
  error: string | null
  login: (request: LoginRequest) => Promise<AuthUser>
  register: (request: RegisterRequest) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
