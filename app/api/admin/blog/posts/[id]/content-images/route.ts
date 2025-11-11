import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin } from '@/lib/supabase'

// =====================================================
// POST /api/admin/blog/posts/[id]/content-images
// Upload content images for blog post body
// Returns URL to insert in markdown
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await context.params
    
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

    console.log('[Content Image Upload] Processing upload for post:', id)

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string || 'Image'

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
    const timestamp = Date.now()
    const fileName = `${id}-content-${timestamp}.${fileExt}`
    const filePath = `content/${fileName}`

    console.log('[Content Image Upload] Uploading to:', filePath)

    // Upload to Supabase Storage (blog-images bucket)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[Content Image Upload] Upload error:', uploadError)
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('blog-images')
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    console.log('[Content Image Upload] Upload successful:', publicUrl)

    // Generate markdown snippet for easy insertion
    const markdownSnippet = `![${description}](${publicUrl})`

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      markdownSnippet,
      fileName,
      description,
      message: 'Content image uploaded successfully',
    })

  } catch (error: any) {
    console.error('[Content Image Upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload content image' },
      { status: 500 }
    )
  }
}
