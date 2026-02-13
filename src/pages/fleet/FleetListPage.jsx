import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { fleetassetService } from '../../services/fleetasset.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import CreateFleetAssetModal from '../../components/modals/CreateFleetAssetModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, EyeIcon, PlusIcon, TruckIcon } from '@heroicons/react/24/outline'
import { debounce } from 'lodash'

const FleetListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const { data, isLoading, refetch } = useApiQuery(fleetassetService.getAll)

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
    setTypeFilter('')
  }

  const fleetAssetsData = useMemo(() => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.values)) return data.values
    return []
  }, [data])

  const filteredFleetAssets = useMemo(() => {
    let filtered = fleetAssetsData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (asset) =>
          asset.identifier?.toLowerCase().includes(lowerSearch) ||
          asset.type?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((asset) => asset.status === statusFilter)
    }

    if (typeFilter) {
      filtered = filtered.filter((asset) => asset.type === typeFilter)
    }

    return filtered
  }, [fleetAssetsData, searchTerm, statusFilter, typeFilter])

  const handleRowClick = (row) => {
    navigate(`/fleet/${row.original.key}`)
  }

  const handleCreateAsset = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveAsset = async (assetData) => {
    try {
      await fleetassetService.create(assetData)
      showToast('Asset created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save asset', 'error')
    }
  }

  const handleBulkChangeStatus = async (newStatus) => {
    try {
      await Promise.all(
        selectedRows.map((row) => fleetassetService.update(row.original.key, { status: newStatus }))
      )
      showToast(
        `${selectedRows.length} asset${selectedRows.length > 1 ? 's' : ''} status updated successfully`,
        'success'
      )
      setSelectedRows([])
      refetch()
    } catch {
      showToast('Failed to update asset statuses', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredFleetAssets, columns, 'fleet-assets')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredFleetAssets, columns, 'Fleet Assets Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'identifier',
      header: 'Identifier',
      cell: ({ row }) => <span className="font-mono">{row.original.identifier}</span>,
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge status={row.original.type === 'truck' ? 'active' : 'warning'}>
          {row.original.type}
        </Badge>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusColors = {
          active: 'bg-green-600',
          out_of_service: 'bg-red-600',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${
              statusColors[status] || 'bg-gray-600'
            }`}
          >
            {status === 'out_of_service' ? 'Out of Service' : status}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'mileage',
      header: 'Mileage',
      cell: ({ row }) => formatters.formatNumber(row.original.mileage),
      enableSorting: true,
    },
    {
      accessorKey: 'maintenance_count',
      header: 'Maintenance',
      cell: ({ row }) => {
        const count = row.original.maintenance_count || 0
        const lastDate = row.original.last_maintenance_date
          ? ` (${formatters.formatDate(new Date(row.original.last_maintenance_date))})`
          : ''
        return `${count}${lastDate}`
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const asset = row.original
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/fleet/${asset.key}`)
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

  const hasActiveFilters = searchTerm || statusFilter || typeFilter

  const bulkActions =
    selectedRows.length > 0 ? (
      <div className="flex gap-2">
        <Button onClick={() => handleBulkChangeStatus('active')} variant="outline" size="sm">
          Set Active
        </Button>
        <Button
          onClick={() => handleBulkChangeStatus('out_of_service')}
          variant="outline"
          size="sm"
        >
          Set Out of Service
        </Button>
      </div>
    ) : null

  return (
    <div data-testid="fleet-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TruckIcon className="h-8 w-8 text-blue-600" />
                Fleet
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your fleet assets ({filteredFleetAssets.length} of{' '}
                {fleetAssetsData.length || 0} total)
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
              <Button onClick={handleCreateAsset} className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Asset
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredFleetAssets}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={true}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by identifier or type...',
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
                  { value: 'out_of_service', label: 'Out of Service' },
                ],
              },
              {
                id: 'type',
                label: 'Type',
                value: typeFilter,
                onChange: (e) => setTypeFilter(e.target.value),
                options: [
                  { value: '', label: 'All Types' },
                  { value: 'truck', label: 'Truck' },
                  { value: 'equipment', label: 'Equipment' },
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
            bulkActions,
          }}
          onSelectionChange={setSelectedRows}
        />

        {showCreateModal && (
          <CreateFleetAssetModal
            isOpen={showCreateModal}
            onClose={handleCloseModal}
            onSuccess={handleSaveAsset}
          />
        )}
      </div>
    </div>
  )
}

export default FleetListPage
