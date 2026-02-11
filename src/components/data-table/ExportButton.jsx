import React, { useState } from 'react'
import { ChevronDownIcon, DocumentTextIcon, DocumentIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'

const ExportButton = ({ onExportCSV, onExportPDF, className }) => {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleToggle = () => setShowDropdown(!showDropdown)

  const handleExportCSV = () => {
    setShowDropdown(false)
    onExportCSV()
  }

  const handleExportPDF = () => {
    setShowDropdown(false)
    onExportPDF()
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={`flex items-center ${className}`}
      >
        Export
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </Button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <DocumentTextIcon className="mr-2 h-4 w-4" />
              CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <DocumentIcon className="mr-2 h-4 w-4" />
              PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportButton
