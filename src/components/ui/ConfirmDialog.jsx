import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon: Icon,
}) => {
  const variants = {
    danger: { button: 'danger', icon: ExclamationTriangleIcon, iconColor: 'text-danger' },
    warning: { button: 'warning', icon: ExclamationTriangleIcon, iconColor: 'text-warning' },
    info: { button: 'primary', icon: ExclamationTriangleIcon, iconColor: 'text-info' },
  }

  const config = variants[variant] || variants.danger
  const IconComponent = Icon || config.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        {IconComponent && (
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <IconComponent className="h-6 w-6" />
          </div>
        )}
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={config.button} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
