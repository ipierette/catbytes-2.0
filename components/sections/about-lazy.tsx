'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Lazy load About section with SSR disabled
const AboutSection = dynamic(() => import('./about').then(mod => ({ default: mod.About })), {
  ssr: false,
  loading: () => (
    <section
      id="about"
      className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-blue-900/20"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-64 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-lg"></div>
            <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  ),
})

export function AboutLazy() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Check if user is on desktop (viewport wider than 768px)
    const isDesktop = window.innerWidth >= 768

    if (isDesktop) {
      // Desktop: load immediately after a short delay to prioritize Hero
      const timer = setTimeout(() => setShouldLoad(true), 100)
      return () => clearTimeout(timer)
    }

    // Mobile: use IntersectionObserver to load when near viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
        }
      },
      {
        rootMargin: '300px', // Start loading 300px before entering viewport
        threshold: 0.01,
      }
    )

    // Create a placeholder element to observe
    const placeholder = document.getElementById('about')
    if (placeholder) {
      observer.observe(placeholder)
    }

    return () => {
      if (placeholder) observer.unobserve(placeholder)
    }
  }, [])

  if (!shouldLoad) {
    return (
      <section
        id="about"
        className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-blue-900/20"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-12 w-64 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-lg"></div>
              <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return <AboutSection />
}
