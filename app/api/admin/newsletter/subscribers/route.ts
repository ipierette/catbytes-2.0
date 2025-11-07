// =====================================================
// API Route: Newsletter Subscribers List
// GET /api/admin/newsletter/subscribers
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

interface SubscribersQuery {
  page: number
  limit: number
  verified?: boolean | 'all'
  subscribed?: boolean | 'all'
  language?: 'pt-BR' | 'en-US' | 'all'
  search?: string
  orderBy?: 'created_at' | 'email' | 'subscribed_at'
  orderDirection?: 'asc' | 'desc'
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
    // 3. Parse Query Parameters
    // ========================================
    const { searchParams } = new URL(request.url)
    
    // Parse verified filter
    const verifiedParam = searchParams.get('verified')
    const verified = verifiedParam === 'true' ? true : (verifiedParam === 'false' ? false : 'all')
    
    // Parse subscribed filter
    const subscribedParam = searchParams.get('subscribed')
    const subscribed = subscribedParam === 'true' ? true : (subscribedParam === 'false' ? false : 'all')
    
    const query: SubscribersQuery = {
      page: Number.parseInt(searchParams.get('page') || '1', 10),
      limit: Number.parseInt(searchParams.get('limit') || '20', 10),
      verified,
      subscribed,
      language: (searchParams.get('language') as SubscribersQuery['language']) || 'all',
      search: searchParams.get('search') || undefined,
      orderBy: (searchParams.get('orderBy') as SubscribersQuery['orderBy']) || 'created_at',
      orderDirection: (searchParams.get('orderDirection') as SubscribersQuery['orderDirection']) || 'desc',
    }

    // Validate pagination
    if (query.page < 1) query.page = 1
    if (query.limit < 1 || query.limit > 100) query.limit = 20

    // ========================================
    // 4. Build Query
    // ========================================
    const from = (query.page - 1) * query.limit
    const to = from + query.limit - 1

    let supabaseQuery = supabaseAdmin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })

    // Filter by verified status
    if (query.verified !== 'all') {
      supabaseQuery = supabaseQuery.eq('verified', query.verified)
    }

    // Filter by subscribed status
    if (query.subscribed !== 'all') {
      supabaseQuery = supabaseQuery.eq('subscribed', query.subscribed)
    }

    // Filter by language
    if (query.language && query.language !== 'all') {
      supabaseQuery = supabaseQuery.eq('locale', query.language)
    }

    // Search by email or name
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        `email.ilike.%${query.search}%,name.ilike.%${query.search}%`
      )
    }

    // Order by
    const ascending = query.orderDirection === 'asc'
    const orderByField: string = query.orderBy || 'created_at'
    supabaseQuery = supabaseQuery.order(orderByField, { ascending })

    // Pagination
    supabaseQuery = supabaseQuery.range(from, to)

    // ========================================
    // 5. Execute Query
    // ========================================
    const { data, error, count } = await supabaseQuery

    if (error) {
      console.error('[Newsletter Subscribers] Query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscribers', details: error.message },
        { status: 500 }
      )
    }

    // ========================================
    // 6. Sanitize Response (Remove sensitive data)
    // ========================================
    const sanitizedSubscribers = (data || []).map((sub) => ({
      id: sub.id,
      email: sub.email,
      name: sub.name,
      verified: sub.verified,
      subscribed: sub.subscribed,
      locale: sub.locale,
      preferred_language: sub.preferred_language,
      subscribed_at: sub.subscribed_at,
      verified_at: sub.verified_at,
      unsubscribed_at: sub.unsubscribed_at,
      source: sub.source,
      emails_sent_count: sub.emails_sent_count,
      emails_opened_count: sub.emails_opened_count,
      emails_clicked_count: sub.emails_clicked_count,
    }))

    // ========================================
    // 7. Calculate Metadata
    // ========================================
    const total = count || 0
    const totalPages = Math.ceil(total / query.limit)

    // ========================================
    // 8. Return Success Response
    // ========================================
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      subscribers: sanitizedSubscribers,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
      filters: {
        verified: query.verified,
        subscribed: query.subscribed,
        language: query.language,
        search: query.search,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
      },
      executionTime,
    })
  } catch (error) {
    console.error('[Newsletter Subscribers] Unexpected error:', error)
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
