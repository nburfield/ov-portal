import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { locationService } from '../../services/location.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import LocationModal from '../../components/modals/LocationModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, EyeIcon, PlusIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'

const LocationListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const { data, isLoading, refetch } = useApiQuery(locationService.getAll)

  const debouncedSetSearchTerm = useMemo(() => debounce((value) => setSearchTerm(value), 300), [])

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearchTerm(value)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setStatusFilter('')
  }

  const locationsData = useMemo(() => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.values)) return data.values
    return []
  }, [data])

  const filteredLocations = useMemo(() => {
    let filtered = locationsData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (location) =>
          location.address_1?.toLowerCase().includes(lowerSearch) ||
          location.city?.toLowerCase().includes(lowerSearch) ||
          location.zip?.toLowerCase().includes(lowerSearch) ||
          location.customer_name?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((location) => location.status === statusFilter)
    }

    return filtered
  }, [locationsData, searchTerm, statusFilter])

  const handleRowClick = (row) => {
    navigate(`/locations/${row.original.key}`)
  }

  const handleCreateLocation = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveLocation = async (locationData) => {
    try {
      await locationService.create(locationData)
      showToast('Location created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to create location', 'error')
    }
  }

  const handleBulkChangeStatus = async (newStatus) => {
    try {
      await Promise.all(
        selectedRows.map((row) => locationService.update(row.original.key, { status: newStatus }))
      )
      showToast(
        `${selectedRows.length} location${selectedRows.length > 1 ? 's' : ''} status updated successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to update location statuses', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredLocations, columns, 'locations')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredLocations, columns, 'Locations Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {formatters.formatAddress(row.original)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.original.city}, {row.original.state} {row.original.zip}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }) => row.original.customer_name || 'N/A',
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
    },
    {
      accessorKey: 'photos_count',
      header: 'Photos',
      cell: ({ row }) => row.original.photos_count || 0,
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const location = row.original
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/locations/${location.key}`)
            }}
            className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        )
      },
      enableSorting: false,
    },
  ]

  const hasActiveFilters = searchTerm || statusFilter

  const bulkActions =
    selectedRows.length > 0 ? (
      <div className="flex gap-2">
        <Button onClick={() => handleBulkChangeStatus('active')} variant="outline" size="sm">
          Set Active
        </Button>
        <Button onClick={() => handleBulkChangeStatus('inactive')} variant="outline" size="sm">
          Set Inactive
        </Button>
        <Button onClick={() => handleBulkChangeStatus('archived')} variant="outline" size="sm">
          Archive
        </Button>
      </div>
    ) : null

  return (
    <div data-testid="locations-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPinIcon className="h-8 w-8 text-blue-600" />
                Locations
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your locations ({filteredLocations.length} of {locationsData.length || 0}{' '}
                total)
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => refetch()}
                variant="secondary"
                className="inline-flex items-center"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleCreateLocation}
                data-testid="create-location-button"
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Location
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredLocations}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={true}
          onSelectionChange={setSelectedRows}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by address, city, or customer...',
            searchValue: searchInput,
            onSearchChange: handleSearchInputChange,
            advancedFilters: [
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                options: [
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'archived', label: 'Archived' },
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
            bulkActions,
          }}
        />

        {showCreateModal && (
          <LocationModal
            isOpen={showCreateModal}
            onClose={handleCloseModal}
            onSuccess={handleSaveLocation}
          />
        )}
      </div>
    </div>
  )
}

export default LocationListPage
