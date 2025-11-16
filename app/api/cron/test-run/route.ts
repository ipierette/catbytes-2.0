import { NextRequest, NextResponse } from 'next/server'
import { alertCronSuccess, alertCronFailure } from '@/lib/alert-system'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * TEST ENDPOINT - Executa o cronjob IMEDIATAMENTE sem verificar dia/hora
 * 
 * ⚠️ ATENÇÃO: Este endpoint ignora o agendamento e executa SEMPRE que chamado!
 * Use apenas para testes manuais.
 * 
 * Para testar:
 * curl -X POST "https://www.catbytes.site/api/cron/test-run" \
 *   -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  try {
    // Verificação de segurança
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Test-Cron] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Test-Cron] 🧪 TESTE MANUAL - Executando cronjob...')

    const now = new Date()
    const baseUrl = request.nextUrl.origin
    const results: { [key: string]: any } = {}

    // 1. Gerar artigo do blog
    console.log('[Test-Cron] 1/3 - Gerando artigo do blog...')
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
        console.log('[Test-Cron] ✅ Blog post criado:', blogResult.post?.title)
      } else {
        const errorText = await blogResponse.text()
        results.blog = { success: false, error: `Status ${blogResponse.status}: ${errorText}` }
        console.error('[Test-Cron] ❌ Erro ao criar blog:', errorText)
      }
    } catch (error) {
      results.blog = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      console.error('[Test-Cron] ❌ Erro ao criar blog:', error)
    }

    // 2. Newsletter já é enviada automaticamente pelo /api/blog/generate
    console.log('[Test-Cron] 2/3 - Newsletter (já enviada automaticamente por blog/generate)')
    results.newsletter = { 
      success: true, 
      info: 'Newsletter is automatically sent by blog/generate endpoint'
    }

    // 3. Publicar posts agendados (Instagram e LinkedIn)
    console.log('[Test-Cron] 3/3 - Publicando posts agendados...')
    
    // Instagram
    try {
      const instagramResponse = await fetch(`${baseUrl}/api/cron/publish-scheduled-instagram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || `Bearer ${cronSecret}`,
        },
      })

      if (instagramResponse.ok) {
        const publishResult = await instagramResponse.json()
        results.instagram_scheduled = { success: true, data: publishResult }
        console.log('[Test-Cron] ✅ Instagram posts publicados:', publishResult.published || 0)
      } else {
        const errorText = await instagramResponse.text()
        results.instagram_scheduled = { success: false, error: `Status ${instagramResponse.status}: ${errorText}` }
      }
    } catch (error) {
      results.instagram_scheduled = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // LinkedIn
    try {
      const linkedinResponse = await fetch(`${baseUrl}/api/cron/publish-scheduled-linkedin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader || `Bearer ${cronSecret}`,
        },
      })

      if (linkedinResponse.ok) {
        const publishResult = await linkedinResponse.json()
        results.linkedin_scheduled = { success: true, data: publishResult }
        console.log('[Test-Cron] ✅ LinkedIn posts publicados:', publishResult.published || 0)
      } else {
        const errorText = await linkedinResponse.text()
        results.linkedin_scheduled = { success: false, error: `Status ${linkedinResponse.status}: ${errorText}` }
      }
    } catch (error) {
      results.linkedin_scheduled = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }

    // Calcular sucesso geral
    const totalTasks = Object.keys(results).filter(k => !results[k].skipped).length
    const successfulTasks = Object.values(results).filter(r => r.success).length
    const overallSuccess = successfulTasks === totalTasks

    // Enviar alerta
    if (overallSuccess) {
      await alertCronSuccess('🧪 TEST RUN - Blog & Social Media', {
        mode: 'MANUAL TEST',
        tasksExecuted: totalTasks,
        results: results,
        timestamp: now.toISOString()
      })
    } else {
      const failedTasks = Object.entries(results)
        .filter(([_, r]) => !r.success && !r.skipped)
        .map(([name, r]) => ({ task: name, error: r.error }))
      
      await alertCronFailure('🧪 TEST RUN - Blog & Social Media', new Error(`${failedTasks.length} tasks failed`))
    }

    return NextResponse.json({
      success: overallSuccess,
      mode: 'TEST_RUN',
      message: `Executed ${successfulTasks}/${totalTasks} tasks successfully`,
      tasks: results,
      timestamp: now.toISOString(),
      warning: '⚠️ This was a manual test run, not a scheduled cron execution'
    })

  } catch (error) {
    console.error('[Test-Cron] Error:', error)
    await alertCronFailure('🧪 TEST RUN - Blog & Social Media', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Test cron failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
