import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Header from './Header'
import Sidebar from './Sidebar'

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed')
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarCollapsed(JSON.parse(stored))
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        {/* Mobile Sidebar Overlay - TODO: Implement mobile sidebar */}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
