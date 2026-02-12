import React from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '../../utils/cn'

const ColumnHeader = ({ column }) => {
  const isSorted = column.getIsSorted()
  const canSort = column.getCanSort()

  const header = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id

  return (
    <th
      scope="col"
      className={cn(
        'group relative select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary',
        canSort && 'cursor-pointer hover:bg-bg-hover/50 transition-colors'
      )}
      onClick={canSort ? column.getToggleSortingHandler() : undefined}
      style={{
        width: column.getSize(),
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate">{header}</span>
        {canSort && (
          <div className="flex flex-col items-center">
            <ChevronUpIcon
              className={cn(
                'h-3 w-3 -mb-0.5 transition-colors',
                isSorted === 'asc'
                  ? 'text-accent'
                  : 'text-text-muted group-hover:text-text-tertiary'
              )}
            />
            <ChevronDownIcon
              className={cn(
                'h-3 w-3 -mt-0.5 transition-colors',
                isSorted === 'desc'
                  ? 'text-accent'
                  : 'text-text-muted group-hover:text-text-tertiary'
              )}
            />
          </div>
        )}
      </div>
      {canSort && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-0.5 bg-accent opacity-0 transition-opacity',
            isSorted && 'opacity-100'
          )}
        />
      )}
    </th>
  )
}

export default ColumnHeader
