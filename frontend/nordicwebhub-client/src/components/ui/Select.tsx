import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string
  wrapperClassName?: string
}

export function Select({
  children,
  className,
  error,
  hint,
  id,
  label,
  wrapperClassName,
  ...props
}: SelectProps) {
  const descriptionId = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined

  return (
    <label className={cn('grid gap-2', wrapperClassName)} htmlFor={id}>
      <span className="form-label">{label}</span>
      <select
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'form-input appearance-none bg-[linear-gradient(45deg,transparent_50%,#64748b_50%),linear-gradient(135deg,#64748b_50%,transparent_50%)] bg-[position:calc(100%-16px)_50%,calc(100%-11px)_50%] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-10',
          error && 'border-red-400 focus:border-red-600 focus:ring-red-100',
          className,
        )}
        id={id}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-sm text-red-700" id={descriptionId}>
          {error}
        </span>
      ) : hint ? (
        <span className="text-sm text-slate-500" id={descriptionId}>
          {hint}
        </span>
      ) : null}
    </label>
  )
}
