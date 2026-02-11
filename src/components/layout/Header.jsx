import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useBusiness } from '../../hooks/useBusiness'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import ROUTES from '../../constants/routes'

const Header = ({ onToggleSidebar }) => {
  const { businesses, activeBusiness, switchBusiness, roles } = useBusiness()
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const handleBusinessSelect = (businessKey) => {
    switchBusiness(businessKey)
    setBusinessDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
  }

  // If only one business, don't show switcher
  const showBusinessSwitcher = businesses.length > 1

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Link
          to={ROUTES.DASHBOARD}
          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          OneVizn
        </Link>
      </div>

      {/* Center Section - Business Switcher */}
      {showBusinessSwitcher && (
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <button
              onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span>{activeBusiness?.name || 'Select Business'}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {businessDropdownOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                {businesses.map((business) => {
                  const businessRoles = roles[business.business_key] || []
                  return (
                    <button
                      key={business.business_key}
                      onClick={() => handleBusinessSelect(business.business_key)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {business.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {businessRoles.join(', ')}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        {/* Notifications - Placeholder */}
        <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 relative">
          <BellIcon className="h-5 w-5" />
          {/* Unread count badge - placeholder */}
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Avatar firstName={user?.firstName || 'U'} lastName={user?.lastName || 'U'} size="sm" />
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </div>
              <Badge status="active">{roles[activeBusiness?.business_key]?.[0] || 'User'}</Badge>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>
          {userDropdownOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
              <div className="py-1">
                <Link
                  to={ROUTES.PROFILE}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  Account Settings
                </Link>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
