import React, { useState, useRef, useEffect } from 'react'
import { AdjustmentsHorizontalIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'

/**
 * Dropdown to toggle column visibility. Used in TableToolbar and DataTableFilterBar.
 */
const ColumnVisibilityDropdown = ({
  table,
  className = '',
  size = 'sm',
  variant = 'secondary',
  buttonClassName,
}) => {
  const [showColumnVisibility, setShowColumnVisibility] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowColumnVisibility(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative ${className}`.trim()}>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowColumnVisibility(!showColumnVisibility)}
        className={cn(buttonClassName)}
        data-testid="table-columns-toggle"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        Columns
      </Button>
      {showColumnVisibility && (
        <div className="dropdown-menu right-0 w-56 p-2 animate-scale-in">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <FunnelIcon className="h-4 w-4 text-text-tertiary" />
            <span className="text-sm font-medium text-text-primary">Visible Columns</span>
          </div>
          <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
            {table.getAllColumns().map((column) => {
              if (column.id === 'select') return null
              return (
                <label
                  key={column.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="rounded border-border text-accent focus:ring-accent/20"
                  />
                  <span className="text-sm text-text-secondary">
                    {typeof column.columnDef.header === 'string'
                      ? column.columnDef.header
                      : column.id}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ColumnVisibilityDropdown
