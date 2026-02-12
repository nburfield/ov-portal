import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { useBusiness } from '../../hooks/useBusiness'
import { useTheme } from '../../contexts/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import ROUTES from '../../constants/routes'

const Header = ({ onToggleSidebar }) => {
  const { businesses, activeBusiness, switchBusiness, roles } = useBusiness()
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const businessRef = useRef(null)
  const userRef = useRef(null)
  const notificationRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (businessRef.current && !businessRef.current.contains(e.target)) {
        setBusinessDropdownOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBusinessSelect = (businessKey) => {
    switchBusiness(businessKey)
    setBusinessDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
  }

  const showBusinessSwitcher = businesses.length > 1
  const userFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'
  const currentRoles = roles[activeBusiness?.business_key] || []

  return (
    <header className="sticky top-0 z-40 h-16 bg-bg-card/80 backdrop-blur-xl border-b border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-2 text-xl font-bold text-text-primary"
        >
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">OV</span>
          </div>
          <span className="hidden sm:block">OneVizn</span>
        </Link>
      </div>

      {showBusinessSwitcher && (
        <div ref={businessRef} className="hidden md:block relative">
          <button
            onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <BuildingOfficeIcon className="h-4 w-4 text-text-tertiary" />
            <span className="max-w-[150px] truncate">
              {activeBusiness?.name || 'Select Business'}
            </span>
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 text-text-tertiary transition-transform',
                businessDropdownOpen && 'rotate-180'
              )}
            />
          </button>
          {businessDropdownOpen && (
            <div className="dropdown-menu animate-scale-in">
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Businesses
                </p>
                <div className="mt-1 space-y-0.5">
                  {businesses.map((business) => {
                    const businessRoles = roles[business.business_key] || []
                    return (
                      <button
                        key={business.business_key}
                        onClick={() => handleBusinessSelect(business.business_key)}
                        className={cn(
                          'dropdown-item w-full',
                          activeBusiness?.business_key === business.business_key && 'bg-bg-hover'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{business.name}</p>
                          <p className="text-xs text-text-muted truncate">
                            {businessRoles.join(', ')}
                          </p>
                        </div>
                        {activeBusiness?.business_key === business.business_key && (
                          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <div ref={notificationRef} className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              notificationOpen
                ? 'text-text-primary bg-bg-hover'
                : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover'
            )}
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-danger-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          {notificationOpen && (
            <div className="dropdown-menu w-80 animate-scale-in">
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-text-primary">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { title: 'New work order assigned', time: '5 min ago', read: false },
                  { title: 'Invoice #1234 is overdue', time: '1 hour ago', read: false },
                  { title: 'Task completed successfully', time: '2 hours ago', read: true },
                ].map((notification, i) => (
                  <button key={i} className="dropdown-item w-full text-left">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 mt-1.5 rounded-full flex-shrink-0',
                          notification.read ? 'bg-text-muted' : 'bg-accent'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">{notification.title}</p>
                        <p className="text-xs text-text-muted">{notification.time}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <button className="dropdown-item w-full text-accent text-sm">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div ref={userRef} className="relative ml-1">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={cn(
              'flex items-center gap-2 p-1.5 rounded-lg transition-colors',
              userDropdownOpen ? 'bg-bg-hover' : 'hover:bg-bg-hover'
            )}
          >
            <Avatar firstName={user?.firstName || 'U'} lastName={user?.lastName || 'U'} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-text-primary max-w-[120px] truncate">
                {userFullName}
              </p>
              <p className="text-xs text-text-muted max-w-[120px] truncate">
                {currentRoles[0] || 'User'}
              </p>
            </div>
            <ChevronDownIcon
              className={cn(
                'hidden lg:block h-4 w-4 text-text-tertiary transition-transform',
                userDropdownOpen && 'rotate-180'
              )}
            />
          </button>
          {userDropdownOpen && (
            <div className="dropdown-menu animate-scale-in">
              <div className="p-3 border-b border-border">
                <p className="font-medium text-text-primary">{userFullName}</p>
                <p className="text-sm text-text-tertiary">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link
                  to={ROUTES.PROFILE}
                  className="dropdown-item"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <UserCircleIcon className="h-4 w-4" />
                  My Profile
                </Link>
                <Link
                  to={ROUTES.SETTINGS}
                  className="dropdown-item"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  Settings
                </Link>
              </div>
              <div className="p-2 border-t border-border">
                <button onClick={handleLogout} className="dropdown-item text-danger">
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
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
