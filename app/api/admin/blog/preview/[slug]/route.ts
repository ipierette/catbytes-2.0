import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'

export const runtime = 'nodejs'

/**
 * GET /api/admin/blog/preview/[slug]
 * Preview any blog post (including drafts and scheduled) - Admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Verify admin access
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }

    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get post by slug WITHOUT published filter (admin can see everything)
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null) // Only exclude soft-deleted
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache admin previews
      },
    })
  } catch (error) {
    console.error('[Admin Preview] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
