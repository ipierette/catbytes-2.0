'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView, trackEvent } from '@/lib/analytics'

interface AnalyticsTrackerProps {
  postId?: string
  postSlug?: string
  title?: string
}

export function AnalyticsTracker({ postId, postSlug, title }: AnalyticsTrackerProps = {}) {
  const pathname = usePathname()

  // Use blog tracking if props are provided
  useBlogPostTracking(postId || '', postSlug || '', title || '', !!(postId && postSlug && title))

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      console.log('%c[Analytics] 🚀 New page loaded:', 'color: #00ff00; font-weight: bold', pathname)
      
      // Supabase tracking
      trackPageView({
        page: pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        locale: document.documentElement.lang || 'pt-BR'
      })

      // Google Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: pathname,
          page_title: document.title,
          page_location: window.location.href
        })
        console.log('%c[Google Analytics] 📊 Page view sent:', 'color: #4285f4; font-weight: bold', pathname)
      }
    }
  }, [pathname])

  useEffect(() => {
    // Track session start
    trackEvent('session_start', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language
    })

    // Google Analytics - Session start
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'session_start', {
        engagement_time_msec: 100
      })
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackEvent('page_hidden', { pathname })
      } else if (document.visibilityState === 'visible') {
        trackEvent('page_visible', { pathname })
      }
    }

    // Track scroll depth
    let maxScroll = 0
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        
        // Track milestones: 25%, 50%, 75%, 100%
        if ([25, 50, 75, 100].includes(scrollPercent)) {
          trackEvent('scroll_depth', { 
            pathname, 
            depth: scrollPercent,
            timestamp: new Date().toISOString()
          })

          // Google Analytics - Scroll depth
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'scroll', {
              percent_scrolled: scrollPercent,
              page_path: pathname
            })
          }
        }
      }
    }

    // Track time on page
    const startTime = Date.now()
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      
      // Only track if user spent more than 10 seconds on page
      if (timeSpent > 10) {
        trackEvent('time_on_page', { 
          pathname, 
          timeSpent,
          scrollDepth: maxScroll
        })
      }
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}

// Hook para tracking de blog posts
export function useBlogPostTracking(postId: string, postSlug: string, title: string, isActive: boolean = true) {
  useEffect(() => {
    // Only track if active (modal is open)
    if (!isActive || !postId || !postSlug || !title) return

    let startTime = Date.now()
    let maxScroll = 0

    const trackReadingProgress = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      maxScroll = Math.max(maxScroll, scrollPercent)
    }

    const trackBlogView = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      
      // Only track if user spent more than 30 seconds reading
      if (timeSpent > 30) {
        import('@/lib/analytics').then(({ trackBlogPostView }) => {
          trackBlogPostView({
            postId,
            postSlug,
            title,
            readTime: timeSpent,
            scrollDepth: maxScroll,
            locale: document.documentElement.lang || 'pt-BR'
          })
        })
      }
    }

    // Track initial view after 3 seconds (to filter out bounces)
    const initialTimer = setTimeout(() => {
      import('@/lib/analytics').then(({ trackBlogPostView }) => {
        trackBlogPostView({
          postId,
          postSlug,
          title,
          readTime: 3,
          scrollDepth: 0,
          locale: document.documentElement.lang || 'pt-BR'
        })
      })
    }, 3000)

    window.addEventListener('scroll', trackReadingProgress, { passive: true })
    window.addEventListener('beforeunload', trackBlogView)

    return () => {
      clearTimeout(initialTimer)
      window.removeEventListener('scroll', trackReadingProgress)
      window.removeEventListener('beforeunload', trackBlogView)
      
      // Track final reading session
      trackBlogView()
    }
  }, [postId, postSlug, title, isActive])
}

// Component para tracking de performance
export function PerformanceTracker() {
  useEffect(() => {
    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          trackEvent('performance_measure', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          })
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })

    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      trackEvent('page_load_complete', {
        loadTime,
        pathname: window.location.pathname
      })
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}