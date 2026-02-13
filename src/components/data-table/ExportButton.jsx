import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import { cn } from '../../utils/cn'

const ExportButton = ({
  onExportCSV,
  onExportPDF,
  className,
  size = 'sm',
  variant = 'secondary',
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExportCSV = () => {
    setShowDropdown(false)
    onExportCSV?.()
  }

  const handleExportPDF = () => {
    setShowDropdown(false)
    onExportPDF?.()
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn('flex items-center gap-2', className)}
        data-testid="export-dropdown"
      >
        <DocumentArrowDownIcon className="h-4 w-4" />
        Export
        <ChevronDownIcon
          className={cn('h-4 w-4 transition-transform', showDropdown && 'rotate-180')}
        />
      </Button>
      {showDropdown && (
        <div className="dropdown-menu right-0 w-40 py-1 animate-scale-in">
          {onExportCSV && (
            <button
              onClick={handleExportCSV}
              className="dropdown-item w-full"
              data-testid="export-csv"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export CSV
            </button>
          )}
          {onExportPDF && (
            <button
              onClick={handleExportPDF}
              className="dropdown-item w-full"
              data-testid="export-pdf"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Export PDF
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ExportButton
