import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

const Select = forwardRef(
  ({ label, error, helper, required, placeholder, options = [], className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
              'appearance-none pr-10',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              error ? 'border-red-500 dark:border-red-500' : '',
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-text-muted">
            <ChevronUpDownIcon className="h-5 w-5" />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-text-tertiary">{helper}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
