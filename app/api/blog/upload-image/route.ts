// =====================================================
// API Route: Upload Blog Image
// POST /api/blog/upload-image
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])

export async function POST(request: NextRequest) {
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
    // 3. Parse FormData
    // ========================================
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    const postId = formData.get('postId') as string | null
    const fileName = formData.get('fileName') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      )
    }

    // ========================================
    // 4. Validate File Type
    // ========================================
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Allowed: JPEG, PNG, WEBP',
          details: `Received: ${file.type}`,
        },
        { status: 400 }
      )
    }

    // ========================================
    // 5. Validate File Size
    // ========================================
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File too large. Maximum size: 5MB',
          details: `Received: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      )
    }

    console.log('[Upload] File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)}KB`,
    })

    // ========================================
    // 6. Generate Unique File Name
    // ========================================
    const timestamp = Date.now()
    const sanitizedName = (fileName || file.name)
      .toLowerCase()
      .replaceAll(/[^a-z0-9-]/g, '-')
      .replaceAll(/-+/g, '-')
      .substring(0, 50)
    const extension = file.type.split('/')[1]
    const uniqueFileName = `${sanitizedName}-${timestamp}.${extension}`
    const filePath = `blog-covers/${uniqueFileName}`

    // ========================================
    // 7. Convert File to Buffer
    // ========================================
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('[Upload] Uploading to:', filePath)

    // ========================================
    // 8. Upload to Supabase Storage
    // ========================================
    const { error: uploadError } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      })

    if (uploadError) {
      console.error('[Upload] Upload error:', uploadError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload image',
          details: uploadError.message,
        },
        { status: 500 }
      )
    }

    // ========================================
    // 9. Get Public URL
    // ========================================
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    console.log('[Upload] Image uploaded successfully:', publicUrl)

    // ========================================
    // 10. Update Post if postId Provided
    // ========================================
    if (postId) {
      const { error: updateError } = await supabaseAdmin
        .from('blog_posts')
        .update({ cover_image_url: publicUrl })
        .eq('id', postId)

      if (updateError) {
        console.warn('[Upload] Failed to update post:', updateError.message)
        // Still return success since image was uploaded
      } else {
        console.log('[Upload] Post updated with new image:', postId)
      }
    }

    // ========================================
    // 11. Return Success Response
    // ========================================
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      fileName: uniqueFileName,
      fileSize: file.size,
      executionTime,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('[Upload] Unexpected error:', error)
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      },
    }
  )
}
