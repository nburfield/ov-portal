import React from 'react'
import { cn } from '../../utils/cn'

const Card = ({ title, description, children, className, headerAction, variant = 'default' }) => {
  const variants = {
    default: 'bg-bg-card border border-border/50 rounded-2xl shadow-lg',
    elevated: 'bg-bg-card border border-border/50 rounded-3xl shadow-xl',
    outline: 'bg-transparent border-2 border-border rounded-xl',
    glass: 'bg-bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg',
  }

  return (
    <div className={cn(variants[variant], className)}>
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div>
            {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
            {description && <p className="text-sm text-text-tertiary mt-1">{description}</p>}
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

const CardHeader = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-border', className)}>{children}</div>
)

const CardBody = ({ children, className }) => <div className={cn('p-6', className)}>{children}</div>

const CardFooter = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-border bg-bg-secondary/50', className)}>
    {children}
  </div>
)

export { Card, CardHeader, CardBody, CardFooter }
export default Card
