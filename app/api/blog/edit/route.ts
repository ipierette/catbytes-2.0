// =====================================================
// API Route: Edit Blog Post
// PUT /api/blog/edit
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, generateSlug } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'
import type { BlogPostUpdate } from '@/types/blog'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

interface EditPostRequest {
  postId: string
  title?: string
  content?: string
  excerpt?: string
  keywords?: string[]
  cover_image_url?: string
  status?: 'draft' | 'published' | 'scheduled' | 'archived'
  category?: string
  tags?: string[]
  meta_description?: string
  canonical_url?: string
  scheduled_at?: string | null
}

export async function PUT(request: NextRequest) {
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
    // 3. Parse Request Body
    // ========================================
    const body: EditPostRequest = await request.json()
    const { postId, ...updates } = body

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'postId is required' },
        { status: 400 }
      )
    }

    // Validate at least one field to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    // ========================================
    // 4. Validate Fields
    // ========================================
    const validationErrors: string[] = []

    if (updates.title !== undefined) {
      if (updates.title.length < 10 || updates.title.length > 200) {
        validationErrors.push('Title must be between 10 and 200 characters')
      }
    }

    if (updates.excerpt !== undefined) {
      if (updates.excerpt.length < 50 || updates.excerpt.length > 500) {
        validationErrors.push('Excerpt must be between 50 and 500 characters')
      }
    }

    if (updates.content !== undefined) {
      if (updates.content.length < 300) {
        validationErrors.push('Content must be at least 300 characters')
      }
    }

    if (updates.meta_description !== undefined && updates.meta_description !== null) {
      if (updates.meta_description.length < 50 || updates.meta_description.length > 160) {
        validationErrors.push('Meta description must be between 50 and 160 characters')
      }
    }

    if (updates.canonical_url !== undefined && updates.canonical_url !== null) {
      const urlPattern = /^https?:\/\/.+/
      if (!urlPattern.test(updates.canonical_url)) {
        validationErrors.push('Canonical URL must start with http:// or https://')
      }
    }

    if (updates.status !== undefined) {
      const validStatuses = ['draft', 'published', 'scheduled', 'archived']
      if (!validStatuses.includes(updates.status)) {
        validationErrors.push('Status must be one of: draft, published, scheduled, archived')
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation errors', details: validationErrors },
        { status: 400 }
      )
    }

    // ========================================
    // 5. Check if Post Exists
    // ========================================
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .is('deleted_at', null) // Only non-deleted posts
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // ========================================
    // 6. Generate New Slug if Title Changed
    // ========================================
    const updateData: BlogPostUpdate = { ...updates }

    if (updates.title && updates.title !== existingPost.title) {
      const newSlug = generateSlug(updates.title)

      // Check if new slug is unique
      const { data: slugCheck } = await supabaseAdmin
        .from('blog_posts')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', postId)
        .is('deleted_at', null)
        .single()

      if (slugCheck) {
        // Slug already exists, add timestamp
        updateData.slug = `${newSlug}-${Date.now()}`
      } else {
        updateData.slug = newSlug
      }
    }

    // ========================================
    // 7. Update Post in Supabase
    // ========================================
    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      console.error('[Blog Edit] Update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update post', details: updateError.message },
        { status: 500 }
      )
    }

    // ========================================
    // 8. Return Success Response
    // ========================================
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      post: updatedPost,
      executionTime,
      message: 'Post updated successfully',
    })
  } catch (error) {
    console.error('[Blog Edit] Unexpected error:', error)
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
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      },
    }
  )
}
