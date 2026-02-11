import { toast } from 'react-toastify'

export const useToast = () => {
  const showSuccess = (msg) => {
    toast.success('Success', {
      description: msg,
      autoClose: 5000,
    })
  }

  const showError = (msg) => {
    toast.error('Error', {
      description: msg,
      autoClose: false,
    })
  }

  const showWarning = (msg) => {
    toast.warning('Warning', {
      description: msg,
      autoClose: 5000,
    })
  }

  const showInfo = (msg) => {
    toast.info('Info', {
      description: msg,
      autoClose: 5000,
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
