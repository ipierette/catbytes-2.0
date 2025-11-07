// =====================================================
// API Route: Newsletter Metrics
// GET /api/admin/newsletter/metrics
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

interface NewsletterMetrics {
  totalSubscribers: number
  verifiedSubscribers: number
  activeSubscribers: number
  unsubscribedCount: number
  subscribersByLanguage: {
    'pt-BR': number
    'en-US': number
  }
  recentSubscribers: Array<{
    email: string
    verified: boolean
    subscribed_at: string
    locale: string
  }>
  growthRate: number
  engagementMetrics: {
    totalEmailsSent: number
    totalEmailsOpened: number
    totalEmailsClicked: number
    averageOpenRate: number
    averageClickRate: number
  }
  subscribersByMonth: Array<{
    month: string
    count: number
  }>
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // ========================================
    // 1. Verify Admin Authentication
    // ========================================
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error || NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ========================================
    // 2. Check Supabase Admin
    // ========================================
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin not configured' },
        { status: 500 }
      )
    }

    // ========================================
    // 3. Fetch All Subscribers
    // ========================================
    const { data: allSubscribers, error: subscribersError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (subscribersError) {
      console.error('[Newsletter Metrics] Error fetching subscribers:', subscribersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    const subscribers = allSubscribers || []

    // ========================================
    // 4. Calculate Basic Metrics
    // ========================================
    const totalSubscribers = subscribers.length
    const verifiedSubscribers = subscribers.filter((s) => s.verified).length
    const activeSubscribers = subscribers.filter((s) => s.subscribed).length
    const unsubscribedCount = subscribers.filter((s) => !s.subscribed).length

    // Subscribers by language
    const subscribersByLanguage = {
      'pt-BR': subscribers.filter((s) => s.locale === 'pt-BR').length,
      'en-US': subscribers.filter((s) => s.locale === 'en-US').length,
    }

    // Recent subscribers (last 10)
    const recentSubscribers = subscribers
      .slice(0, 10)
      .map((sub) => ({
        email: sub.email,
        verified: sub.verified,
        subscribed_at: sub.subscribed_at,
        locale: sub.locale || 'pt-BR',
      }))

    // ========================================
    // 5. Calculate Growth Rate (Last 30 Days)
    // ========================================
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentSubs = subscribers.filter(
      (s) => new Date(s.subscribed_at) >= thirtyDaysAgo
    ).length
    const growthRate = totalSubscribers > 0 ? (recentSubs / totalSubscribers) * 100 : 0

    // ========================================
    // 6. Calculate Engagement Metrics
    // ========================================
    const totalEmailsSent = subscribers.reduce(
      (sum, s) => sum + (s.emails_sent_count || 0),
      0
    )
    const totalEmailsOpened = subscribers.reduce(
      (sum, s) => sum + (s.emails_opened_count || 0),
      0
    )
    const totalEmailsClicked = subscribers.reduce(
      (sum, s) => sum + (s.emails_clicked_count || 0),
      0
    )

    const averageOpenRate =
      totalEmailsSent > 0 ? (totalEmailsOpened / totalEmailsSent) * 100 : 0
    const averageClickRate =
      totalEmailsSent > 0 ? (totalEmailsClicked / totalEmailsSent) * 100 : 0

    const engagementMetrics = {
      totalEmailsSent,
      totalEmailsOpened,
      totalEmailsClicked,
      averageOpenRate: Number(averageOpenRate.toFixed(2)),
      averageClickRate: Number(averageClickRate.toFixed(2)),
    }

    // ========================================
    // 7. Calculate Subscribers by Month (Last 6 Months)
    // ========================================
    const subscribersByMonth: Array<{ month: string; count: number }> = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthCount = subscribers.filter((sub) => {
        const subDate = new Date(sub.subscribed_at)
        return subDate >= monthStart && subDate <= monthEnd
      }).length

      subscribersByMonth.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        count: monthCount,
      })
    }

    // ========================================
    // 8. Build Response
    // ========================================
    const metrics: NewsletterMetrics = {
      totalSubscribers,
      verifiedSubscribers,
      activeSubscribers,
      unsubscribedCount,
      subscribersByLanguage,
      recentSubscribers,
      growthRate: Number(growthRate.toFixed(2)),
      engagementMetrics,
      subscribersByMonth,
    }

    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      metrics,
      executionTime,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Newsletter Metrics] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ========================================
// OPTIONS for CORS
// ========================================
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
