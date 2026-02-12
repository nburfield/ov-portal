import React, { useState, useRef, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  DocumentIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import Input from '../ui/Input'

const TableToolbar = ({ table, globalFilter, setGlobalFilter, onExportCSV, onExportPDF }) => {
  const [showColumnVisibility, setShowColumnVisibility] = useState(false)
  const [searchTerm, setSearchTerm] = useState(globalFilter ?? '')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, setGlobalFilter])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowColumnVisibility(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResetFilters = () => {
    setSearchTerm('')
    table.resetColumnFilters()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-secondary/50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-base pl-10 w-64"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {(table.getState().globalFilter || table.getState().columnFilters.length > 0) && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
            Reset
          </Button>
        )}
        {onExportCSV && (
          <Button variant="secondary" size="sm" onClick={onExportCSV}>
            <DocumentTextIcon className="h-4 w-4 mr-1.5" />
            CSV
          </Button>
        )}
        {onExportPDF && (
          <Button variant="secondary" size="sm" onClick={onExportPDF}>
            <DocumentIcon className="h-4 w-4 mr-1.5" />
            PDF
          </Button>
        )}
        <div ref={dropdownRef} className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowColumnVisibility(!showColumnVisibility)}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
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
      </div>
    </div>
  )
}

export default TableToolbar
