import React from 'react'
import Modal from './Modal'
import Button from './Button'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
}) => {
  const buttonVariant = variant === 'accent' ? 'primary' : variant

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={buttonVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
