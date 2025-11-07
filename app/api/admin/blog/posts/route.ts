import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'

// =====================================================
// GET /api/admin/blog/posts
// Get ALL blog posts (including drafts and unpublished) - Admin only
// =====================================================

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized', message: 'Admin authentication required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get ALL posts (including unpublished and drafts)
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null) // Exclude soft-deleted posts
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin API] Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts', details: error.message },
        { status: 500 }
      )
    }

    // Map status field from 'published' boolean to status string
    const postsWithStatus = posts.map(post => {
      let status = 'draft'
      if (post.published) {
        status = 'published'
      } else if (post.scheduled_at) {
        status = 'scheduled'
      }
      
      return {
        ...post,
        status
      }
    })

    return NextResponse.json(
      { 
        posts: postsWithStatus,
        total: postsWithStatus.length 
      },
      {
        headers: {
          'Cache-Control': 'no-store', // Don't cache admin data
        },
      }
    )
  } catch (error) {
    console.error('[Admin API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
