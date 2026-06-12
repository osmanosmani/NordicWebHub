import type { TableHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type DataTableProps = TableHTMLAttributes<HTMLTableElement> & {
  containerClassName?: string
  scrollLabel?: string
  showMobileHint?: boolean
  wrapperClassName?: string
}

export function DataTable({
  children,
  className,
  containerClassName,
  scrollLabel = 'Scrollable data table',
  showMobileHint = true,
  wrapperClassName,
  ...props
}: DataTableProps) {
  return (
    <div className={wrapperClassName}>
      {showMobileHint ? (
        <p className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 sm:hidden">
          Swipe horizontally to view all columns.
        </p>
      ) : null}
      <div
        aria-label={scrollLabel}
        className={cn(
          'w-0 min-w-full max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-100',
          containerClassName,
        )}
        role="region"
        tabIndex={0}
      >
        <table
          className={cn(
            'min-w-full divide-y divide-slate-200 text-left text-sm',
            className,
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    </div>
  )
}
