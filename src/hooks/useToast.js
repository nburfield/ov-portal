import toast from 'react-hot-toast'

export const useToast = () => {
  const showSuccess = (msg) => {
    toast.success(msg, {
      duration: 5000,
    })
  }

  const showError = (msg) => {
    toast.error(msg, {
      duration: 5000,
    })
  }

  const showWarning = (msg) => {
    toast(msg, {
      duration: 5000,
      icon: '⚠️',
    })
  }

  const showInfo = (msg) => {
    toast(msg, {
      duration: 5000,
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
