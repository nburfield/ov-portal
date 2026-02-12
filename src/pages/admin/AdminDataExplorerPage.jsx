import React, { useState } from 'react'
import { getAll as getUsers } from '../../services/user.service'
import { getAll as getBusinesses } from '../../services/business.service'
import { getAll as getServices } from '../../services/service.service'
import { getAll as getCustomers } from '../../services/customer.service'
import { getAll as getLocations } from '../../services/location.service'
import { getAll as getFleetAssets } from '../../services/fleetasset.service'
import { getAll as getWorkOrders } from '../../services/workorder.service'
import { getAll as getWorkTasks } from '../../services/worktask.service'
import { getAll as getInvoices } from '../../services/invoice.service'
import { getAll as getInvoiceLineItems } from '../../services/invoicelineitem.service'
import { getAll as getUserRoles } from '../../services/userrole.service'
import { getAll as getUserServices } from '../../services/userservice.service'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useToast } from '../../hooks/useToast'

const AdminDataExplorerPage = () => {
  const { showToast } = useToast()

  const [selectedObjectType, setSelectedObjectType] = useState('')
  const [filters, setFilters] = useState([{ key: '', value: '' }])
  const [results, setResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  const objectTypes = [
    { value: 'users', label: 'Users' },
    { value: 'businesses', label: 'Businesses' },
    { value: 'services', label: 'Services' },
    { value: 'customers', label: 'Customers' },
    { value: 'locations', label: 'Locations' },
    { value: 'fleetassets', label: 'Fleet Assets' },
    { value: 'workorders', label: 'Work Orders' },
    { value: 'worktasks', label: 'Work Tasks' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'invoicelineitems', label: 'Invoice Line Items' },
    { value: 'userroles', label: 'User Roles' },
    { value: 'userservices', label: 'User Services' },
  ]

  const services = {
    users: { getAll: getUsers },
    businesses: { getAll: getBusinesses },
    services: { getAll: getServices },
    customers: { getAll: getCustomers },
    locations: { getAll: getLocations },
    fleetassets: { getAll: getFleetAssets },
    workorders: { getAll: getWorkOrders },
    worktasks: { getAll: getWorkTasks },
    invoices: { getAll: getInvoices },
    invoicelineitems: { getAll: getInvoiceLineItems },
    userroles: { getAll: getUserRoles },
    userservices: { getAll: getUserServices },
  }

  const handleSearch = async () => {
    if (!selectedObjectType) {
      showToast('Please select an object type', 'error')
      return
    }

    setIsSearching(true)
    try {
      const service = services[selectedObjectType]
      const filterParams = {}

      // Build filter params from filters, excluding empty keys
      filters.forEach((filter) => {
        if (filter.key.trim()) {
          filterParams[filter.key.trim()] = filter.value.trim()
        }
      })

      const data = await service.getAll(filterParams)
      setResults(data)
    } catch {
      showToast('Failed to fetch data', 'error')
      setResults(null)
    } finally {
      setIsSearching(false)
    }
  }

  const addFilter = () => {
    setFilters([...filters, { key: '', value: '' }])
  }

  const updateFilter = (index, field, value) => {
    const newFilters = [...filters]
    newFilters[index][field] = value
    setFilters(newFilters)
  }

  const removeFilter = (index) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        {/* <DatabaseIcon className="h-6 w-6" /> */}
        <h1 className="text-2xl font-bold">Admin - Data Explorer</h1>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
        {/* Object Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Object Type</label>
          <Select
            value={selectedObjectType}
            onChange={setSelectedObjectType}
            options={objectTypes}
            placeholder="Select an object type..."
          />
        </div>

        {/* Filters */}
        <div>
          <label className="block text-sm font-medium mb-2">Filters</label>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Filter key"
                  value={filter.key}
                  onChange={(e) => updateFilter(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Filter value"
                  value={filter.value}
                  onChange={(e) => updateFilter(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFilter(index)}
                  disabled={filters.length === 1}
                  className="p-2"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFilter}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Filter
            </Button>
          </div>
        </div>

        {/* Search Button */}
        <div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !selectedObjectType}
            className="w-full"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default AdminDataExplorerPage
