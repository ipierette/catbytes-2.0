// =====================================================
// API Route: Admin Posts Listing with Filters
// GET /api/admin/posts
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'
import type { BlogPost } from '@/types/blog'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

interface PostsQuery {
  page: number
  limit: number
  status?: 'draft' | 'published' | 'scheduled' | 'archived' | 'all'
  language?: 'pt-BR' | 'en-US' | 'all'
  search?: string
  orderBy?: 'created_at' | 'updated_at' | 'views' | 'title'
  orderDirection?: 'asc' | 'desc'
  includeDeleted?: boolean
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
    
    const query: PostsQuery = {
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '10', 10),
      status: (searchParams.get('status') as PostsQuery['status']) || 'all',
      language: (searchParams.get('language') as PostsQuery['language']) || 'all',
      search: searchParams.get('search') || undefined,
      orderBy: (searchParams.get('orderBy') as PostsQuery['orderBy']) || 'created_at',
      orderDirection: (searchParams.get('orderDirection') as PostsQuery['orderDirection']) || 'desc',
      includeDeleted: searchParams.get('includeDeleted') === 'true',
    }

    // Validate pagination
    if (query.page < 1) query.page = 1
    if (query.limit < 1 || query.limit > 100) query.limit = 10

    // ========================================
    // 4. Build Query
    // ========================================
    const from = (query.page - 1) * query.limit
    const to = from + query.limit - 1

    let supabaseQuery = supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact' })

    // Filter by deleted status
    if (!query.includeDeleted) {
      supabaseQuery = supabaseQuery.is('deleted_at', null)
    }

    // Filter by status
    if (query.status && query.status !== 'all') {
      supabaseQuery = supabaseQuery.eq('status', query.status)
    }

    // Filter by language
    if (query.language && query.language !== 'all') {
      supabaseQuery = supabaseQuery.eq('locale', query.language)
    }

    // Search by text
    if (query.search) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query.search}%,excerpt.ilike.%${query.search}%,content.ilike.%${query.search}%`
      )
    }

    // Order by
    const ascending = query.orderDirection === 'asc'
    const orderBy = query.orderBy || 'created_at'
    supabaseQuery = supabaseQuery.order(orderBy, { ascending })

    // Pagination
    supabaseQuery = supabaseQuery.range(from, to)

    // ========================================
    // 5. Execute Query
    // ========================================
    const { data, error, count } = await supabaseQuery

    if (error) {
      console.error('[Admin Posts] Query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts', details: error.message },
        { status: 500 }
      )
    }

    // ========================================
    // 6. Calculate Metadata
    // ========================================
    const total = count || 0
    const totalPages = Math.ceil(total / query.limit)

    // ========================================
    // 7. Return Success Response
    // ========================================
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      posts: data as BlogPost[],
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
      filters: {
        status: query.status,
        language: query.language,
        search: query.search,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
        includeDeleted: query.includeDeleted,
      },
      executionTime,
    })
  } catch (error) {
    console.error('[Admin Posts] Unexpected error:', error)
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
