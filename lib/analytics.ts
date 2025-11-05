// =====================================================
// Analytics Tracking System
// Sistema completo de tracking e métricas
// =====================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)

// Client-side Supabase (for tracking user events) - only create if configured
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null

// Server-side Supabase (for analytics queries) - only create if configured
export const supabaseAdmin = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseServiceKey!) : null

// =====================================================
// TRACKING FUNCTIONS (Client-side)
// =====================================================

export interface PageViewData {
  page: string
  referrer?: string
  userAgent?: string
  sessionId?: string
  locale?: string
}

export interface BlogPostViewData {
  postId: string
  postSlug: string
  title: string
  readTime?: number
  scrollDepth?: number
  locale?: string
}

// Track page view
export async function trackPageView(data: PageViewData) {
  // Skip tracking if Supabase is not configured
  if (!supabase) {
    console.log('[Analytics] Supabase not configured, skipping page view tracking')
    return
  }

  try {
    const { error } = await supabase
      .from('analytics_page_views')
      .insert({
        page: data.page,
        referrer: data.referrer || document?.referrer || null,
        user_agent: data.userAgent || navigator?.userAgent || null,
        session_id: data.sessionId || generateSessionId(),
        locale: data.locale || 'pt-BR',
        timestamp: new Date().toISOString(),
        ip_address: null // Will be handled by Supabase Edge Functions
      })

    if (error) {
      console.warn('[Analytics] Page view tracking failed:', error)
    }
  } catch (error) {
    console.warn('[Analytics] Page view tracking error:', error)
  }
}

// Track blog post view
export async function trackBlogPostView(data: BlogPostViewData) {
  // Skip tracking if Supabase is not configured
  if (!supabase) {
    console.log('[Analytics] Supabase not configured, skipping blog post view tracking')
    return
  }

  try {
    const { error } = await supabase
      .from('analytics_blog_views')
      .insert({
        post_id: data.postId,
        post_slug: data.postSlug,
        post_title: data.title,
        read_time_seconds: data.readTime || 0,
        scroll_depth_percent: data.scrollDepth || 0,
        locale: data.locale || 'pt-BR',
        timestamp: new Date().toISOString(),
        session_id: generateSessionId()
      })

    if (error) {
      console.warn('[Analytics] Blog view tracking failed:', error)
    }
  } catch (error) {
    console.warn('[Analytics] Blog view tracking error:', error)
  }
}

// Track custom event
export async function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Skip tracking if Supabase is not configured
  if (!supabase) {
    console.log('[Analytics] Supabase not configured, skipping event tracking')
    return
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventName,
        properties: properties || {},
        timestamp: new Date().toISOString(),
        session_id: generateSessionId()
      })

    if (error) {
      console.warn('[Analytics] Event tracking failed:', error)
    }
  } catch (error) {
    console.warn('[Analytics] Event tracking error:', error)
  }
}

// =====================================================
// ANALYTICS QUERIES (Server-side)
// =====================================================

export async function getPageViewsAnalytics(period: string = '30d') {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured')
  }

  try {
    const dateRange = getDateRange(period)
    
    const { data, error } = await supabaseAdmin
      .from('analytics_page_views')
      .select('*')
      .gte('timestamp', dateRange.start)
      .lte('timestamp', dateRange.end)

    if (error) throw error

    return processPageViewsData(data || [])
  } catch (error) {
    console.error('[Analytics] Page views query failed:', error)
    return null
  }
}

export async function getBlogAnalytics(period: string = '30d') {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured')
  }

  try {
    const dateRange = getDateRange(period)
    
    // Get blog views
    const { data: blogViews, error: blogError } = await supabaseAdmin
      .from('analytics_blog_views')
      .select('*')
      .gte('timestamp', dateRange.start)
      .lte('timestamp', dateRange.end)

    if (blogError) throw blogError

    // Get blog posts for context
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, published_at, locale')
      .eq('published', true)

    if (postsError) throw postsError

    return processBlogAnalytics(blogViews || [], posts || [], period)
  } catch (error) {
    console.error('[Analytics] Blog analytics query failed:', error)
    return null
  }
}

