import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type AlertTone = 'info' | 'success' | 'warning' | 'error'

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone
  title?: string
  action?: ReactNode
}

const toneClasses: Record<AlertTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

const dotClasses: Record<AlertTone, string> = {
  error: 'bg-red-600',
  info: 'bg-blue-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
}

export function Alert({
  action,
  children,
  className,
  title,
  tone = 'info',
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-start sm:justify-between',
        toneClasses[tone],
        className,
      )}
      role={tone === 'error' ? 'alert' : 'status'}
      {...props}
    >
      <div className="flex min-w-0 gap-3">
        <span
          aria-hidden="true"
          className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', dotClasses[tone])}
        />
        <div className="min-w-0">
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={cn('leading-6', title && 'mt-0.5')}>{children}</div>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
