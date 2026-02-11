import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '../../utils/cn'
import { useDebounce } from '../../hooks/useDebounce'
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const SearchableSelect = ({
  label,
  value,
  onChange,
  loadOptions,
  error,
  required,
  placeholder,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [hasInteracted, setHasInteracted] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const debouncedSearchTerm = useDebounce(inputValue, 300)

  // Load options when search term changes
  const loadOptionsCallback = useCallback(
    async (searchTerm) => {
      if (!loadOptions) return
      setIsLoading(true)
      try {
        const opts = await loadOptions(searchTerm)
        setOptions(opts || [])
        setHighlightedIndex(-1)
      } catch (error) {
        console.error('Error loading options:', error)
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    },
    [loadOptions]
  )

  // Load options when user has interacted and search term changes (debounced)
  useEffect(() => {
    if (hasInteracted && debouncedSearchTerm) {
      loadOptionsCallback(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, loadOptionsCallback, hasInteracted])

  // Load options when value is set but no options loaded yet
  useEffect(() => {
    if (value && options.length === 0 && loadOptions && !hasInteracted) {
      loadOptionsCallback('')
    }
  }, [value, options.length, loadOptions, hasInteracted, loadOptionsCallback])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get the display label for the current value
  const getDisplayLabel = () => {
    if (!value) return inputValue
    const option = options.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setHasInteracted(true)
    if (!isOpen) setIsOpen(true)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    setHasInteracted(true)
    // Load initial options if input is empty and hasn't been loaded yet
    if (!inputValue && loadOptions && options.length === 0) {
      loadOptionsCallback('')
    }
  }

  const handleSelect = (option) => {
    onChange?.(option.value)
    setInputValue(option.label)
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className="relative space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value ? getDisplayLabel() : inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {isLoading ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {options.length === 0 && !isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No options found
            </div>
          ) : (
            options.map((option, index) => (
              <div
                key={option.value}
                className={cn(
                  'px-3 py-2 cursor-pointer text-sm',
                  index === highlightedIndex
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default SearchableSelect
