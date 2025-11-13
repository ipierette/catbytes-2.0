import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60 // Reduzido para teste

/**
 * Simple unified endpoint - teste simples
 */
export async function GET(request: NextRequest) {
  try {
    // Verificação de segurança simples
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Simple-Cron] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Simple-Cron] Starting simple task...')

    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours()
    const baseUrl = request.nextUrl.origin

    console.log(`[Simple-Cron] Starting tasks for day ${dayOfWeek} at hour ${hour}`)

    const results: { [key: string]: any } = {}

    // Schedule: Tuesday (2), Thursday (4), Saturday (6), Sunday (0) at 13:00
    // Execute blog generation and Instagram batch generation
    if ([2, 4, 6, 0].includes(dayOfWeek) && hour === 13) {
      console.log('[Simple-Cron] Executing blog and Instagram generation...')
      
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
          console.log('[Simple-Cron] Blog post generated:', blogResult.post?.title)
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
          console.log('[Simple-Cron] Instagram batch generated')
        } else {
          results.instagram_batch = { success: false, error: `Status ${instagramResponse.status}` }
        }
      } catch (error) {
        results.instagram_batch = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      // Instagram publish scheduled posts - seg, qua, sex, dom às 13h
      if ([1, 3, 5, 0].includes(dayOfWeek)) {
        console.log('[Simple-Cron] Publishing scheduled Instagram posts...')
        
        try {
          const publishResponse = await fetch(`${baseUrl}/api/instagram/publish-scheduled`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader || `Bearer ${cronSecret}`,
            },
          })

          if (publishResponse.ok) {
            const publishResult = await publishResponse.json()
            results.instagram_publish = { success: true, data: publishResult }
            console.log('[Simple-Cron] Instagram posts published:', publishResult.published || 0, 'posts')
          } else {
            results.instagram_publish = { success: false, error: `Status ${publishResponse.status}` }
          }
        } catch (error) {
          results.instagram_publish = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }
    }

    // Schedule: Monday (1), Thursday (4) at 15:00 - separate cron would be better
    // But for now, we'll handle it here with different schedule
    if ([1, 4].includes(dayOfWeek) && hour === 15) {
      console.log('[Simple-Cron] Would execute mega campaign (using disabled endpoint for now)')
      results.mega_campaign = { success: true, note: 'Mega campaign scheduled for later implementation' }
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
    console.error('[Simple-Cron] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Simple cron failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}