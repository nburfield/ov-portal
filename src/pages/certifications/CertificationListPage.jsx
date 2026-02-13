import React, { useState, useMemo } from 'react'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userserviceService } from '../../services/userservice.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import CreateCertificationModal from '../../components/modals/CreateCertificationModal'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { ArrowPathIcon, PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { isBefore, addDays } from 'date-fns'

const CertificationListPage = () => {
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: certifications = [], isLoading, refetch } = useApiQuery(userserviceService.getAll)

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value)
    setSearchTerm(e.target.value)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setStatusFilter('')
  }

  const getCertificationStatus = (expiresAt) => {
    if (!expiresAt) return 'Active'
    const now = new Date()
    const expiryDate = new Date(expiresAt)
    if (isBefore(expiryDate, now)) return 'Expired'
    if (isBefore(expiryDate, addDays(now, 30))) return 'Expiring Soon'
    return 'Active'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Expiring Soon':
        return 'warning'
      case 'Expired':
        return 'error'
      default:
        return 'default'
    }
  }

  const certificationsData = useMemo(() => {
    if (Array.isArray(certifications)) return certifications
    if (Array.isArray(certifications?.values)) return certifications.values
    return []
  }, [certifications])

  const filteredCertifications = useMemo(() => {
    let filtered = certificationsData

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter((cert) => {
        const userName = `${cert.user?.first_name} ${cert.user?.last_name}`.toLowerCase()
        const serviceName = cert.service?.name?.toLowerCase() || ''
        return userName.includes(lowerSearch) || serviceName.includes(lowerSearch)
      })
    }

    if (statusFilter) {
      filtered = filtered.filter((cert) => getCertificationStatus(cert.expires_at) === statusFilter)
    }

    return filtered
  }, [certificationsData, searchTerm, statusFilter])

  const handleCreateCertification = () => {
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
  }

  const handleSaveCertification = async (certificationData) => {
    try {
      await userserviceService.create(certificationData)
      showToast('Certification created successfully', 'success')
      refetch()
      handleCloseModal()
    } catch {
      showToast('Failed to save certification', 'error')
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(filteredCertifications, columns, 'certifications')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredCertifications, columns, 'Certifications Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
  }

  const columns = [
    {
      accessorKey: 'user',
      header: 'Worker',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.user?.first_name} {row.original.user?.last_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.user?.email}</div>
        </div>
      ),
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.original.service?.name}
        </div>
      ),
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.service?.name?.toLowerCase().includes(filterValue.toLowerCase())
      },
    },
    {
      accessorKey: 'certified_at',
      header: 'Certified At',
      cell: ({ row }) =>
        row.original.certified_at
          ? formatters.formatDate(new Date(row.original.certified_at))
          : 'N/A',
      enableSorting: true,
    },
    {
      accessorKey: 'expires_at',
      header: 'Expires At',
      cell: ({ row }) =>
        row.original.expires_at
          ? formatters.formatDate(new Date(row.original.expires_at))
          : 'Never',
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = getCertificationStatus(row.original.expires_at)
        return <Badge status={getStatusColor(status)}>{status}</Badge>
      },
      enableSorting: false,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        const status = getCertificationStatus(row.original.expires_at)
        return status === filterValue
      },
    },
  ]

  const hasActiveFilters = searchTerm || statusFilter

  return (
    <div data-testid="certifications-page" className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                Certifications
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage worker service certifications ({filteredCertifications.length} of{' '}
                {certificationsData.length || 0} total)
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
                onClick={handleCreateCertification}
                data-testid="create-certification-button"
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCertifications}
          isLoading={isLoading}
          enableSelection={false}
          initialPagination={{ pageIndex: 0, pageSize: 25 }}
          variant="rounded"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          filterBar={{
            searchPlaceholder: 'Search by worker or service...',
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
                  { value: 'Active', label: 'Active' },
                  { value: 'Expiring Soon', label: 'Expiring Soon' },
                  { value: 'Expired', label: 'Expired' },
                ],
              },
            ],
            onClearFilters: handleClearFilters,
            hasActiveFilters,
            onExportCSV: handleExportCSV,
            onExportPDF: handleExportPDF,
          }}
        />

        <CreateCertificationModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onSuccess={handleSaveCertification}
        />
      </div>
    </div>
  )
}

export default CertificationListPage
