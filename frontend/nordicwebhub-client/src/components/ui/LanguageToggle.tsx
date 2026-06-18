import type { Language } from '../../context/languageContext'
import { useLanguage } from '../../context/useLanguage'
import { cn } from '../../utils/cn'

type LanguageToggleProps = {
  inverted?: boolean
  compact?: boolean
}

const options: Array<{ label: string; value: Language }> = [
  { label: 'EN', value: 'en' },
  { label: 'SV', value: 'sv' },
]

export function LanguageToggle({
  compact = false,
  inverted = false,
}: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      aria-label="Language selector"
      className={cn(
        'inline-flex items-center rounded-full border p-1',
        inverted
          ? 'border-white/15 bg-white/[0.08]'
          : 'border-slate-200 bg-white shadow-sm',
      )}
      role="group"
    >
      {options.map((option) => {
        const isActive = language === option.value

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              'rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-4',
              compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1 text-xs',
              inverted
                ? 'text-slate-300 hover:bg-white/10 hover:text-white focus-visible:ring-cyan-300/20'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-blue-100',
              isActive &&
                (inverted
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'bg-blue-600 text-white shadow-sm hover:bg-blue-600 hover:text-white'),
            )}
            key={option.value}
            onClick={() => setLanguage(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
