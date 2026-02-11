import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUnsavedChanges } from '../src/hooks/useUnsavedChanges'

// Mock react-router-dom's usePrompt
vi.mock('react-router-dom', () => ({
  usePrompt: vi.fn(),
}))

import { usePrompt } from 'react-router-dom'

describe('useUnsavedChanges hook', () => {
  let addEventListenerSpy
  let removeEventListenerSpy

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    vi.clearAllMocks()
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('should add beforeunload event listener when isDirty is true', () => {
    renderHook(() => useUnsavedChanges(true))

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('should not add beforeunload event listener when isDirty is false', () => {
    renderHook(() => useUnsavedChanges(false))

    expect(addEventListenerSpy).not.toHaveBeenCalled()
  })

  it('should remove beforeunload event listener on cleanup when isDirty becomes false', () => {
    const { rerender } = renderHook(({ isDirty }) => useUnsavedChanges(isDirty), {
      initialProps: { isDirty: true },
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))

    rerender({ isDirty: false })

    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
  })

  it('should call usePrompt with correct parameters when isDirty is true', () => {
    renderHook(() => useUnsavedChanges(true))

    expect(usePrompt).toHaveBeenCalledWith({
      when: true,
      message: 'You have unsaved changes. Are you sure you want to leave?',
    })
  })

  it('should call usePrompt with when: false when isDirty is false', () => {
    renderHook(() => useUnsavedChanges(false))

    expect(usePrompt).toHaveBeenCalledWith({
      when: false,
      message: 'You have unsaved changes. Are you sure you want to leave?',
    })
  })

  it('should prevent default and set returnValue on beforeunload event', () => {
    renderHook(() => useUnsavedChanges(true))

    const mockEvent = {
      preventDefault: vi.fn(),
      returnValue: '',
    }

    // Get the event handler that was added
    const eventHandler = addEventListenerSpy.mock.calls[0][1]

    eventHandler(mockEvent)

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(mockEvent.returnValue).toBe('')
  })
})
