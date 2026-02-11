import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApiQuery } from '../src/hooks/useApiQuery'

describe('useApiQuery hook', () => {
  let mockServiceFn

  beforeEach(() => {
    mockServiceFn = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state and call service on mount', async () => {
    mockServiceFn.mockImplementation(() => Promise.resolve({ data: 'test' }))

    let rendered
    act(() => {
      rendered = renderHook(() => useApiQuery(mockServiceFn, { param: 'value' }))
    })
    const { result } = rendered

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ data: 'test' })
    expect(result.current.error).toBe(null)
    expect(mockServiceFn).toHaveBeenCalledWith({ param: 'value' })
  })

  it('should handle errors correctly', async () => {
    const testError = new Error('API Error')
    mockServiceFn.mockImplementation(() => Promise.reject(testError))

    let rendered
    act(() => {
      rendered = renderHook(() => useApiQuery(mockServiceFn))
    })
    const { result } = rendered

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(testError)
  })

  it('should refetch data when refetch is called', async () => {
    mockServiceFn.mockImplementation(() => Promise.resolve({ data: 'initial' }))

    let rendered
    act(() => {
      rendered = renderHook(() => useApiQuery(mockServiceFn))
    })
    const { result } = rendered

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ data: 'initial' })

    mockServiceFn.mockImplementation(() => Promise.resolve({ data: 'refetched' }))

    act(() => {
      result.current.refetch()
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ data: 'refetched' })
    expect(mockServiceFn).toHaveBeenCalledTimes(2)
  })

  it('should refetch when params change', async () => {
    mockServiceFn.mockImplementation((params) =>
      Promise.resolve({ data: params.id === 1 ? 'first' : 'second' })
    )

    const { result, rerender } = renderHook(({ params }) => useApiQuery(mockServiceFn, params), {
      initialProps: { params: { id: 1 } },
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ data: 'first' })

    rerender({ params: { id: 2 } })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toEqual({ data: 'second' })
    expect(mockServiceFn).toHaveBeenCalledWith({ id: 2 })
  })
})
