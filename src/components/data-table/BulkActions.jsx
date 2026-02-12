import React from 'react'
import { cn } from '../../utils/cn'
import Button from '../ui/Button'
import { CheckBadgeIcon } from '@heroicons/react/24/outline'

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
        'flex items-center justify-between px-4 py-3 border-b border-border bg-accent-light/30 dark:bg-accent-muted/20 rounded-t-xl',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-text-primary">
            {selectedCount === 1 ? 'item selected' : 'items selected'}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <button
          onClick={onSelectAll}
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          Select all ({totalCount})
        </button>
        <button
          onClick={onClearSelection}
          className="text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

export default BulkActions
