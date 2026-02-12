import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Toggle = forwardRef(
  (
    { checked = false, onChange, disabled = false, size = 'md', label, error, className, ...props },
    ref
  ) => {
    const sizes = {
      sm: { track: 'w-8 h-4', thumb: 'h-3 w-3', translate: 'translate-x-4' },
      md: { track: 'w-11 h-6', thumb: 'h-5 w-5', translate: 'translate-x-5' },
      lg: { track: 'w-14 h-7', thumb: 'h-6 w-6', translate: 'translate-x-7' },
    }

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
          className={cn(
            'relative inline-flex items-center rounded-full transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-2',
            checked ? 'bg-accent' : 'bg-bg-tertiary border border-border',
            disabled && 'opacity-50 cursor-not-allowed',
            sizes[size].track
          )}
          {...props}
        >
          <span
            className={cn(
              'inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200',
              checked ? sizes[size].translate : 'translate-x-0',
              sizes[size].thumb
            )}
          />
        </button>
        {label && (
          <label
            className="text-sm font-medium text-text-secondary cursor-pointer"
            onClick={() => onChange?.(!checked)}
          >
            {label}
          </label>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'

export default Toggle
