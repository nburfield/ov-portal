import React, { useState, useEffect } from 'react'
import { useBusiness } from '../../hooks/useBusiness'
import { useApiQuery } from '../../hooks/useApiQuery'
import {
  businessService,
  addContract,
  uploadContract,
  addSubcontractor,
  removeSubcontractor,
} from '../../services/business.service'
import Tabs from '../../components/ui/Tabs'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import JsonEditor from '../../components/forms/JsonEditor'
import DataTable from '../../components/data-table/DataTable'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FileUpload from '../../components/ui/FileUpload'
import SearchableSelect from '../../components/ui/SearchableSelect'
import FormActions from '../../components/forms/FormActions'
import { useToast } from '../../hooks/useToast'
import { formatters } from '../../utils/formatters'
import { ClipboardIcon } from '@heroicons/react/24/outline'

const BusinessPage = () => {
  const { activeBusiness } = useBusiness()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('details')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [showAddContractModal, setShowAddContractModal] = useState(false)
  const [showAddSubcontractorModal, setShowAddSubcontractorModal] = useState(false)
  const [contractToUpload, setContractToUpload] = useState(null)
  const [selectedSubcontractor, setSelectedSubcontractor] = useState(null)

  const {
    data: business,
    isLoading,
    refetch,
  } = useApiQuery(businessService.getByKey, activeBusiness?.key, { enabled: !!activeBusiness?.key })

  useEffect(() => {
    if (business) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setFormData({
          name: business.name || '',
          type: business.type || 'primary',
          status: business.status || 'active',
          settings: business.settings || {},
        })
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [business])

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'contracts', label: 'Contracts' },
    { key: 'subcontractors', label: 'Subcontractors' },
    { key: 'parents', label: 'Parent Businesses' },
  ]

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(business.key)
      showToast('Business key copied to clipboard', 'success')
    } catch {
      showToast('Failed to copy key', 'error')
    }
  }

  const handleSaveDetails = async () => {
    try {
      await businessService.update(business.key, formData)
      showToast('Business details updated successfully', 'success')
      setIsEditing(false)
      refetch()
    } catch {
      showToast('Failed to update business details', 'error')
    }
  }

  const handleCancelEdit = () => {
    setFormData({
      name: business.name || '',
      type: business.type || 'primary',
      status: business.status || 'active',
      settings: business.settings || {},
    })
    setIsEditing(false)
  }

  const handleAddContract = async (contractData) => {
    try {
      await addContract(business.key, contractData)
      showToast('Contract added successfully', 'success')
      refetch()
      setShowAddContractModal(false)
    } catch {
      showToast('Failed to add contract', 'error')
    }
  }

  const handleUploadContract = async (contractKey, file) => {
    try {
      await uploadContract(business.key, contractKey, file)
      showToast('Contract uploaded successfully', 'success')
      refetch()
    } catch {
      showToast('Failed to upload contract', 'error')
    }
  }

  const handleViewContract = (contract) => {
    window.open(contract.get_url, '_blank')
  }

  const handleAddSubcontractor = async () => {
    if (!selectedSubcontractor) return
    try {
      await addSubcontractor(business.key, selectedSubcontractor)
      showToast('Subcontractor added successfully', 'success')
      refetch()
      setShowAddSubcontractorModal(false)
      setSelectedSubcontractor(null)
    } catch {
      showToast('Failed to add subcontractor', 'error')
    }
  }

  const handleRemoveSubcontractor = async (subcontractorKey) => {
    try {
      await removeSubcontractor(business.key, subcontractorKey)
      showToast('Subcontractor removed successfully', 'success')
      refetch()
    } catch {
      showToast('Failed to remove subcontractor', 'error')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!business) {
    return <div>No business found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <Badge status={business.status}>{business.status}</Badge>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
              {business.key}
            </code>
            <Button variant="ghost" size="sm" onClick={handleCopyKey} className="p-1">
              <ClipboardIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'details' && (
          <DetailsTab
            business={business}
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
            onEdit={() => setIsEditing(true)}
            onSave={handleSaveDetails}
            onCancel={handleCancelEdit}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractsTab
            contracts={business.contracts || []}
            onAdd={() => setShowAddContractModal(true)}
            onUpload={handleUploadContract}
            onView={handleViewContract}
          />
        )}

        {activeTab === 'subcontractors' && (
          <SubcontractorsTab
            subcontractors={business.subcontractors || []}
            onAdd={() => setShowAddSubcontractorModal(true)}
            onRemove={handleRemoveSubcontractor}
          />
        )}

        {activeTab === 'parents' && <ParentsTab parents={business.parents || []} />}
      </div>

      {/* Modals */}
      <AddContractModal
        isOpen={showAddContractModal}
        onClose={() => setShowAddContractModal(false)}
        onSubmit={handleAddContract}
        contractToUpload={contractToUpload}
        setContractToUpload={setContractToUpload}
      />

      <AddSubcontractorModal
        isOpen={showAddSubcontractorModal}
        onClose={() => setShowAddSubcontractorModal(false)}
        onSubmit={handleAddSubcontractor}
        selectedSubcontractor={selectedSubcontractor}
        setSelectedSubcontractor={setSelectedSubcontractor}
        businessKey={business.key}
      />
    </div>
  )
}

