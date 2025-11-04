import { NextRequest, NextResponse } from 'next/server'

// =====================================================
// GET /api/blog/cron-test
// Test endpoint to manually trigger cron without auth
// TEMPORARY - Remove after testing
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    console.log('[Cron Test] Manually triggering blog post generation...')

    // ====== CALL GENERATE API ======
    const baseUrl = request.nextUrl.origin
    const generateUrl = `${baseUrl}/api/blog/generate`

    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Let the generate API choose random topic
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Generation failed: ${error.details || error.error}`)
    }

    const result = await response.json()

    console.log('[Cron Test] Post generated successfully:', result.post.title)

    // ====== SUCCESS RESPONSE ======
    return NextResponse.json({
      success: true,
      message: 'Blog post generated (test mode - no newsletter sent)',
      post: {
        id: result.post.id,
        title: result.post.title,
        slug: result.post.slug,
      },
      generationTime: result.generationTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron Test] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate test post',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
