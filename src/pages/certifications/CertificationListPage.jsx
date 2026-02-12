import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useApiQuery } from '../../hooks/useApiQuery'
import { userService } from '../../services/user.service'
import { serviceService } from '../../services/service.service'
import { userserviceService } from '../../services/userservice.service'
import DataTable from '../../components/data-table/DataTable'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SearchableSelect from '../../components/ui/SearchableSelect'
import DatePicker from '../../components/ui/DatePicker'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { exportToCSV, exportToPDF } from '../../utils/export'
import { isBefore, addDays } from 'date-fns'
import { PlusIcon } from '@heroicons/react/24/outline'

const CertificationListPage = () => {
  const { showToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: certifications = [], isLoading, refetch } = useApiQuery(userserviceService.getAll)

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
      exportToCSV(certifications, columns, 'certifications')
      showToast('CSV exported successfully', 'success')
    } catch {
      showToast('Failed to export CSV', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(certifications, columns, 'Certifications Report')
      showToast('PDF exported successfully', 'success')
    } catch {
      showToast('Failed to export PDF', 'error')
    }
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

  const columns = [
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => `${row.original.user?.first_name} ${row.original.user?.last_name}`,
      enableSorting: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ row }) => row.original.service?.name,
      enableSorting: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        return row.original.service?.name?.toLowerCase().includes(filterValue.toLowerCase())
      },
    },
    {
      accessorKey: 'certified_at',
      header: 'Certified At',
      cell: ({ row }) => formatters.formatDate(new Date(row.original.certified_at)),
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
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        const status = getCertificationStatus(row.original.expires_at)
        return status === filterValue
      },
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

  const emptyState = {
    title: 'No certifications found',
    description: 'Get started by adding your first certification.',
    action: {
      label: 'Add Certification',
      onClick: handleCreateCertification,
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Certifications</h1>
        <Button onClick={handleCreateCertification} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={certifications}
        isLoading={isLoading}
        emptyState={emptyState}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <CertificationFormModal
          certification={null}
          onSave={handleSaveCertification}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

const CertificationFormModal = ({ certification, onSave, onClose }) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: certification
      ? {
          user_key: certification.user_key,
          service_key: certification.service_key,
          certified_at: certification.certified_at,
          expires_at: certification.expires_at,
        }
      : {
          certified_at: new Date().toISOString().split('T')[0], // Default to today
        },
  })

  const loadUserOptions = async (searchTerm) => {
    try {
      const users = await userService.getAll({ search: searchTerm })
      return users
        .filter((user) => user.roles?.includes('worker'))
        .map((user) => ({
          value: user.key,
          label: `${user.first_name} ${user.last_name}`,
        }))
    } catch {
      return []
    }
  }

  const loadServiceOptions = async (searchTerm) => {
    try {
      const services = await serviceService.getAll({ search: searchTerm })
      return services
        .filter((service) => service.status === 'active')
        .map((service) => ({
          value: service.key,
          label: service.name,
        }))
    } catch {
      return []
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await onSave(data)
      reset()
    } catch {
      showToast('Failed to save certification', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!certification

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Certification' : 'Add Certification'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* User */}
        <div>
          <SearchableSelect
            label="User"
            value={watch('user_key')}
            onChange={(value) => setValue('user_key', value)}
            loadOptions={loadUserOptions}
            error={errors.user_key?.message}
            required
            placeholder="Search for a worker..."
          />
        </div>

        {/* Service */}
        <div>
          <SearchableSelect
            label="Service"
            value={watch('service_key')}
            onChange={(value) => setValue('service_key', value)}
            loadOptions={loadServiceOptions}
            error={errors.service_key?.message}
            required
            placeholder="Search for a service..."
          />
        </div>

        {/* Certified At */}
        <div>
          <DatePicker
            label="Certified At"
            value={watch('certified_at')}
            onChange={(value) => setValue('certified_at', value)}
            error={errors.certified_at?.message}
            required
          />
        </div>

        {/* Expires At */}
        <div>
          <DatePicker
            label="Expires At (optional)"
            value={watch('expires_at')}
            onChange={(value) => setValue('expires_at', value)}
            error={errors.expires_at?.message}
          />
        </div>

        <FormActions onSave={handleSubmit(onSubmit)} onCancel={onClose} loading={isLoading} />
      </form>
    </Modal>
  )
}

export default CertificationListPage
