import { useState, useEffect, useRef } from 'react'
import { cn } from '../../utils/cn'

function Tooltip({ content, children, position = 'top', delay = 200, className }) {
  const [show, setShow] = useState(false)
  const timeoutRef = useRef(null)
  const tooltipRef = useRef(null)

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowPositions = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-border',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-border',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-border',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-border',
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShow(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={tooltipRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && content && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1.5',
            'bg-bg-card border border-border',
            'text-xs font-medium text-text-primary',
            'rounded-lg shadow-lg',
            'animate-fade-in',
            positions[position]
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-bg-card border-inherit rotate-45',
              'before:content-[""] before:absolute before:w-full before:h-full before:bg-bg-card before:border-inherit',
              'before:rotate-45 before:-z-10',
              arrowPositions[position]
            )}
          />
        </div>
      )}
    </div>
  )
}

export default Tooltip
