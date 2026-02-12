import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

const Select = forwardRef(
  ({ label, error, helper, required, placeholder, options = [], className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'input-base appearance-none pr-10',
              'bg-bg-card',
              error && 'border-danger focus:ring-danger/20 focus:border-danger',
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
        {error && <p className="text-sm text-danger">{error}</p>}
        {helper && !error && <p className="text-sm text-text-tertiary">{helper}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
