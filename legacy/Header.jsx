import React, { useState, useEffect, useContext, useRef } from 'react'
import { Bell, User, Menu, Moon, Sun, LogOut, Settings, ChevronDown, Clock } from 'lucide-react'
import { AuthContext } from '../../context/AuthContext.jsx'
import { BusinessContext } from '../../context/BusinessContext.jsx'
import { useJwtExpiration } from '../../hooks/useJwtExpiration.js'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuToggle }) => {
  const [isDark, setIsDark] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const { user_name, email, logout } = useContext(AuthContext)
  const {
    businesses = [],
    selectedBusinessKey,
    setSelectedBusinessKey,
  } = useContext(BusinessContext)
  const { timeRemaining, expirationDate, isExpired } = useJwtExpiration()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const applyTheme = () => {
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDark(true)
        document.documentElement.classList.add('dark')
      } else {
        setIsDark(false)
        document.documentElement.classList.remove('dark')
      }
    }

    applyTheme()
  }, [])

  // Handle clicking outside dropdown to close it
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

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleBusinessChange = (e) => {
    const newBusinessKey = e.target.value || null
    setSelectedBusinessKey(newBusinessKey)
  }

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen)
  }

  const handleSettingsClick = () => {
    navigate('/account')
    setIsUserDropdownOpen(false)
  }

  const handleLogoutClick = () => {
    logout()
    setIsUserDropdownOpen(false)
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="block">
            {businesses.length === 1 ? (
              <div className="text-gray-900 dark:text-gray-100 w-full max-w-xs sm:w-64 text-xl font-semibold">
                {businesses[0].name}
              </div>
            ) : (
              <div className="relative w-full max-w-xs sm:w-64">
                <select
                  value={selectedBusinessKey || ''}
                  onChange={handleBusinessChange}
                  className="appearance-none text-gray-900 dark:text-gray-100 w-full text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 pr-6 cursor-pointer"
                >
                  <option value="">Select a Business</option>
                  {businesses.map((business) => (
                    <option key={business.key} value={business.key}>
                      {business.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleUserDropdown}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user_name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {email || 'admin@allianceforge.net'}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user_name || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {email || 'admin@allianceforge.net'}
                    </p>
                  </div>

                  {/* JWT Expiration Info */}
                  {timeRemaining && (
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="w-3 h-3 mr-2" />
                        <span className="font-medium">Session expires:</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span
                          className={`text-xs font-mono ${isExpired ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                          {timeRemaining}
                        </span>
                        {expirationDate && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {expirationDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogoutClick}
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
