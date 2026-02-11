import React from 'react'

const ColumnFilter = ({ column }) => {
  const type = column.columnDef.meta?.type || 'text'
  const value = column.getFilterValue() || ''
  const setValue = (val) => column.setFilterValue(val)

  if (type === 'select') {
    const options = column.columnDef.meta?.options || []
    return (
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  if (type === 'date') {
    const from = value.from || ''
    const to = value.to || ''
    return (
      <div className="flex space-x-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setValue({ ...value, from: e.target.value })}
          className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setValue({ ...value, to: e.target.value })}
          className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    )
  }

  // default text
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Filter..."
      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    />
  )
}

export default ColumnFilter
