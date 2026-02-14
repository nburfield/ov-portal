import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiQuery } from '../../hooks/useApiQuery'
import { serviceService } from '../../services/service.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import CreateServiceModal from '../../components/modals/CreateServiceModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import {
  ArrowPathIcon,
  EyeIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { debounce } from 'lodash'

const ServiceListPage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [unitFilter, setUnitFilter] = useState('')
  const { data, isLoading, refetch } = useApiQuery(serviceService.getAll)

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
    setUnitFilter('')
  }

  const servicesData = useMemo(() => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.values)) return data.values
    return []
  }, [data])

  const filteredServices = useMemo(() => {
    let filtered = servicesData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (service) =>
          service.name?.toLowerCase().includes(lowerSearch) ||
          service.description?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((service) => service.status === statusFilter)
    }

    if (unitFilter) {
      filtered = filtered.filter((service) => service.unit === unitFilter)
    }

    return filtered
  }, [servicesData, searchTerm, statusFilter, unitFilter])

  const handleRowClick = (row) => {
    navigate(`/services/${row.original.key}`)
  }

  const handleCreateService = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveService = async (serviceData) => {
    try {
      await serviceService.create(serviceData)
      showToast('Service created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to create service', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredServices, columns, 'services')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredServices, columns, 'Services Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.description}>
          {row.original.description || 'No description'}
        </div>
      ),
    },
    {
      accessorKey: 'default_price',
      header: 'Default Price',
      cell: ({ row }) => formatters.formatCurrency(row.original.default_price),
      enableSorting: true,
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => <Badge status="active">{row.original.unit}</Badge>,
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.unit === filterValue
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge status={row.original.status}>{row.original.status}</Badge>,
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.status === filterValue
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const service = row.original
        return (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/services/${service.key}`)
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

  const hasActiveFilters = searchTerm || statusFilter || unitFilter

  const uniqueUnits = useMemo(() => {
    const units = new Set()
    servicesData.forEach((service) => {
      if (service.unit) units.add(service.unit)
    })
    return Array.from(units).sort()
  }, [servicesData])

  return (
    <div data-testid="services-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
                Services
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your services ({filteredServices.length} of {servicesData.length || 0} total)
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
                onClick={handleCreateService}
                data-testid="create-service-button"
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Service
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredServices}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          enableSelection={true}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by name or description...',
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
              {
                id: 'unit',
                label: 'Unit',
                value: unitFilter,
                onChange: (e) => setUnitFilter(e.target.value),
                options: [
                  { value: '', label: 'All Units' },
                  ...uniqueUnits.map((unit) => ({ value: unit, label: unit })),
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
          bulkActions={null}
          onSelectionChange={() => {}}
        />

        {showCreateModal && (
          <CreateServiceModal
            isOpen={showCreateModal}
            onClose={handleCloseModal}
            onSuccess={handleSaveService}
          />
        )}
      </div>
    </div>
  )
}

export default ServiceListPage
