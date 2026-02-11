import React from 'react'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'

const BulkActions = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  children,
  className,
}) => {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
        className
      )}
    >
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onSelectAll}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
        >
          Select all ({totalCount})
        </button>
        <button
          onClick={onClearSelection}
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
        >
          Clear selection
        </button>
      </div>
      <div className="flex items-center space-x-2">{children}</div>
    </div>
  )
}

export default BulkActions
