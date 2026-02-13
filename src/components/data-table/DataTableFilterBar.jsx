import React, { useState, useRef, useEffect } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Button } from '../ui/Button'
import ColumnVisibilityDropdown from './ColumnVisibilityDropdown'
import ExportButton from './ExportButton'

/**
 * Reusable filter bar for DataTable. Renders search input, optional advanced
 * filters in a dropdown, Clear, Export CSV, Export PDF, and optional Columns visibility. All state is
 * controlled by the parent (per-page).
 *
 * @param {string} searchPlaceholder - Placeholder for the search input
 * @param {string} searchValue - Controlled search input value
 * @param {function} onSearchChange - (e) => void
 * @param {Array<{ id: string, label: string, value: string, onChange: function, options: Array<{ value: string, label: string }> }>} advancedFilters - Optional select filters
 * @param {function} onClearFilters - Called when Clear is clicked
 * @param {boolean} hasActiveFilters - Enables Clear and drives badge count
 * @param {function} [onExportCSV] - Optional CSV export handler
 * @param {function} [onExportPDF] - Optional PDF export handler
 * @param {object} [table] - TanStack Table instance; when provided, renders Columns visibility button next to Export PDF
 * @param {string} [className] - Optional wrapper class
 */
const DataTableFilterBar = ({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  advancedFilters = [],
  onClearFilters,
  hasActiveFilters = false,
  onExportCSV,
  onExportPDF,
  table,
  className = '',
}) => {
  const [showAdvancedDropdown, setShowAdvancedDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAdvancedDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowAdvancedDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAdvancedDropdown])

  const filterBadgeCount = [searchValue, ...(advancedFilters?.map((f) => f.value) ?? [])].filter(
    Boolean
  ).length

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 ${className}`}
      data-testid="data-table-filter-bar"
    >
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        <div className="flex-1 min-w-0 relative" ref={dropdownRef}>
          <div className="relative flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              className={`block w-full h-10 pl-10 pr-10 border border-gray-300 dark:border-gray-600 leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                advancedFilters?.length > 0 ? 'rounded-l-md' : 'rounded-md'
              }`}
              data-testid="filter-bar-search"
            />
            {advancedFilters?.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAdvancedDropdown(!showAdvancedDropdown)}
                className="inline-flex items-center justify-center h-10 px-3 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="filter-bar-toggle-advanced"
              >
                <FunnelIcon className="h-5 w-5" />
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                    {filterBadgeCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {showAdvancedDropdown && advancedFilters?.length > 0 && (
            <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-4">
                {advancedFilters.map((filter) => (
                  <div key={filter.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {filter.label}
                    </label>
                    <select
                      value={filter.value}
                      onChange={filter.onChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      data-testid={`filter-bar-${filter.id}`}
                    >
                      {filter.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          <button
            className={`inline-flex items-center justify-center h-10 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              !hasActiveFilters ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            data-testid="filter-bar-clear"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Clear
          </button>
          {(onExportCSV || onExportPDF) && (
            <ExportButton
              onExportCSV={onExportCSV}
              onExportPDF={onExportPDF}
              size="md"
              variant="secondary"
              className="h-10"
            />
          )}
          {table && (
            <div className="relative">
              <ColumnVisibilityDropdown
                table={table}
                variant="secondary"
                size="md"
                buttonClassName="h-10"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataTableFilterBar
