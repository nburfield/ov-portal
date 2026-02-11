import { useState, useEffect, useCallback, useMemo } from 'react'

export function useApiQuery(serviceFn, params) {
  const finalParams = useMemo(() => params ?? {}, [params])
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await serviceFn(finalParams)
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [serviceFn, finalParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch }
}
