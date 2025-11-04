'use client'

import { useEffect, useState } from 'react'

export function usePWADetection() {
  const [isPWA, setIsPWA] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      return isStandalone || isInWebAppiOS
    }

    setIsPWA(checkPWA())
    setIsLoading(false)
  }, [])

  return { isPWA, isLoading }
}
