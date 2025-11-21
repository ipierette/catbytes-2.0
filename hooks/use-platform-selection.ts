'use client'

import { useState, useCallback } from 'react'
import { PlatformSelections, Platform } from '@/types/vlog'

export function usePlatformSelection() {
  const [platforms, setPlatforms] = useState<PlatformSelections>({
    instagram_feed: false,
    instagram_reels: false,
    linkedin: false
  })

  const togglePlatform = useCallback((platform: Platform, checked: boolean) => {
    setPlatforms(prev => ({ ...prev, [platform]: checked }))
  }, [])

  const getSelectedPlatforms = useCallback((): Platform[] => {
    return Object.entries(platforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform as Platform)
  }, [platforms])

  const hasSelection = useCallback(() => {
    return Object.values(platforms).some(Boolean)
  }, [platforms])

  const reset = useCallback(() => {
    setPlatforms({
      instagram_feed: false,
      instagram_reels: false,
      linkedin: false
    })
  }, [])

  return {
    platforms,
    togglePlatform,
    getSelectedPlatforms,
    hasSelection,
    reset
  }
}
