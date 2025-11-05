import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for AI generation + automation tasks

/**
 * Unified Cron Job Handler
 * This endpoint consolidates multiple cron functions to stay within Vercel's cron job limits
 * Tasks are executed based on the current day/time
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Unified-Cron] Unauthorized attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours()
    const baseUrl = request.nextUrl.origin

    console.log(`[Unified-Cron] Starting tasks for day ${dayOfWeek} at hour ${hour}`)

    const results: { [key: string]: any } = {}

    // Schedule: Tuesday (2), Thursday (4), Saturday (6) at 13:00 BRT
    // Execute blog generation and Instagram batch generation
    if ([2, 4, 6].includes(dayOfWeek) && hour === 13) {
      console.log('[Unified-Cron] Executing blog and Instagram generation...')
      
      // Blog post generation
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
          results.blog = { success: true, post: blogResult.post }
          console.log('[Unified-Cron] Blog post generated:', blogResult.post.title)
        } else {
          results.blog = { success: false, error: `Status ${blogResponse.status}` }
        }
      } catch (error) {
        results.blog = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      // Instagram batch generation
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
          console.log('[Unified-Cron] Instagram batch generated')
        } else {
          results.instagram_batch = { success: false, error: `Status ${instagramResponse.status}` }
        }
      } catch (error) {
        results.instagram_batch = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Schedule: Monday (1), Thursday (4) at 15:00 BRT
    // Execute mega campaign automation
    if ([1, 4].includes(dayOfWeek) && hour === 15) {
      console.log('[Unified-Cron] Executing mega campaign automation...')
      
      try {
        const campaignResponse = await fetch(`${baseUrl}/api/campaign/mega-automation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cron-secret': cronSecret || '',
          },
        })

        if (campaignResponse.ok) {
          const campaignResult = await campaignResponse.json()
          results.mega_campaign = { success: true, data: campaignResult }
          console.log('[Unified-Cron] Mega campaign executed')
        } else {
          results.mega_campaign = { success: false, error: `Status ${campaignResponse.status}` }
        }
      } catch (error) {
        results.mega_campaign = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // If no tasks were scheduled for this time, return early
    if (Object.keys(results).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tasks scheduled for this time',
        day: dayOfWeek,
        hour: hour,
        timestamp: now.toISOString(),
      })
    }

    // Calculate overall success
    const totalTasks = Object.keys(results).length
    const successfulTasks = Object.values(results).filter(r => r.success).length
    const overallSuccess = successfulTasks === totalTasks

    return NextResponse.json({
      success: overallSuccess,
      message: `Executed ${successfulTasks}/${totalTasks} tasks successfully`,
      tasks: results,
      timestamp: now.toISOString(),
    })

  } catch (error) {
    console.error('[Unified-Cron] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unified cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}