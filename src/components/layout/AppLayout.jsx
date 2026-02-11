import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Bars3Icon,
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import Header from './Header'

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

  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
    { name: 'Analytics', icon: ChartBarIcon, href: '/analytics' },
    { name: 'Users', icon: UserGroupIcon, href: '/users' },
    { name: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
  ]

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } hidden md:block`}
        >
          <div className="p-4">
            <button
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 hidden xl:flex items-center justify-center w-full"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <nav className="mt-4">
            <ul className="space-y-2 px-4">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar} />
            <aside className="relative flex w-full max-w-xs flex-col bg-white">
              <div className="p-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-4">
                <ul className="space-y-2 px-4">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                      >
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span>{item.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
