import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '../../utils/cn'
import { useDebounce } from '../../hooks/useDebounce'
import { ChevronDownIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline'

const SearchableSelect = ({
  label,
  value,
  onChange,
  loadOptions,
  error,
  required,
  placeholder,
  className,
  disabled = false,
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

  useEffect(() => {
    if (hasInteracted && debouncedSearchTerm !== undefined) {
      loadOptionsCallback(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, loadOptionsCallback, hasInteracted])

  useEffect(() => {
    if (value && options.length === 0 && loadOptions && !hasInteracted) {
      loadOptionsCallback('')
    }
  }, [value, options.length, loadOptions, hasInteracted, loadOptionsCallback])

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

  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.('')
    setInputValue('')
    setIsOpen(true)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
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
        inputRef.current?.blur()
        break
    }
  }

  return (
    <div className="relative space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
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
          disabled={disabled}
          className={cn(
            'input-base pr-10',
            error && 'border-danger focus:ring-danger/20 focus:border-danger',
            className
          )}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {isLoading ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin text-text-muted" />
          ) : (
            <>
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-0.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
              <ChevronDownIcon
                className={cn(
                  'h-4 w-4 text-text-muted transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </>
          )}
        </div>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-auto animate-scale-in"
        >
          {options.length === 0 && !isLoading ? (
            <div className="px-4 py-3 text-sm text-text-tertiary text-center">No options found</div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm transition-colors',
                  index === highlightedIndex
                    ? 'bg-bg-hover text-text-primary'
                    : 'text-text-secondary hover:bg-bg-hover/50',
                  option.value === value && 'bg-accent-light/30 text-accent'
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}

export default SearchableSelect
