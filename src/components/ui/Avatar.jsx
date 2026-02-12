import React from 'react'
import { cn } from '../../utils/cn'

const avatarColors = [
  'bg-accent',
  'bg-success',
  'bg-warning',
  'bg-danger',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
]

const Avatar = ({
  firstName,
  lastName,
  src,
  alt,
  size = 'md',
  shape = 'circle',
  status,
  className,
}) => {
  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName?.charAt(0).toUpperCase() || '?'

  const hash = (firstName + lastName).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const bgColor = avatarColors[hash % avatarColors.length]

  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-14 w-14 text-lg',
    '2xl': 'h-16 w-16 text-xl',
  }

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  }

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
    '2xl': 'h-4 w-4',
  }

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-text-muted',
    busy: 'bg-danger',
    away: 'bg-warning',
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || `${firstName} ${lastName}`}
          className={cn('object-cover', sizes[size], shapes[shape])}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center font-semibold text-white',
            sizes[size],
            bgColor,
            shapes[shape]
          )}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 border-2 border-bg-card rounded-full',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  )
}

export default Avatar
