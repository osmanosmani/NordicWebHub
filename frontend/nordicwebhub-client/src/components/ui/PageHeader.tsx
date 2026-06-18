import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({
  action,
  className,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/70 bg-[#f7f3ea] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_30%)] px-5 py-5 shadow-[0_22px_70px_-52px_rgba(15,23,42,0.65)] sm:px-6 sm:py-6 lg:flex lg:items-end lg:justify-between lg:gap-6',
        className,
      )}
    >
      <div className="relative z-10 max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold text-blue-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="relative z-10 mt-5 flex shrink-0 flex-wrap items-center gap-2 lg:mt-0">
          {action}
        </div>
      ) : null}
    </header>
  )
}
