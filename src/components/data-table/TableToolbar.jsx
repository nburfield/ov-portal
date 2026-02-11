import React, { useState } from 'react'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import Input from '../ui/Input'

const TableToolbar = ({ table, globalFilter, setGlobalFilter }) => {
  const [showColumnVisibility, setShowColumnVisibility] = useState(false)

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColumnVisibility(!showColumnVisibility)}
            className="flex items-center"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Columns
          </Button>
          {showColumnVisibility && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <div className="p-2">
                {table.getAllColumns().map((column) => (
                  <label key={column.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {column.columnDef.header}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TableToolbar
