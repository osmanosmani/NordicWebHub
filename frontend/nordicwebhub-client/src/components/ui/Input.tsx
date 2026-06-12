import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string
  label: string
  hint?: string
  error?: string
  wrapperClassName?: string
}

export function Input({
  className,
  error,
  hint,
  id,
  label,
  wrapperClassName,
  ...props
}: InputProps) {
  const descriptionId = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined

  return (
    <label className={cn('grid gap-2', wrapperClassName)} htmlFor={id}>
      <span className="form-label">
        {label}
        {props.required ? (
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </span>
      <input
        aria-describedby={descriptionId}
        aria-errormessage={error ? descriptionId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          'form-input',
          error && 'border-red-400 focus:border-red-600 focus:ring-red-100',
          className,
        )}
        id={id}
        {...props}
      />
      {error ? (
        <span className="text-sm font-medium text-red-700" id={descriptionId}>
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
