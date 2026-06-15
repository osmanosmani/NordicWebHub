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
    <Alert
      action={action}
      aria-live="polite"
      className={className}
      title={title}
      tone="error"
    >
      {message}
    </Alert>
  )
}
