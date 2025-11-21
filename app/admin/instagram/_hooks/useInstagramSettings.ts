import { useState, useEffect, useCallback } from 'react'
import type { InstagramSettings } from '@/lib/instagram'
import { REFRESH_INTERVALS } from '@/lib/instagram'

export type { InstagramSettings } from '@/lib/instagram'

export function useInstagramSettings() {
  const [settings, setSettings] = useState<InstagramSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/instagram/settings')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      const data = await response.json()
      setSettings(data.settings || null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      console.error('Erro ao carregar settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (
    updates: Partial<InstagramSettings>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/instagram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (response.ok && data.settings) {
        setSettings(prev => prev ? { ...prev, ...updates } : null)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Erro ao atualizar configurações' }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro de conexão'
      return { success: false, error: message }
    }
  }, [])

  const toggleAutoGeneration = useCallback(async (): Promise<boolean> => {
    if (!settings) return false

    const newValue = !settings.autoGenerationEnabled
    const result = await updateSettings({ autoGenerationEnabled: newValue })
    
    return result.success
  }, [settings, updateSettings])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    error,
    refetch: loadSettings,
    updateSettings,
    toggleAutoGeneration
  }
}
