import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  action?: ReactNode
}

export function Card({
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
        'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
        className,
      )}
      {...props}
    >
      {title || description || action ? (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  )
}
