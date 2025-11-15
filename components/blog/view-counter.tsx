'use client'

import { useEffect, useRef } from 'react'

interface ViewCounterProps {
  slug: string
  locale: string
}

export function ViewCounter({ slug, locale }: ViewCounterProps) {
  const hasIncremented = useRef(false)

  useEffect(() => {
    // Prevent double execution in development mode (React StrictMode)
    if (hasIncremented.current) {
      console.log('[ViewCounter] ⏭️  Skipping duplicate increment for:', slug)
      return
    }

    // Increment view count only once when component mounts
    const incrementView = async () => {
      try {
        console.log('[ViewCounter] Incrementing view for:', slug)
        hasIncremented.current = true
        
        const response = await fetch(`/api/blog/posts/${slug}`, {
          method: 'GET',
          headers: {
            'x-increment-views': 'true',
          },
        })
        
        if (!response.ok) {
          console.error('[ViewCounter] Failed to increment view:', response.status, response.statusText)
          hasIncremented.current = false // Reset on error to allow retry
        } else {
          console.log('[ViewCounter] ✅ View incremented successfully for:', slug)
        }
      } catch (error) {
        console.error('[ViewCounter] Exception incrementing view count:', error)
        hasIncremented.current = false // Reset on error to allow retry
      }
    }

    incrementView()
  }, [slug]) // Only run once when slug changes

  return null // This component doesn't render anything
}
