import React from 'react'
import { cn } from '../../utils/cn'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  description,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: { container: 'p-4', icon: 'h-8 w-8', text: { value: 'text-xl', label: 'text-xs' } },
    md: { container: 'p-6', icon: 'h-10 w-10', text: { value: 'text-2xl', label: 'text-sm' } },
    lg: { container: 'p-8', icon: 'h-12 w-12', text: { value: 'text-3xl', label: 'text-base' } },
  }

  const iconColors = {
    accent: 'bg-accent-light text-accent dark:bg-accent-muted dark:text-accent-foreground',
    success: 'bg-success-light text-success dark:bg-success-muted dark:text-success-foreground',
    warning: 'bg-warning-light text-warning dark:bg-warning-muted dark:text-warning-foreground',
    danger: 'bg-danger-light text-danger dark:bg-danger-muted dark:text-danger-foreground',
    info: 'bg-info-light text-info dark:bg-info-muted dark:text-info-foreground',
  }

  const trendColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-text-tertiary',
  }

  const TrendIcon = trend?.isPositive
    ? ArrowTrendingUpIcon
    : trend?.isPositive === false
      ? ArrowTrendingDownIcon
      : null

  return (
    <div className={cn('surface-interactive', sizes[size].container, className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div
              className={cn(
                'rounded-xl flex items-center justify-center',
                iconColors[trend?.color || 'accent'],
                sizes[size].icon
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className={cn('text-text-tertiary font-medium', sizes[size].text.label)}>{label}</p>
            <p className={cn('font-bold text-text-primary mt-1', sizes[size].text.value)}>
              {value}
            </p>
          </div>
        </div>
        {trend && TrendIcon && (
          <div
            className={cn(
              'flex items-center gap-1',
              trendColors[trend.isPositive ? 'positive' : 'negative']
            )}
          >
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {typeof trend.value === 'string' ? trend.value : `${Math.abs(trend.value)}%`}
            </span>
            {trendLabel && <span className="text-xs text-text-tertiary ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
      {description && <p className="mt-3 text-sm text-text-tertiary">{description}</p>}
    </div>
  )
}

export default StatCard
