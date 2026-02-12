import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helper,
      required,
      rows = 3,
      maxLength,
      showCount = false,
      placeholder,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text-secondary">
              {label}
              {required && <span className="text-danger ml-1">*</span>}
            </label>
            {showCount && maxLength && (
              <span className="text-xs text-text-muted">
                {props.value?.length || 0}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          className={cn(
            'input-base resize-none',
            error && 'border-danger focus:ring-danger/20 focus:border-danger',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        {helper && !error && <p className="text-sm text-text-tertiary">{helper}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
