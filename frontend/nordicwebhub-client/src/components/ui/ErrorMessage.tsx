import type { ReactNode } from 'react'
import { Alert } from './Alert'

type ErrorMessageProps = {
  message: string
  title?: string
  action?: ReactNode
  className?: string
}

export function ErrorMessage({
  action,
  className,
  message,
  title,
}: ErrorMessageProps) {
  return (
    <Alert action={action} className={className} title={title} tone="error">
      {message}
    </Alert>
  )
}
