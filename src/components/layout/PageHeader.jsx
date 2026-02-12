import React from 'react'
import { cn } from '../../utils/cn'

const PageHeader = ({ title, subtitle, description, children, actions, className }) => {
  return (
    <div className={cn('page-header', className)}>
      <div>
        {title && <h1 className="page-title">{title}</h1>}
        {(subtitle || description) && (
          <p className="page-subtitle">
            {subtitle}
            {description && <span className="mx-2 text-text-muted">·</span>}
            {description}
          </p>
        )}
      </div>
      {(children || actions) && (
        <div className="flex items-center gap-3">
          {children}
          {actions}
        </div>
      )}
    </div>
  )
}

export default PageHeader
