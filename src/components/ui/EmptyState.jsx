import React from 'react'
import { cn } from '../../utils/cn'
import Button from './Button'

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
}) => {
  const sizes = {
    sm: { icon: 'h-10 w-10', title: 'text-base', desc: 'text-sm' },
    md: { icon: 'h-14 w-14', title: 'text-lg', desc: 'text-sm' },
    lg: { icon: 'h-20 w-20', title: 'text-xl', desc: 'text-base' },
  }

  return (
    <div className={cn('empty-state py-12', className)}>
      {Icon && (
        <div className={cn('empty-state-icon', sizes[size].icon)}>
          <Icon className="w-full h-full" />
        </div>
      )}
      <h3 className={cn('empty-state-title', sizes[size].title)}>{title}</h3>
      {description && (
        <p className={cn('empty-state-description', sizes[size].desc)}>{description}</p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 mt-6">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
