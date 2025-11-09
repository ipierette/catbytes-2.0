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
        await fetch(`/api/blog/posts/${slug}`, {
          method: 'GET',
          headers: {
            'x-increment-views': 'true',
          },
        })
      } catch (error) {
        console.error('Failed to increment view count:', error)
      }
    }

    incrementView()
  }, [slug]) // Only run once when slug changes

  return null // This component doesn't render anything
}
