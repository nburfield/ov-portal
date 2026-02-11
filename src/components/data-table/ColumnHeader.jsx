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
        'group relative select-none bg-gray-50 dark:bg-gray-800 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        canSort && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
      onClick={canSort ? column.getToggleSortingHandler() : undefined}
      style={{
        width: column.getSize(),
      }}
    >
      <div className="flex items-center justify-between">
        <span className="truncate">{header}</span>
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
    </th>
  )
}

export default ColumnHeader
