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
import { getErrorMessage } from '../utils/getErrorMessage'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    axiosClient
      .get<AuthUser>('/auth/me')
      .then((response) => {
        if (isMounted) {
          setUser(response.data)
          setError(null)
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setUser(null)
          if (!axios.isAxiosError(loadError) || loadError.response?.status !== 401) {
            setError('Could not verify your session. Please try again.')
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
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
      setError(null)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null)
        return null
      }

      setUser(null)
      setError('Could not refresh your session. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (request: LoginRequest) => {
    try {
      setError(null)
      const response = await axiosClient.post<AuthUser>('/auth/login', request)
      setUser(response.data)
      return response.data
    } catch (loginError) {
      setUser(null)
      setError(getErrorMessage(loginError, 'Login failed. Please try again.'))
      throw loginError
    }
  }, [])

  const register = useCallback(async (request: RegisterRequest) => {
    try {
      setError(null)
      const response = await axiosClient.post<AuthUser>('/auth/register', request)
      setUser(response.data)
      return response.data
    } catch (registerError) {
      setUser(null)
      setError(
        getErrorMessage(registerError, 'Registration failed. Please try again.'),
      )
      throw registerError
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout')
      setError(null)
    } finally {
      setUser(null)
      window.location.assign('/login')
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      role: user?.role ?? null,
      loading,
      error,
      login,
      register,
      logout,
      refreshUser,
      clearError,
    }),
    [clearError, error, loading, login, logout, refreshUser, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
