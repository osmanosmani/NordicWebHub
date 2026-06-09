import axios from 'axios'
import type { ApiErrorResponse } from '../types/api'

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage
  }

  const response = error.response?.data
  if (response?.message) {
    return response.message
  }

  if (Array.isArray(response?.errors) && response.errors.length > 0) {
    return response.errors[0]
  }

  return fallbackMessage
}
