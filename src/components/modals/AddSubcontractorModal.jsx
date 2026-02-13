import React, { useState } from 'react'
import { XMarkIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import SearchableSelect from '../ui/SearchableSelect'
import { useToast } from '../../hooks/useToast'
import { getAll as getAllBusinesses } from '../../services/business.service'

const AddSubcontractorModal = ({
  isOpen,
  onClose,
  onSuccess,
  existingSubcontractors = [],
  currentBusinessKey,
}) => {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState('')

  const loadBusinessOptions = async (search) => {
    try {
      const businesses = await getAllBusinesses({ search })
      return businesses
        .filter(
          (b) =>
            b.key !== currentBusinessKey &&
            !existingSubcontractors.some((s) => s.business_key === b.key)
        )
        .map((b) => ({ value: b.key, label: b.name }))
    } catch {
      return []
    }
  }

  const handleSubmit = async () => {
    if (!selectedBusiness) {
      showToast('Please select a business', 'error')
      return
    }

    setIsLoading(true)
    try {
      await onSuccess(selectedBusiness)
      setSelectedBusiness('')
    } catch {
      showToast('Failed to add subcontractor', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) {
            setSelectedBusiness('')
            onClose()
          }
        }}
      />
      <div className="relative bg-bg-card rounded-xl shadow-xl border border-border/50 w-full max-w-xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <UserPlusIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Add Subcontractor</h2>
              <p className="text-sm text-text-tertiary">
                Search and add a business as subcontractor
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedBusiness('')
              onClose()
            }}
            disabled={isLoading}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-5">
            <SearchableSelect
              label="Search Business"
              value={selectedBusiness}
              onChange={setSelectedBusiness}
              loadOptions={loadBusinessOptions}
              placeholder="Type to search businesses..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/50 bg-bg-tertiary/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedBusiness('')
              onClose()
            }}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedBusiness}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Adding...
              </>
            ) : (
              'Add Subcontractor'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddSubcontractorModal
