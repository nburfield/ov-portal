import { useEffect } from 'react'
import { usePrompt } from 'react-router-dom'

export function useUnsavedChanges(isDirty) {
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = '' // Chrome requires returnValue to be set
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  usePrompt({
    when: isDirty,
    message: 'You have unsaved changes. Are you sure you want to leave?',
  })
}
