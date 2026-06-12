import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type SectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({
  action,
  className,
  description,
  title,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-7 text-slate-950">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
