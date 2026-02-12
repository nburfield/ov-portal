import React from 'react'
import { cn } from '../../utils/cn'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

const Button = ({
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent-hover focus:ring-accent shadow-sm',
    secondary:
      'bg-bg-tertiary text-text-primary hover:bg-bg-hover border border-border focus:ring-border',
    ghost:
      'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary focus:ring-border',
    danger: 'bg-danger text-danger-foreground hover:bg-danger/90 focus:ring-danger shadow-sm',
    success: 'bg-success text-success-foreground hover:bg-success/90 focus:ring-success shadow-sm',
    warning: 'bg-warning text-warning-foreground hover:bg-warning/90 focus:ring-warning shadow-sm',
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-base',
  }

  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-all duration-200',
    variants[variant],
    sizes[size],
    className
  )

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" data-testid="loading-spinner" />}
      {children}
    </button>
  )
}

export { Button }
export default Button
