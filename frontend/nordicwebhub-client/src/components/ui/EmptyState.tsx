import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description: string
  action?: ReactNode
  icon?: ReactNode
  compact?: boolean
}

export function EmptyState({
  action,
  className,
  compact = false,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-5 py-8' : 'px-6 py-12',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
          {icon}
        </div>
      ) : null}
      {title ? (
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      ) : null}
      <p
        className={cn(
          'max-w-md text-sm leading-6 text-slate-500',
          title && 'mt-1',
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
