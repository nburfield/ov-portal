import React, { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

const JsonEditor = ({ value = {}, onChange, className }) => {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    // Convert object to array of [key, value] pairs
    const newEntries = Object.entries(value).map(([key, val], index) => ({
      key,
      value: String(val), // Ensure values are strings for input fields
      id: index + 1, // Simple ID based on index
    }))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(newEntries)
  }, [value])

  const updateEntry = (id, field, newValue) => {
    const updatedEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, [field]: newValue } : entry
    )
    setEntries(updatedEntries)
    emitChange(updatedEntries)
  }

  const addEntry = () => {
    const newEntry = {
      key: '',
      value: '',
      id: Math.max(...entries.map((e) => e.id), 0) + 1,
    }
    const updatedEntries = [...entries, newEntry]
    setEntries(updatedEntries)
    emitChange(updatedEntries)
  }

  const removeEntry = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id)
    setEntries(updatedEntries)
    emitChange(updatedEntries)
  }

  const emitChange = (updatedEntries) => {
    // Convert array back to object, filtering out entries with empty keys
    const newValue = {}
    updatedEntries.forEach(({ key, value }) => {
      if (key.trim()) {
        newValue[key.trim()] = value
      }
    })
    onChange?.(newValue)
  }

  const inputClasses = cn(
    'block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-accent focus:border-accent bg-bg-card text-text-primary text-sm'
  )

  return (
    <div className={cn('space-y-2', className)}>
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Key"
            value={entry.key}
            onChange={(e) => updateEntry(entry.id, 'key', e.target.value)}
            className={inputClasses}
            data-testid={`key-input-${index}`}
          />
          <input
            type="text"
            placeholder="Value"
            value={entry.value}
            onChange={(e) => updateEntry(entry.id, 'value', e.target.value)}
            className={inputClasses}
            data-testid={`value-input-${index}`}
          />
          <button
            type="button"
            onClick={() => removeEntry(entry.id)}
            className="p-2 text-danger hover:text-red-800 hover:bg-red-50 rounded-md transition-colors dark:hover:text-red-300 dark:hover:bg-red-900/20"
            data-testid={`delete-button-${index}`}
            aria-label="Delete entry"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center gap-2 px-3 py-2 text-sm text-accent hover:text-accent-hover hover:bg-blue-50 rounded-md transition-colors dark:hover:bg-blue-900/20"
        data-testid="add-field-button"
      >
        <PlusIcon className="h-4 w-4" />
        Add field
      </button>
    </div>
  )
}

export default JsonEditor
