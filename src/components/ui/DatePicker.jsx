import React from 'react'
import { cn } from '../../utils/cn'

const DatePicker = ({ label, value, onChange, error, required, min, max, className, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        data-testid="date-input"
        className={cn(
          'block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-accent focus:border-accent bg-bg-card text-text-primary',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}

export default DatePicker