export async function getTopContent(limit: number = 10) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured')
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('analytics_blog_views')
      .select('post_title, post_slug, post_id')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (error) throw error

    // Count views by post
    const viewCounts = (data || []).reduce((acc, view) => {
      const key = view.post_slug
      if (!acc[key]) {
        acc[key] = {
          title: view.post_title,
          slug: view.post_slug,
          id: view.post_id,
          views: 0
        }
      }
      acc[key].views++
      return acc
    }, {} as Record<string, any>)

    return Object.values(viewCounts)
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, limit)
  } catch (error) {
    console.error('[Analytics] Top content query failed:', error)
    return []
  }
}

export async function getRealTimeStats() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not configured')
  }

  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Active users (last hour)
    const { count: activeUsers } = await supabaseAdmin
      .from('analytics_page_views')
      .select('session_id', { count: 'exact', head: true })
      .gte('timestamp', oneHourAgo.toISOString())

    // Page views (last 24h)
    const { count: dailyViews } = await supabaseAdmin
      .from('analytics_page_views')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', oneDayAgo.toISOString())

    // Blog views (last 24h)
    const { count: dailyBlogViews } = await supabaseAdmin
      .from('analytics_blog_views')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', oneDayAgo.toISOString())

    return {
      activeUsers: activeUsers || 0,
      dailyViews: dailyViews || 0,
      dailyBlogViews: dailyBlogViews || 0,
      timestamp: now.toISOString()
    }
  } catch (error) {
    console.error('[Analytics] Real-time stats failed:', error)
    return {
      activeUsers: 0,
      dailyViews: 0,
      dailyBlogViews: 0,
      timestamp: new Date().toISOString()
    }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function generateSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('analytics_session')
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session', sessionId)
    }
    return sessionId
  }
  return `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getDateRange(period: string) {
  const end = new Date()
  const start = new Date()

  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start.setDate(start.getDate() - 90)
      break
    case '1y':
      start.setFullYear(start.getFullYear() - 1)
      break
    default:
      start.setDate(start.getDate() - 30)
  }

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function processPageViewsData(data: any[]) {
  const dailyStats: Record<string, { views: number, visitors: number }> = {}
  const uniqueVisitors = new Set<string>()

  data.forEach(view => {
    const date = view.timestamp.split('T')[0]
    if (!dailyStats[date]) {
      dailyStats[date] = { views: 0, visitors: 0 }
    }
    dailyStats[date].views++
    
    const visitorKey = `${date}-${view.session_id}`
    if (!uniqueVisitors.has(visitorKey)) {
      dailyStats[date].visitors++
      uniqueVisitors.add(visitorKey)
    }
  })

  return {
    totalViews: data.length,
    totalVisitors: uniqueVisitors.size,
    dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      views: stats.views,
      visitors: stats.visitors
    }))
  }
}

function processBlogAnalytics(blogViews: any[], posts: any[], period: string) {
  const totalViews = blogViews.length
  const uniquePosts = new Set(blogViews.map(v => v.post_id)).size
  
  // Calculate average read time
  const validReadTimes = blogViews
    .map(v => v.read_time_seconds)
    .filter(t => t > 0 && t < 3600) // Between 0 and 1 hour
  
  const avgReadTime = validReadTimes.length > 0
    ? Math.round(validReadTimes.reduce((sum, time) => sum + time, 0) / validReadTimes.length)
    : 0

  // Get top posts
  const postViews: Record<string, { title: string, slug: string, views: number }> = {}
  blogViews.forEach(view => {
    if (!postViews[view.post_id]) {
      postViews[view.post_id] = {
        title: view.post_title,
        slug: view.post_slug,
        views: 0
      }
    }
    postViews[view.post_id].views++
  })

  const topPosts = Object.values(postViews)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  return {
    totalViews,
    uniquePosts,
    avgReadTimeSeconds: avgReadTime,
    topPosts,
    posts: posts.filter(p => p.published_at),
    period
  }
}

// =====================================================
// REACT HOOKS
// =====================================================

// Hook para tracking automático de page views
export function usePageViewTracking() {
  if (typeof window === 'undefined') return

  const trackCurrentPage = () => {
    trackPageView({
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      locale: document.documentElement.lang || 'pt-BR'
    })
  }

  // Track on mount
  trackCurrentPage()

  // Track on route changes (for SPA navigation)
  return trackCurrentPage
}