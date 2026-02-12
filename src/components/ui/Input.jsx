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
          <label className="block text-sm font-medium text-text-secondary">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
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
              'input-base',
              icon && (iconPosition === 'left' ? 'pl-10' : 'pr-10'),
              error && 'border-danger focus:ring-danger/20 focus:border-danger',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {helper && !error && <p className="text-sm text-text-tertiary">{helper}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
