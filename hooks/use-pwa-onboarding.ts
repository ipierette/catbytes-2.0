'use client'

import { useState, useEffect } from 'react'

export function usePWAOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Detecta se está rodando como PWA instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isPWAInstalled = isStandalone || isInWebAppiOS
    
    setIsPWA(isPWAInstalled)

    // Só mostra onboarding se for PWA E não tiver completado antes
    if (isPWAInstalled) {
      const hasCompleted = localStorage.getItem('catbytes-pwa-onboarding-v2') === 'true'
      
      if (!hasCompleted) {
        setShowOnboarding(true)
      }
    }
    
    setIsLoading(false)
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem('catbytes-pwa-onboarding-v2', 'true')
    setShowOnboarding(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('catbytes-pwa-onboarding-v2')
    setShowOnboarding(true)
  }

  return {
    showOnboarding,
    isLoading,
    isPWA,
    completeOnboarding,
    resetOnboarding,
  }
}
