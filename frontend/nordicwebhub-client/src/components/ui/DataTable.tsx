import type { TableHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type DataTableProps = TableHTMLAttributes<HTMLTableElement> & {
  containerClassName?: string
}

export function DataTable({
  children,
  className,
  containerClassName,
  ...props
}: DataTableProps) {
  return (
    <div className={cn('overflow-x-auto', containerClassName)}>
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
  )
}
