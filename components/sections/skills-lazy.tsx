'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Lazy load Skills section with SSR disabled
const SkillsSection = dynamic(() => import('./skills').then(mod => ({ default: mod.Skills })), {
  ssr: false,
  loading: () => (
    <section
      id="skills"
      className="py-20 bg-white dark:bg-gray-900"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-64 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-lg"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  ),
})

export function SkillsLazy() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Check if user is on desktop (viewport wider than 768px)
    const isDesktop = window.innerWidth >= 768

    if (isDesktop) {
      // Desktop: load immediately after a short delay
      const timer = setTimeout(() => setShouldLoad(true), 200)
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
    const placeholder = document.getElementById('skills')
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
        id="skills"
        className="py-20 bg-white dark:bg-gray-900"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-12 w-64 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-lg"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return <SkillsSection />
}
