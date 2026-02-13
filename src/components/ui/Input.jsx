import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Input = forwardRef(
  (
    {
      label,
      error,
      helper,
      required,
      type = 'text',
      placeholder,
      className,
      icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className={cn(
                'absolute inset-y-0 flex items-center pointer-events-none text-text-muted',
                iconPosition === 'left' ? 'left-3' : 'right-3'
              )}
            >
              <icon className="h-5 w-5" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={cn(
              'block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
              'border-gray-300 dark:border-gray-600',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              icon && (iconPosition === 'left' ? 'pl-10' : 'pr-10'),
              error ? 'border-red-500 dark:border-red-500' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-text-tertiary">{helper}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
