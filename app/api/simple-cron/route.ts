import { NextRequest, NextResponse } from 'next/server'
import { alertCronSuccess, alertCronFailure, alertCronWarning } from '@/lib/alert-system'
import { startCronLog } from '@/lib/cron-logger'
import { sendDailySummaryEmail } from '@/lib/daily-summary-email'
import { runProactiveAlerts } from '@/lib/proactive-alerts'

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
    const hour = now.getUTCHours() // Usar UTC para consistência
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD
    const baseUrl = request.nextUrl.origin

    console.log(`[Simple-Cron] UTC Time - Day ${dayOfWeek}, Hour ${hour}, Date ${today}`)
    console.log(`[Simple-Cron] Expected days: [2=Tue, 4=Thu, 6=Sat, 0=Sun] at hour 16 UTC`)

    const results: { [key: string]: any } = {}

    // Schedule: Tuesday (2), Thursday (4), Saturday (6), Sunday (0) at 16:00 UTC (13:00 BRT)
    // Execute blog generation ONLY (Instagram batch removed to save API costs)
    if ([2, 4, 6, 0].includes(dayOfWeek) && hour === 16) {
      console.log('[Simple-Cron] ✅ Correct schedule - Executing blog generation...')
      
      // PROTEÇÃO: Verificar se já gerou artigo hoje
      try {
        const checkResponse = await fetch(`${baseUrl}/api/blog/posts?limit=1`, {
          headers: {
            'Authorization': authHeader || `Bearer ${cronSecret}`,
          },
        })
        
        if (checkResponse.ok) {
          const { posts } = await checkResponse.json()
          if (posts && posts.length > 0) {
            const latestPost = posts[0]
            const latestPostDate = latestPost.created_at.split('T')[0]
            
            if (latestPostDate === today) {
              console.log('[Simple-Cron] ⚠️  Blog post already generated today, skipping...')
              results.blog = { success: true, skipped: true, reason: 'Already generated today', post: latestPost }
              
              // Enviar alerta de warning
              await alertCronWarning(
                'Blog generation skipped',
                `A blog post was already generated today (${latestPost.title}). Preventing duplicate generation.`,
                { latestPost: latestPost.title, date: today }
              )
              
              return NextResponse.json({ 
                success: true, 
                message: 'Cron skipped - post already generated today',
                results 
              })
            }
          }
        }
      } catch (error) {
        console.error('[Simple-Cron] Error checking existing posts:', error)
        // Continue mesmo se a verificação falhar
      }
      
      // Blog post generation
      const blogLog = startCronLog('blog')
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
          
          await blogLog.success({ 
            blog_post_id: blogResult.post?.id,
            title: blogResult.post?.title
          })
        } else {
          const errorText = await blogResponse.text()
          results.blog = { success: false, error: `Status ${blogResponse.status}: ${errorText}` }
          await blogLog.fail(`HTTP ${blogResponse.status}`, { details: errorText })
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        results.blog = { success: false, error: errorMsg }
        await blogLog.fail(errorMsg)
      }

      // Instagram batch generation REMOVED
      // Motivo: Geração automática de 10 posts não é utilizada
      // DALL-E não gera texto em português confiável
      // Economia: $166/ano em API credits
      // Posts Instagram são criados manualmente via text-only modal
      console.log('[Simple-Cron] Instagram batch generation disabled - posts created manually')
    }

    // Publicar posts agendados do Instagram e LinkedIn - todos os dias às 13h
    if (hour === 13) {
      console.log('[Simple-Cron] Publishing scheduled posts (Instagram & LinkedIn)...')
      
      // Instagram scheduled posts
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
          console.log('[Simple-Cron] Instagram posts published:', publishResult.published || 0, 'posts')
        } else {
          results.instagram_scheduled = { success: false, error: `Status ${publishInstagramResponse.status}` }
        }
      } catch (error) {
        results.instagram_scheduled = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }

      // LinkedIn scheduled posts
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
          console.log('[Simple-Cron] LinkedIn posts published:', publishResult.published || 0, 'posts')
        } else {
          results.linkedin_scheduled = { success: false, error: `Status ${publishLinkedInResponse.status}` }
        }
      } catch (error) {
        results.linkedin_scheduled = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    // Enviar resumo diário por email - todos os dias às 14:00 BRT (17:00 UTC)
    if (hour === 17) {
      console.log('[Simple-Cron] Sending daily summary email...')
      
      try {
        const emailResult = await sendDailySummaryEmail()
        
        if (emailResult.success) {
          results.daily_summary_email = { success: true }
          console.log('[Simple-Cron] ✅ Daily summary email sent successfully')
        } else {
          results.daily_summary_email = { success: false, error: emailResult.error }
          console.error('[Simple-Cron] ❌ Failed to send daily summary email:', emailResult.error)
        }
      } catch (error) {
        results.daily_summary_email = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
        console.error('[Simple-Cron] ❌ Error sending daily summary email:', error)
      }
    }

    // Executar alertas proativos - a cada 6 horas (0:00, 6:00, 12:00, 18:00 UTC)
    if ([0, 6, 12, 18].includes(hour)) {
      console.log('[Simple-Cron] Running proactive alerts check...')
      
      try {
        await runProactiveAlerts()
        results.proactive_alerts = { success: true }
        console.log('[Simple-Cron] ✅ Proactive alerts completed')
      } catch (error) {
        results.proactive_alerts = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
        console.error('[Simple-Cron] ❌ Error running proactive alerts:', error)
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

    // Enviar alerta baseado no resultado
    if (totalTasks > 0) {
      if (overallSuccess) {
        await alertCronSuccess('Blog & Social Media Generation', {
          tasksExecuted: totalTasks,
          results: results,
          day: dayOfWeek,
          hour: hour
        })
      } else {
        const failedTasks = Object.entries(results)
          .filter(([_, r]) => !r.success)
          .map(([name, r]) => ({ task: name, error: r.error }))
        
        await alertCronWarning('Blog & Social Media Generation', 
          `${successfulTasks}/${totalTasks} tarefas completadas com sucesso`,
          { failedTasks, allResults: results }
        )
      }
    }

    return NextResponse.json({
      success: overallSuccess,
      message: `Executed ${successfulTasks}/${totalTasks} tasks successfully`,
      tasks: results,
      timestamp: now.toISOString(),
    })

  } catch (error) {
    console.error('[Simple-Cron] Error:', error)
    
    // Enviar alerta de erro crítico
    await alertCronFailure('Blog & Social Media Generation', error)
    
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