import axios from 'axios'
import type { ApiErrorResponse } from '../types/api'

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage
  }

  const response = error.response?.data
  if (response?.message) {
    return response.message
  }

  const validationMessages = getValidationMessages(response?.errors)
  if (validationMessages.length > 0) {
    return validationMessages.join(' ')
  }

  if (response?.detail) {
    return response.detail
  }

  if (response?.title && response.title !== 'One or more validation errors occurred.') {
    return response.title
  }

  return fallbackMessage
}

function getValidationMessages(
  errors: ApiErrorResponse['errors'],
): string[] {
  if (!errors) {
    return []
  }

  const messages = Array.isArray(errors)
    ? errors
    : Object.values(errors).flatMap((value) =>
        Array.isArray(value) ? value : [value],
      )

  return [...new Set(messages.map((message) => message.trim()).filter(Boolean))]
}
