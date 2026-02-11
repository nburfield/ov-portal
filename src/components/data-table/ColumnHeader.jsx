import React from 'react'
import { flexRender } from '@tanstack/react-table'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '../../utils/cn'

const ColumnHeader = ({ header }) => {
  const { column } = header

  const isSorted = column.getIsSorted()
  const canSort = column.getCanSort()

  return (
    <th
      scope="col"
      className={cn(
        'group relative select-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        canSort && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
        column.getIsResizing() && 'bg-blue-50 dark:bg-blue-900/20'
      )}
      onClick={canSort ? column.getToggleSortingHandler() : undefined}
      style={{
        width: column.getSize(),
      }}
    >
      <div className="flex items-center justify-between">
        <span className="truncate">
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>
        {canSort && (
          <div className="ml-2 flex flex-col">
            <ChevronUpIcon
              className={cn(
                'h-3 w-3',
                isSorted === 'asc' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
              )}
            />
            <ChevronDownIcon
              className={cn(
                'h-3 w-3 -mt-1',
                isSorted === 'desc' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
              )}
            />
          </div>
        )}
      </div>
      {column.getCanResize() && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cn(
            'absolute right-0 top-0 h-full w-1 cursor-col-resize bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100',
            column.getIsResizing() && 'bg-blue-500 opacity-100'
          )}
        />
      )}
    </th>
  )
}

export default ColumnHeader
