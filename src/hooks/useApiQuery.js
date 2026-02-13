import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

const pendingRequests = new Map()

function getRequestKey(serviceFn, params) {
  const fnName = serviceFn.name || serviceFn.toString().slice(0, 50)
  const paramsStr = JSON.stringify(params || {})
  return `${fnName}:${paramsStr}`
}

export function useApiQuery(serviceFn, params) {
  const finalParams = useMemo(() => params ?? {}, [params])
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  const lastRequestRef = useRef(null)

  const fetchData = useCallback(
    async (force = false) => {
      const requestKey = getRequestKey(serviceFn, finalParams)

      if (!force && lastRequestRef.current === requestKey) {
        return
      }

      if (pendingRequests.has(requestKey)) {
        const cachedPromise = pendingRequests.get(requestKey)
        try {
          const result = await cachedPromise
          setData(result)
          setIsLoading(false)
        } catch (err) {
          setError(err)
          setIsLoading(false)
        }
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setIsLoading(true)
      setError(null)

      const promise = serviceFn(finalParams, { signal: abortControllerRef.current.signal })
      pendingRequests.set(requestKey, promise)

      try {
        const result = await promise
        setData(result)
        lastRequestRef.current = requestKey
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        pendingRequests.delete(requestKey)
        setIsLoading(false)
      }
    },
    [serviceFn, finalParams]
  )

  useEffect(() => {
    fetchData()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  return { data, isLoading, error, refetch }
}
