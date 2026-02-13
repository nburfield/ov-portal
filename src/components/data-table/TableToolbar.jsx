import React, { useState, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import ColumnVisibilityDropdown from './ColumnVisibilityDropdown'

const TableToolbar = ({
  table,
  globalFilter,
  setGlobalFilter,
  onExportCSV,
  onExportPDF,
  hideSearch = false,
  hideExport = false,
  hideColumns = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(globalFilter ?? '')

  useEffect(() => {
    if (hideSearch) return
    const timer = setTimeout(() => {
      setGlobalFilter(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, setGlobalFilter, hideSearch])

  const handleResetFilters = () => {
    setSearchTerm('')
    table.resetColumnFilters()
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-secondary/50">
      <div className="flex items-center gap-3">
        {!hideSearch && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              data-testid="table-search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base pl-10 w-64"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!hideSearch &&
          (table.getState().globalFilter || table.getState().columnFilters.length > 0) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              <ArrowPathIcon className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
          )}
        {!hideExport && onExportCSV && (
          <Button variant="secondary" size="sm" onClick={onExportCSV} data-testid="export-csv">
            <DocumentTextIcon className="h-4 w-4 mr-1.5" />
            CSV
          </Button>
        )}
        {!hideExport && onExportPDF && (
          <Button variant="secondary" size="sm" onClick={onExportPDF} data-testid="export-pdf">
            <DocumentIcon className="h-4 w-4 mr-1.5" />
            PDF
          </Button>
        )}
        {!hideColumns && <ColumnVisibilityDropdown table={table} />}
      </div>
    </div>
  )
}

export default TableToolbar
