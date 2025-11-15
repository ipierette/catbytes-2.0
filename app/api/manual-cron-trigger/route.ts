import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

/**
 * Manual cron trigger - bypasses time checks for testing
 * Use this to manually trigger blog generation + social posts
 */
export async function GET(request: NextRequest) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Manual-Trigger] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Manual-Trigger] 🚀 Starting manual blog generation + social posts...')
    
    const now = new Date()
    const dayOfWeek = now.getDay()
    const hour = now.getHours()
    const baseUrl = request.nextUrl.origin

    console.log(`[Manual-Trigger] Current time: ${now.toISOString()}`)
    console.log(`[Manual-Trigger] Day: ${dayOfWeek}, Hour: ${hour}`)

    const results: { [key: string]: any } = {}

    // FORCE blog generation (ignore day/time checks)
    console.log('[Manual-Trigger] 📝 Generating blog post...')
    
    try {
      const blogResponse = await fetch(`${baseUrl}/api/blog/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || `Bearer ${cronSecret}`,
        },
        body: JSON.stringify({}),
      })

      if (blogResponse.ok) {
        const blogResult = await blogResponse.json()
        results.blog = { 
          success: true, 
          post: {
            id: blogResult.post?.id,
            title: blogResult.post?.title,
            slug: blogResult.post?.slug,
          }
        }
        console.log('[Manual-Trigger] ✅ Blog post generated:', blogResult.post?.title)
      } else {
        const errorText = await blogResponse.text()
        results.blog = { success: false, error: `Status ${blogResponse.status}: ${errorText}` }
        console.error('[Manual-Trigger] ❌ Blog generation failed:', errorText)
      }
    } catch (error) {
      results.blog = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      console.error('[Manual-Trigger] ❌ Blog generation error:', error)
    }

    // FORCE Instagram batch generation
    console.log('[Manual-Trigger] 📸 Generating Instagram posts...')
    
    try {
      const instagramResponse = await fetch(`${baseUrl}/api/instagram/generate-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || `Bearer ${cronSecret}`,
        },
      })

      if (instagramResponse.ok) {
        const instagramResult = await instagramResponse.json()
        results.instagram_batch = { success: true, data: instagramResult }
        console.log('[Manual-Trigger] ✅ Instagram batch generated')
      } else {
        const errorText = await instagramResponse.text()
        results.instagram_batch = { success: false, error: `Status ${instagramResponse.status}: ${errorText}` }
        console.error('[Manual-Trigger] ❌ Instagram batch failed:', errorText)
      }
    } catch (error) {
      results.instagram_batch = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      console.error('[Manual-Trigger] ❌ Instagram batch error:', error)
    }

    // Publish scheduled Instagram posts
    console.log('[Manual-Trigger] 📱 Publishing scheduled Instagram posts...')
    
    try {
      const publishInstagramResponse = await fetch(`${baseUrl}/api/cron/publish-scheduled-instagram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || `Bearer ${cronSecret}`,
        },
      })

      if (publishInstagramResponse.ok) {
        const publishResult = await publishInstagramResponse.json()
        results.instagram_scheduled = { success: true, data: publishResult }
        console.log('[Manual-Trigger] ✅ Instagram posts published:', publishResult.published || 0, 'posts')
      } else {
        const errorText = await publishInstagramResponse.text()
        results.instagram_scheduled = { success: false, error: `Status ${publishInstagramResponse.status}: ${errorText}` }
      }
    } catch (error) {
      results.instagram_scheduled = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Publish scheduled LinkedIn posts
    console.log('[Manual-Trigger] 💼 Publishing scheduled LinkedIn posts...')
    
    try {
      const publishLinkedInResponse = await fetch(`${baseUrl}/api/cron/publish-scheduled-linkedin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || `Bearer ${cronSecret}`,
        },
      })

      if (publishLinkedInResponse.ok) {
        const publishResult = await publishLinkedInResponse.json()
        results.linkedin_scheduled = { success: true, data: publishResult }
        console.log('[Manual-Trigger] ✅ LinkedIn posts published:', publishResult.published || 0, 'posts')
      } else {
        const errorText = await publishLinkedInResponse.text()
        results.linkedin_scheduled = { success: false, error: `Status ${publishLinkedInResponse.status}: ${errorText}` }
      }
    } catch (error) {
      results.linkedin_scheduled = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Calculate overall success
    const totalTasks = Object.keys(results).length
    const successfulTasks = Object.values(results).filter(r => r.success).length
    const overallSuccess = successfulTasks === totalTasks

    return NextResponse.json({
      success: overallSuccess,
      message: `Manual trigger completed: ${successfulTasks}/${totalTasks} tasks successful`,
      tasks: results,
      timestamp: now.toISOString(),
    })

  } catch (error) {
    console.error('[Manual-Trigger] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Manual trigger failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
