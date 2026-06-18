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
        <p className="border-b border-slate-200 bg-[#faf7ef] px-4 py-2.5 text-xs font-medium text-slate-500 sm:hidden">
          Swipe horizontally to view all columns.
        </p>
      ) : null}
      <div
        aria-label={scrollLabel}
        className={cn(
          'w-0 min-w-full max-w-full overflow-x-auto overscroll-x-contain scrollbar-thin focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-100',
          containerClassName,
        )}
        role="region"
        tabIndex={0}
      >
        <table
          className={cn(
            'min-w-full divide-y divide-slate-200 bg-white text-left text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[#faf7ef]/70 [&_td]:leading-6 [&_th]:whitespace-nowrap [&_th]:tracking-normal',
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
