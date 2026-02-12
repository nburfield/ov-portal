import React from 'react'
import { cn } from '../../utils/cn'

const Skeleton = ({ variant = 'text', width, height, count = 1, className, ...props }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'

  const variantClasses = {
    text: 'h-4 rounded',
    circle: 'rounded-full',
    rect: 'rounded',
    SkeletonRow: 'flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700',
  }

  const getClasses = (v) => cn(baseClasses, variantClasses[v], className)

  if (variant === 'SkeletonRow') {
    const rows = Array.from({ length: count }, (_, i) => (
      <div key={i} className={getClasses('SkeletonRow')}>
        <div className={cn(baseClasses, 'h-10 w-10 rounded-full')} />
        <div className="flex-1 space-y-2">
          <div className={cn(baseClasses, 'h-4 w-3/4 rounded')} />
          <div className={cn(baseClasses, 'h-3 w-1/2 rounded')} />
        </div>
        <div className={cn(baseClasses, 'h-8 w-20 rounded')} />
      </div>
    ))
    return <div {...props}>{rows}</div>
  } else {
    const skeletons = Array.from({ length: count }, (_, i) => (
      <div key={i} className={getClasses(variant)} style={{ width, height }} {...props} />
    ))
    return <div>{skeletons}</div>
  }
}

export { Skeleton }
export default Skeleton
