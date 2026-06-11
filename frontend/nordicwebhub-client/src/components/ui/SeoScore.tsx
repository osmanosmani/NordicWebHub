import { cn } from '../../utils/cn'

type SeoScoreProps = {
  score: number
  compact?: boolean
}

export function SeoScore({ compact = false, score }: SeoScoreProps) {
  const normalizedScore = Math.min(100, Math.max(0, score))
  const tone = getScoreTone(normalizedScore)

  return (
    <div className={compact ? 'w-32' : 'w-full'}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase text-slate-500">
          SEO score
        </span>
        <span
          className={cn(
            'inline-flex min-w-12 justify-center rounded-lg px-2.5 py-1 text-sm font-semibold',
            tone.badge,
          )}
        >
          {normalizedScore}
        </span>
      </div>
      <div
        aria-label={`SEO score ${normalizedScore} out of 100`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedScore}
        className="mt-2 h-2 overflow-hidden rounded bg-slate-200"
        role="progressbar"
      >
        <div
          className={cn('h-full rounded transition-all', tone.bar)}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  )
}

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      badge: 'bg-emerald-50 text-emerald-700',
      bar: 'bg-emerald-600',
    }
  }

  if (score >= 60) {
    return {
      badge: 'bg-blue-50 text-blue-700',
      bar: 'bg-blue-600',
    }
  }

  if (score >= 40) {
    return {
      badge: 'bg-amber-50 text-amber-700',
      bar: 'bg-amber-500',
    }
  }

  return {
    badge: 'bg-red-50 text-red-700',
    bar: 'bg-red-600',
  }
}
