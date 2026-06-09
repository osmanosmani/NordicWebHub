import { cn } from '../../utils/cn'

type StatusBadgeProps = {
  label: string
  tone?: 'blue' | 'emerald' | 'amber' | 'red' | 'slate'
}

const toneClasses: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-slate-100 text-slate-600',
}

export function StatusBadge({ label, tone = 'slate' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  )
}
