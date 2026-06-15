import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  action?: ReactNode
  accent?: 'blue' | 'emerald' | 'amber' | 'red'
}

export function Card({
  accent,
  action,
  children,
  className,
  description,
  title,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        accent === 'blue' && 'border-t-2 border-t-blue-600',
        accent === 'emerald' && 'border-t-2 border-t-emerald-600',
        accent === 'amber' && 'border-t-2 border-t-amber-500',
        accent === 'red' && 'border-t-2 border-t-red-600',
        className,
      )}
      {...props}
    >
      {title || description || action ? (
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-base font-semibold leading-6 text-slate-950">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
