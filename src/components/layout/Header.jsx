import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useTheme } from '../../contexts/useTheme.js'
import { useAuth } from '../../hooks/useAuth.js'
import { useBusiness } from '../../hooks/useBusiness.js'
import { cn } from '../../utils/cn'
import ROUTES from '../../constants/routes.js'

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth()
  const { businesses = [], activeBusiness, switchBusiness } = useBusiness()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(isDark)

  const safeBusinesses = Array.isArray(businesses) ? businesses : []
  const hasSingleBusiness = safeBusinesses.length === 1 && activeBusiness

  useEffect(() => {
    setIsDarkMode(isDark)
  }, [isDark])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleToggleDarkMode = () => {
    toggleTheme()
    setIsDarkMode(!isDarkMode)
  }

  const handleBusinessChange = (e) => {
    const newBusinessKey = e.target.value || null
    switchBusiness(newBusinessKey)
  }

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen)
  }

  const handleSettingsClick = () => {
    navigate(ROUTES.PROFILE)
    setIsUserDropdownOpen(false)
  }

  const handleLogoutClick = () => {
    logout()
    setIsUserDropdownOpen(false)
  }

  const handleLogoClick = () => {
    navigate(ROUTES.DASHBOARD)
  }

  const displayName = user?.user_name ?? 'User'
  const displayEmail = user?.email ?? ''

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            data-testid="sidebar-toggle"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <button onClick={handleLogoClick} data-testid="header-logo" className="block">
            {hasSingleBusiness ? (
              <div className="text-gray-900 dark:text-gray-100 w-full max-w-xs sm:w-64 text-xl font-semibold">
                {activeBusiness.name}
              </div>
            ) : (
              <div className="relative w-full max-w-xs sm:w-64">
                <select
                  value={activeBusiness?.business_key || ''}
                  onChange={handleBusinessChange}
                  data-testid="header-business-switcher"
                  className="appearance-none text-gray-900 dark:text-gray-100 w-full text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 pr-6 cursor-pointer"
                >
                  <option value="">Select a Business</option>
                  {safeBusinesses.map((business) => (
                    <option
                      key={business.business_key}
                      value={business.business_key}
                      data-testid={`business-option-${business.business_key}`}
                    >
                      {business.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleDarkMode}
            data-testid="header-theme-toggle"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleUserDropdown}
              data-testid="header-user-menu"
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {displayName}
                </p>
                {displayEmail && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{displayEmail}</p>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200',
                  isUserDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {isUserDropdownOpen && (
              <div
                data-testid="header-user-dropdown"
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {displayName}
                    </p>
                    {displayEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{displayEmail}</p>
                    )}
                  </div>

                  <button
                    onClick={handleSettingsClick}
                    data-testid="header-profile-link"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogoutClick}
                    data-testid="header-logout"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
