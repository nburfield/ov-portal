import React from 'react'
import { cn } from '../../utils/cn'

const Skeleton = ({ variant = 'text', width, height, count = 1, className }) => {
  const baseClasses = 'skeleton bg-bg-tertiary dark:bg-bg-active'

  const variants = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded-lg',
    title: 'h-6 w-3/4 rounded-lg',
    subtitle: 'h-4 w-1/2 rounded',
    avatar: 'rounded-full',
    button: 'h-10 w-24 rounded-lg',
    input: 'h-10 w-full rounded-lg',
    card: 'rounded-xl',
  }

  if (variant === 'row') {
    const rows = Array.from({ length: count }, (_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton variant="avatar" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="subtitle" />
        </div>
        <Skeleton variant="button" width={80} />
      </div>
    ))
    return <div className="space-y-px bg-border">{rows}</div>
  }

  if (variant === 'card') {
    return (
      <div
        className={cn('surface p-6 space-y-4', baseClasses, className)}
        style={{ width, height }}
      >
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" width={48} height={48} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="title" />
            <Skeleton variant="subtitle" />
          </div>
        </div>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="75%" />
      </div>
    )
  }

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(baseClasses, variants[variant], className)}
      style={{ width, height }}
    />
  ))

  return <div>{items}</div>
}

export { Skeleton }
export default Skeleton
