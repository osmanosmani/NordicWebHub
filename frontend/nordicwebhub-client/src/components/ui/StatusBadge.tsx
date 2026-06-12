import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  label: string
  tone?: 'blue' | 'emerald' | 'amber' | 'red' | 'slate'
  showDot?: boolean
}

const toneClasses: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  slate: 'border-slate-200 bg-slate-100 text-slate-700',
}

const dotClasses: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  amber: 'bg-amber-500',
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-600',
  red: 'bg-red-600',
  slate: 'bg-slate-500',
}

export function StatusBadge({
  className,
  label,
  showDot = false,
  tone = 'slate',
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {showDot ? (
        <span
          aria-hidden="true"
          className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])}
        />
      ) : null}
      {label}
    </span>
  )
}
