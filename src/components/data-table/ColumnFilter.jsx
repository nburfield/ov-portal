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
        className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-bg-card text-text-primary"
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
          className="block px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-bg-card text-text-primary"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setValue({ ...value, to: e.target.value })}
          className="block px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-bg-card text-text-primary"
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
      className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-bg-card text-text-primary"
    />
  )
}

export default ColumnFilter
