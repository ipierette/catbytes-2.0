import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin, generateSlug } from '@/lib/supabase'

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

// =====================================================
// DELETE /api/admin/blog/posts
// Delete a blog post - Admin only
// =====================================================

export async function DELETE(request: NextRequest) {
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

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      )
    }

    // Delete post
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] Error deleting post:', error)
      return NextResponse.json(
        { error: 'Failed to delete post', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
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

// =====================================================
// POST /api/admin/blog/posts
// Create a new blog post manually - Admin only
// =====================================================

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, excerpt, content, tags, coverImageUrl, contentImages, highlight } = body

    console.log('[Manual Post] Request body:', JSON.stringify(body, null, 2))
    console.log('[Manual Post] Extracted fields:', { 
      title, 
      hasExcerpt: !!excerpt,
      hasContent: !!content, 
      hasCoverImageUrl: !!coverImageUrl,
      coverImageUrl,
      hasTags: !!tags,
      hasContentImages: !!contentImages,
      hasHighlight: !!highlight
    })

    if (!title || !content || !coverImageUrl) {
      console.log('[Manual Post] Validation failed:', { 
        hasTitle: !!title, 
        hasContent: !!content, 
        hasCoverImageUrl: !!coverImageUrl 
      })
      return NextResponse.json(
        { error: 'Title, content, and cover image are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = generateSlug(title)

    // Check if slug already exists
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this title already exists. Please use a different title.' },
        { status: 409 }
      )
    }

    // Create post data
    const postData = {
      title,
      slug,
      excerpt: excerpt || content.substring(0, 200),
      content,
      cover_image_url: coverImageUrl,
      highlight: highlight || null,
      // content_images não existe na tabela, removido
      tags: tags || [],
      category: 'Manual',
      author: 'Izadora Cury Pierette',
      locale: 'pt-BR',
      published: true,
      ai_model: 'manual',
      generation_prompt: 'Manual post created by admin',
      seo_title: title,
      seo_description: excerpt || content.substring(0, 160),
      keywords: tags || [],
    }

    console.log('[Manual Post] Creating post with data:', JSON.stringify(postData, null, 2))

    // Insert post
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('[Manual Post] Error creating post:', error)
      return NextResponse.json(
        { error: 'Failed to create post', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Manual Post] Post created successfully:', post.id)

    return NextResponse.json({ 
      success: true, 
      post 
    })
  } catch (error) {
    console.error('[Manual Post] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}