import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn'
import { Badge } from './Badge'

const Tabs = ({ tabs, activeTab, onChange, variant = 'default', className, ...props }) => {
  const tabRefs = useRef([])
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const activeTabIndex = tabs.findIndex((tab) => tab.key === activeTab)

  useEffect(() => {
    if (tabRefs.current[activeTabIndex]) {
      const activeTabEl = tabRefs.current[activeTabIndex]
      setIndicatorStyle({
        left: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
      })
    }
  }, [activeTab, activeTabIndex])

  const handleKeyDown = (event, tabKey) => {
    const currentIndex = tabs.findIndex((tab) => tab.key === tabKey)

    switch (event.key) {
      case 'ArrowLeft': {
        event.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        onChange(tabs[prevIndex].key)
        break
      }
      case 'ArrowRight': {
        event.preventDefault()
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        onChange(tabs[nextIndex].key)
        break
      }
      case 'Home':
        event.preventDefault()
        onChange(tabs[0].key)
        break
      case 'End':
        event.preventDefault()
        onChange(tabs[tabs.length - 1].key)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onChange(tabKey)
        break
      default:
        break
    }
  }

  const tabContent = tabs.find((tab) => tab.key === activeTab)?.content

  const variants = {
    default: {
      container: 'border-b border-border',
      tab: 'px-4 py-2.5 text-sm font-medium transition-colors',
      active: 'text-accent border-b-2 border-accent',
      inactive: 'text-text-tertiary hover:text-text-primary border-b-2 border-transparent',
    },
    pills: {
      container: 'bg-bg-secondary rounded-lg p-1',
      tab: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
      active: 'bg-bg-card text-text-primary shadow-sm',
      inactive: 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover/50',
    },
    enclosed: {
      container: 'border border-border rounded-xl overflow-hidden',
      tab: 'px-4 py-2.5 text-sm font-medium transition-colors',
      active: 'bg-bg-secondary text-text-primary border-b border-border',
      inactive:
        'text-text-tertiary hover:text-text-primary hover:bg-bg-hover/50 border-b border-transparent',
    },
  }

  const config = variants[variant] || variants.default

  return (
    <div className={className} {...props}>
      <div role="tablist" className={cn('relative flex', config.container)}>
        {variant === 'default' && (
          <div
            className="absolute bottom-0 h-0.5 bg-accent transition-all duration-200"
            style={indicatorStyle}
          />
        )}
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              ref={(el) => (tabRefs.current[index] = el)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.key)}
              onKeyDown={(event) => handleKeyDown(event, tab.key)}
              className={cn(config.tab, isActive ? config.active : config.inactive)}
            >
              <div className="flex items-center gap-2">
                {tab.label}
                {tab.badge && (
                  <Badge size="sm" variant={isActive ? 'primary' : 'neutral'}>
                    {tab.badge}
                  </Badge>
                )}
                {tab.icon && <tab.icon className="h-4 w-4" />}
              </div>
            </button>
          )
        })}
      </div>
      {tabContent && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="mt-4"
        >
          {tabContent}
        </div>
      )}
    </div>
  )
}

export default Tabs
