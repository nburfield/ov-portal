import React, { useEffect, useRef, useId, createPortal } from 'react'
import { cn } from '../../utils/cn'
import { XMarkIcon } from '@heroicons/react/24/outline'

const SlideOver = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'right',
  showClose = true,
  closeOnOverlay = true,
  className,
}) => {
  const slideRef = useRef(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  const transforms = {
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
  }

  const overlayPosition = position === 'right' ? 'right-0' : 'left-0'

  const slideOver = (
    <div className={cn('fixed inset-0 z-50 overflow-hidden', className)}>
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div className="relative h-full">
        <div
          ref={slideRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className={cn(
            'absolute inset-y-0 w-full bg-bg-card shadow-2xl transition-transform duration-300 ease-out',
            overlayPosition,
            sizes[size],
            transforms[position]
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="text-sm text-text-tertiary mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                  aria-label="Close panel"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(slideOver, document.body)
}

export default SlideOver
