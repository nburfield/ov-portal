import React from 'react'
import { XMarkIcon, ClockIcon, UserIcon, CubeIcon } from '@heroicons/react/24/outline'
import { formatters } from '../../utils/formatters'

const AuditLogDetailsModal = ({ isOpen, onClose, auditLog }) => {
  if (!isOpen || !auditLog) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-bg-card rounded-xl shadow-xl border border-border/50 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <ClockIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Audit Log Details</h2>
              <p className="text-sm text-text-tertiary">View event details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-1">
                  Timestamp
                </label>
                <p className="text-text-primary">
                  {formatters.formatDateTime(new Date(auditLog.timestamp))}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-1">
                  Event Type
                </label>
                <p className="text-text-primary capitalize">
                  {auditLog.event_type?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-1 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Actor
                </label>
                <p className="text-text-primary">{auditLog.actor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-tertiary mb-1 flex items-center gap-2">
                  <CubeIcon className="w-4 h-4" />
                  Resource
                </label>
                <p className="text-text-primary">
                  {auditLog.resource_type}:{auditLog.resource_key}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-tertiary mb-1">Action</label>
              <p className="text-text-primary capitalize">{auditLog.action?.replace(/_/g, ' ')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-tertiary mb-1">
                Event Details
              </label>
              <pre className="text-sm bg-bg-secondary p-4 rounded border border-border overflow-x-auto">
                {JSON.stringify(auditLog.details || auditLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/50 bg-bg-tertiary/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuditLogDetailsModal
