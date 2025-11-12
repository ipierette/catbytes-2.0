'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Load AnalyticsTracker only on the client and when we decide it's time
const AnalyticsTracker = dynamic(() => import('./analytics-tracker').then(m => m.AnalyticsTracker), {
  ssr: false,
})

export function DeferredAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let timeoutId: any

    const enable = () => setEnabled(true)

    // Prefer requestIdleCallback when available
    if (typeof (window as any).requestIdleCallback === 'function') {
      ;(window as any).requestIdleCallback(enable, { timeout: 2500 })
    } else {
      // Fallback: small delay so we don't compete with LCP
      timeoutId = setTimeout(enable, 1200)
    }

    // Also enable after first user interaction, in case idle never fires
    const onFirstInteraction = () => {
      setEnabled(true)
      window.removeEventListener('scroll', onFirstInteraction)
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
    window.addEventListener('scroll', onFirstInteraction, { passive: true })
    window.addEventListener('pointerdown', onFirstInteraction)
    window.addEventListener('keydown', onFirstInteraction)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', onFirstInteraction)
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [])

  if (!enabled) return null
  return <AnalyticsTracker />
}