// Details Tab Component
const DetailsTab = ({ business, isEditing, formData, setFormData, onEdit, onSave, onCancel }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Business Details</h2>
        {!isEditing && <Button onClick={onEdit}>Edit</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          {isEditing ? (
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100">{business.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          {isEditing ? (
            <Select
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
              options={[
                { value: 'primary', label: 'Primary' },
                { value: 'subcontractor', label: 'Subcontractor' },
                { value: 'both', label: 'Both' },
              ]}
            />
          ) : (
            <Badge>{business.type}</Badge>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          {isEditing ? (
            <Select
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          ) : (
            <Badge status={business.status}>{business.status}</Badge>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Key</label>
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            {business.key}
          </code>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Created</label>
          <p className="text-gray-900 dark:text-gray-100">
            {formatters.formatDate(business.created_at)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Updated</label>
          <p className="text-gray-900 dark:text-gray-100">
            {formatters.formatDate(business.updated_at)}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Settings</label>
        {isEditing ? (
          <JsonEditor
            value={formData.settings}
            onChange={(settings) => setFormData({ ...formData, settings })}
          />
        ) : (
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(business.settings, null, 2)}
          </pre>
        )}
      </div>

      {isEditing && <FormActions onSave={onSave} onCancel={onCancel} />}
    </div>
  )
}

// Contracts Tab Component
const ContractsTab = ({ contracts, onAdd, onUpload, onView }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contracts</h2>
        <Button onClick={onAdd}>Add Contract</Button>
      </div>

      <DataTable
        data={contracts}
        columns={[
          {
            key: 'key',
            label: 'Contract Key',
            render: (row) => <code className="font-mono text-sm">{row.key}</code>,
          },
          { key: 'name', label: 'File Name' },
          {
            key: 'effective_date',
            label: 'Effective Date',
            render: (row) => formatters.formatDate(row.effective_date),
          },
          {
            key: 'expires_at',
            label: 'Expires At',
            render: (row) => formatters.formatDate(row.expires_at),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onView(row)}>
                  View
                </Button>
                <FileUpload
                  onFile={(file) => onUpload(row.key, file)}
                  accept=".pdf,.doc,.docx"
                  label=""
                  className="w-auto"
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

// Subcontractors Tab Component
const SubcontractorsTab = ({ subcontractors, onAdd, onRemove }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subcontractors</h2>
        <Button onClick={onAdd}>Add Subcontractor</Button>
      </div>

      <DataTable
        data={subcontractors}
        columns={[
          { key: 'name', label: 'Business Name' },
          {
            key: 'type',
            label: 'Type',
            render: (row) => <Badge>{row.type}</Badge>,
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status}>{row.status}</Badge>,
          },
          {
            key: 'added_at',
            label: 'Added Date',
            render: (row) => formatters.formatDate(row.added_at),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(row.key)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}

// Parents Tab Component
const ParentsTab = ({ parents }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Parent Businesses</h2>

      <DataTable
        data={parents}
        columns={[
          { key: 'name', label: 'Business Name' },
          {
            key: 'type',
            label: 'Type',
            render: (row) => <Badge>{row.type}</Badge>,
          },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status}>{row.status}</Badge>,
          },
          {
            key: 'added_at',
            label: 'Added Date',
            render: (row) => formatters.formatDate(row.added_at),
          },
        ]}
      />
    </div>
  )
}

// Add Contract Modal
const AddContractModal = ({ isOpen, onClose, onSubmit, contractToUpload, setContractToUpload }) => {
  const [formData, setFormData] = useState({ name: '', effective_date: '', expires_at: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...formData, file: contractToUpload })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Contract">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Effective Date"
          type="date"
          value={formData.effective_date}
          onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
          required
        />
        <Input
          label="Expires At"
          type="date"
          value={formData.expires_at}
          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
          required
        />
        <FileUpload label="Contract File" onFile={setContractToUpload} accept=".pdf,.doc,.docx" />
        <FormActions onSave={handleSubmit} onCancel={onClose} />
      </form>
    </Modal>
  )
}

// Add Subcontractor Modal
const AddSubcontractorModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedSubcontractor,
  setSelectedSubcontractor,
  businessKey,
}) => {
  const loadBusinessOptions = async (search) => {
    try {
      const businesses = await businessService.getAll({ search, limit: 20 })
      return businesses
        .filter((b) => b.key !== businessKey && b.type !== 'primary') // Exclude current business and primaries
        .map((b) => ({ value: b.key, label: b.name }))
    } catch {
      return []
    }
  }

  const handleSubmit = () => {
    onSubmit(selectedSubcontractor)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Subcontractor">
      <div className="space-y-4">
        <SearchableSelect
          label="Select Business"
          value={selectedSubcontractor}
          onChange={setSelectedSubcontractor}
          loadOptions={loadBusinessOptions}
          placeholder="Search for a business..."
          required
        />
        <FormActions onSave={handleSubmit} onCancel={onClose} />
      </div>
    </Modal>
  )
}

export default BusinessPage
