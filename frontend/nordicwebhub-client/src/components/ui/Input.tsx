import { CircleAlert } from 'lucide-react'
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
      <span className="text-sm font-semibold leading-5 text-slate-700">
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
          'form-input transition-[border-color,box-shadow,background-color]',
          error && 'border-red-400 focus:border-red-600 focus:ring-red-100',
          className,
        )}
        id={id}
        {...props}
      />
      {error ? (
        <span
          className="flex items-start gap-1.5 text-sm font-medium leading-5 text-red-700"
          id={descriptionId}
        >
          <CircleAlert
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span>{error}</span>
        </span>
      ) : hint ? (
        <span className="text-sm leading-5 text-slate-500" id={descriptionId}>
          {hint}
        </span>
      ) : null}
    </label>
  )
}
