import React, { useEffect, useRef } from 'react'
import { cn } from '../../utils/cn'

const Tabs = ({ tabs, activeTab, onChange, className, ...props }) => {
  const tabRefs = useRef([])
  const activeTabIndex = tabs.findIndex((tab) => tab.key === activeTab)

  useEffect(() => {
    if (tabRefs.current[activeTabIndex]) {
      tabRefs.current[activeTabIndex].focus()
    }
  }, [activeTabIndex])

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

  return (
    <div
      role="tablist"
      className={cn('flex border-b border-gray-200 dark:border-gray-700', className)}
      {...props}
    >
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
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'border-b-2',
              isActive
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
