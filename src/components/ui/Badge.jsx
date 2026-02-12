import React from 'react'
import { cn } from '../../utils/cn'

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-bg-tertiary text-text-secondary',
    primary: 'bg-accent-light text-accent dark:bg-accent-muted dark:text-accent-foreground',
    success: 'bg-success-light text-success dark:bg-success-muted dark:text-success-foreground',
    warning: 'bg-warning-light text-warning dark:bg-warning-muted dark:text-warning-foreground',
    danger: 'bg-danger-light text-danger dark:bg-danger-muted dark:text-danger-foreground',
    info: 'bg-info-light text-info dark:bg-info-muted dark:text-info-foreground',
  }

  const dotColors = {
    default: 'bg-text-muted',
    primary: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L6 4.586l.293-.293a1 1 0 111.414 1.414L7.414 6l.293.293a1 1 0 01-1.414 1.414L6 7.414l-.293.293a1 1 0 01-1.414-1.414L4.586 6l-.293-.293a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </span>
  )
}

export { Badge }
export default Badge
