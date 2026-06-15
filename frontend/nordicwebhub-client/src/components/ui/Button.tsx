import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { LoadingSpinner } from './LoadingSpinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingLabel?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-blue-600 bg-blue-600 text-white shadow-sm hover:border-blue-700 hover:bg-blue-700 active:border-blue-800 active:bg-blue-800 focus-visible:ring-blue-200',
  secondary:
    'border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 focus-visible:ring-slate-200',
  ghost:
    'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200 focus-visible:ring-slate-200',
  danger:
    'border border-red-600 bg-red-600 text-white shadow-sm hover:border-red-700 hover:bg-red-700 active:border-red-800 active:bg-red-800 focus-visible:ring-red-200',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 gap-2 px-3 text-sm',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2.5 px-5 text-base',
}

function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-semibold transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}

export function Button({
  className,
  disabled,
  isLoading = false,
  leadingIcon,
  loadingLabel = 'Loading',
  size = 'md',
  trailingIcon,
  variant = 'primary',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={getButtonClassName(variant, size, className)}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="text-current" size="sm" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {leadingIcon ? (
            <span aria-hidden="true" className="shrink-0">
              {leadingIcon}
            </span>
          ) : null}
          {children}
          {trailingIcon ? (
            <span aria-hidden="true" className="shrink-0">
              {trailingIcon}
            </span>
          ) : null}
        </>
      )}
    </button>
  )
}

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function ButtonLink({
  className,
  leadingIcon,
  size = 'md',
  trailingIcon,
  variant = 'primary',
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={getButtonClassName(variant, size, className)} {...props}>
      {leadingIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {leadingIcon}
        </span>
      ) : null}
      {children}
      {trailingIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {trailingIcon}
        </span>
      ) : null}
    </Link>
  )
}
