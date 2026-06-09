import axios from 'axios'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { axiosClient } from '../api/axiosClient'
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    axiosClient
      .get<AuthUser>('/auth/me')
      .then((response) => {
        if (isMounted) {
          setUser(response.data)
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await axiosClient.get<AuthUser>('/auth/me')
      setUser(response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null)
        return null
      }

      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    const response = await axiosClient.post<AuthUser>('/auth/login', request)
    setUser(response.data)
    return response.data
  }, [])

  const register = useCallback(async (request: RegisterRequest) => {
    const response = await axiosClient.post<AuthUser>('/auth/register', request)
    setUser(response.data)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
