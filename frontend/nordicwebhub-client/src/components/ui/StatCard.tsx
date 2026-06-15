import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Card } from './Card'

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  value: ReactNode
  detail?: ReactNode
  icon?: ReactNode
  tone?: 'blue' | 'emerald' | 'amber' | 'slate'
}

const iconToneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  slate: 'border-slate-200 bg-slate-100 text-slate-600',
}

export function StatCard({
  className,
  detail,
  icon,
  label,
  tone = 'blue',
  value,
  ...props
}: StatCardProps) {
  return (
    <Card
      className={cn('p-5 sm:p-6', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold leading-none text-slate-950 sm:text-3xl">
            {value}
          </p>
          {detail ? (
            <div className="mt-2 text-xs font-medium leading-5 text-slate-500">
              {detail}
            </div>
          ) : null}
        </div>
        {icon ? (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border [&>svg]:h-5 [&>svg]:w-5',
              iconToneClasses[tone],
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
