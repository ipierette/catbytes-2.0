import { useState, useCallback } from 'react'

interface UseFetchOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

/**
 * Hook para simplificar fetches em páginas admin
 * Gerencia loading, error e data automaticamente
 */
export function useAdminFetch<T = any>(options?: UseFetchOptions) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (
    url: string,
    init?: RequestInit
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, init)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro na requisição')
      }

      setData(result)
      options?.onSuccess?.(result)

      return { success: true, data: result }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      options?.onError?.(error)

      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }, [options])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

/**
 * Hook para fetch com polling automático
 */
export function useAdminPolling<T = any>(
  url: string,
  interval: number = 5000,
  options?: UseFetchOptions
) {
  const { data, loading, error, execute } = useAdminFetch<T>(options)
  const [polling, setPolling] = useState(false)

  const startPolling = useCallback(() => {
    setPolling(true)
    execute(url)

    const intervalId = setInterval(() => {
      execute(url)
    }, interval)

    return () => {
      clearInterval(intervalId)
      setPolling(false)
    }
  }, [url, interval, execute])

  return {
    data,
    loading,
    error,
    polling,
    startPolling,
    execute
  }
}
