import { cn } from '../../utils/cn'

type LoadingSpinnerProps = {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

export function LoadingSpinner({
  className,
  label = 'Loading',
  size = 'md',
}: LoadingSpinnerProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        className,
      )}
      role="status"
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block animate-spin rounded-full border-current border-r-transparent',
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
