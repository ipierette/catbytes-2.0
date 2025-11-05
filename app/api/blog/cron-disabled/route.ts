import { NextRequest, NextResponse } from 'next/server'

// =====================================================
// GET /api/blog/cron
// Vercel Cron Job - Auto-generate blog posts
// Schedule: Tuesday, Thursday, Saturday at 10:00 AM (BRT)
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for AI generation + translation + emails

export async function GET(request: NextRequest) {
  try {
    // ====== SECURITY: Verify cron secret (optional for now) ======
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Log for debugging
    console.log('[Cron] Auth header present:', !!authHeader)
    console.log('[Cron] CRON_SECRET configured:', !!cronSecret)
    
    // Only verify if CRON_SECRET is set
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Cron] Unauthorized attempt - auth mismatch')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] Starting scheduled blog post generation...')

    // ====== CALL GENERATE API ======
    const baseUrl = request.nextUrl.origin
    const generateUrl = `${baseUrl}/api/blog/generate`

    console.log('[Cron] Calling generate API:', generateUrl)

    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass authorization to bypass Vercel Protection
        'Authorization': authHeader || `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({
        // Let the generate API choose random topic
      }),
    })

    console.log('[Cron] Generate API response status:', response.status)

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      console.error('[Cron] Generate API failed. Status:', response.status, 'Content-Type:', contentType)
      
      // Check if response is HTML (error page) or JSON
      if (contentType?.includes('text/html')) {
        const htmlText = await response.text()
        console.error('[Cron] Received HTML error page (first 500 chars):', htmlText.substring(0, 500))
        throw new Error(`Generation API returned HTML error page (status ${response.status})`)
      }
      
      // Try to parse JSON error
      try {
        const error = await response.json()
        console.error('[Cron] Generate API error response:', JSON.stringify(error, null, 2))
        throw new Error(`Generation failed: ${error.details || error.error || JSON.stringify(error)}`)
      } catch (parseError) {
        console.error('[Cron] Could not parse error response:', parseError)
        throw new Error(`Generation failed with status ${response.status}`)
      }
    }

    const result = await response.json()

    console.log('[Cron] Post generated successfully:', result.post.title)

    // NOTE: Newsletter is already sent by the generate API
    // No need to send it again here

    // ====== SUCCESS RESPONSE ======
    return NextResponse.json({
      success: true,
      message: 'Blog post generated and newsletter sent',
      post: {
        id: result.post.id,
        title: result.post.title,
        slug: result.post.slug,
      },
      generationTime: result.generationTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Error:', error)

    // Send notification (optional - could integrate with email/Slack)
    // await notifyError(error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate scheduled post',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
