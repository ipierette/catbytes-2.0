import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'

// =====================================================
// POST /api/admin/blog/posts/[slug]/cover-image
// Upload cover image for blog post
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params in Next.js 15
    const { slug } = await context.params
    
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    console.log('[Cover Image Upload] Processing upload for post:', slug)

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${slug}-cover-${Date.now()}.${fileExt}`
    const filePath = `covers/${fileName}`

    console.log('[Cover Image Upload] Uploading to:', filePath)

    // Upload to Supabase Storage (blog-images bucket)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[Cover Image Upload] Upload error:', uploadError)
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    console.log('[Cover Image Upload] Upload successful:', publicUrl)

    // Update post with new cover image
    const { error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update({ 
        cover_image_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)

    if (updateError) {
      console.error('[Cover Image Upload] Failed to update post:', updateError)
      // Try to delete uploaded file
      await supabaseAdmin.storage.from('blog-images').remove([filePath])
      throw new Error(`Failed to update post: ${updateError.message}`)
    }

    console.log('[Cover Image Upload] Post updated successfully')

    return NextResponse.json({
      success: true,
      coverImageUrl: publicUrl,
      message: 'Cover image uploaded successfully',
    })

  } catch (error: any) {
    console.error('[Cover Image Upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload cover image' },
      { status: 500 }
    )
  }
}
