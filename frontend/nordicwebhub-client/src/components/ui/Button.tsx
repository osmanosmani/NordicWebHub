import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-700 text-white shadow-sm hover:bg-blue-800 focus-visible:ring-blue-200',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-200',
  ghost: 'text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200',
}

function getButtonClassName(variant: ButtonVariant, className?: string) {
  return cn(
    'inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    className,
  )
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName(variant, className)}
      type={type}
      {...props}
    />
  )
}

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant
}

export function ButtonLink({
  className,
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClassName(variant, className)}
      {...props}
    />
  )
}
