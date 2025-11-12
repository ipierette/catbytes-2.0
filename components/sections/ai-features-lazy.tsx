'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the heavy AI Features section only on the client
const AIFeaturesSection = dynamic(() => import('./ai-features').then(m => m.AIFeatures), {
  ssr: false,
})

export function AIFeaturesLazy() {
  const [shouldLoad, setShouldLoad] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // If already decided to load, no need to observe
    if (shouldLoad) return

    // Prefer early load on desktop where CPU is stronger
    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) {
      // Preload quickly on desktop after a short delay to avoid blocking LCP
      const t = setTimeout(() => setShouldLoad(true), 400)
      return () => clearTimeout(t)
    }

    // On mobile, use IntersectionObserver to load only when close to viewport
    const node = sentinelRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      // Fallback: defer a bit on very old browsers
      const t = setTimeout(() => setShouldLoad(true), 1500)
      return () => clearTimeout(t)
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && (entry.isIntersecting || entry.intersectionRatio > 0)) {
          setShouldLoad(true)
          io.disconnect()
        }
      },
      {
        root: null,
        rootMargin: '200px', // begin loading slightly before entering viewport
        threshold: 0.01,
      }
    )

    io.observe(node)
    return () => io.disconnect()
  }, [shouldLoad])

  return (
    <div>
      {/* Sentinel used to detect proximity on mobile */}
      {!shouldLoad && (
        <div
          id="ai-features"
          ref={sentinelRef}
          className="py-20 px-4 bg-gray-50 dark:bg-gray-900"
        >
          <div className="container mx-auto">
            <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700 mb-6" />
            <div className="h-36 w-full rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
          </div>
        </div>
      )}

      {shouldLoad && <AIFeaturesSection />}
    </div>
  )
}
