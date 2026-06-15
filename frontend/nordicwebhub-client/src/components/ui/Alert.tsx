import type { ComponentType, HTMLAttributes, ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
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

const iconClasses: Record<AlertTone, string> = {
  error: 'text-red-600',
  info: 'text-blue-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
}

const toneIcons: Record<AlertTone, ComponentType<{ className?: string }>> = {
  error: CircleAlert,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
}

export function Alert({
  action,
  children,
  className,
  title,
  tone = 'info',
  ...props
}: AlertProps) {
  const ToneIcon = toneIcons[tone]

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-4 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:flex-row sm:items-start sm:justify-between',
        toneClasses[tone],
        className,
      )}
      role={tone === 'error' ? 'alert' : 'status'}
      {...props}
    >
      <div className="flex min-w-0 gap-3">
        <ToneIcon
          aria-hidden="true"
          className={cn('mt-0.5 h-5 w-5 shrink-0', iconClasses[tone])}
        />
        <div className="min-w-0">
          {title ? <p className="font-semibold">{title}</p> : null}
          <div className={cn('leading-6', title && 'mt-1')}>{children}</div>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
