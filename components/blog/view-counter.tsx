'use client'

import { useEffect } from 'react'

interface ViewCounterProps {
  slug: string
  locale: string
}

export function ViewCounter({ slug, locale }: ViewCounterProps) {
  useEffect(() => {
    // Increment view count only once when component mounts
    const incrementView = async () => {
      try {
        console.log('[ViewCounter] Incrementing view for:', slug)
        const response = await fetch(`/api/blog/posts/${slug}`, {
          method: 'GET',
          headers: {
            'x-increment-views': 'true',
          },
        })
        
        if (!response.ok) {
          console.error('[ViewCounter] Failed to increment view:', response.status, response.statusText)
        } else {
          console.log('[ViewCounter] ✅ View incremented successfully for:', slug)
        }
      } catch (error) {
        console.error('[ViewCounter] Exception incrementing view count:', error)
      }
    }

    incrementView()
  }, [slug]) // Only run once when slug changes

  return null // This component doesn't render anything
}
