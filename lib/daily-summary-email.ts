/**
 * Daily Summary Email Service
 * 
 * Envia email consolidado diário com resumo de todas as atividades:
 * - Blogs gerados
 * - Posts publicados (Instagram/LinkedIn)
 * - Erros e falhas
 * - Custos de API
 * - Ações pendentes
 */

import { Resend } from 'resend'
import { getEventsForDate, getEventStatsByDate, type DailyEvent } from './daily-events-logger'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface DailySummaryData {
  date: string
  stats: {
    blogsGenerated: number
    blogsFailed: number
    instagramPublished: number
    instagramFailed: number
    linkedinPublished: number
    linkedinFailed: number
    cronExecuted: number
    cronFailed: number
  }
  events: DailyEvent[]
  estimatedAPICosts: {
    openai: number
    dalle: number
    total: number
  }
}

/**
 * Calcula custos estimados de API para o dia
 */
function calculateDailyAPICosts(events: DailyEvent[]): DailySummaryData['estimatedAPICosts'] {
  let openaiCost = 0
  let dalleCost = 0

  events.forEach(event => {
    if (event.event_type === 'blog_generated') {
      // Custo estimado por blog:
      // - GPT-4o-mini: ~10k tokens input + 5k output = $0.015 * 0.15 + $0.005 * 0.60 = ~$0.005
      // - DALL-E 3: 1 imagem = $0.08
      openaiCost += 0.005
      dalleCost += 0.08
    }
    
    if (event.event_type === 'instagram_published' || event.event_type === 'linkedin_published') {
      // Geração de hashtags com Gemini (gratuito, mas contamos OpenAI se fallback)
      // Estimativa conservadora: $0.001 por post social
      openaiCost += 0.001
    }
  })

  return {
    openai: Math.round(openaiCost * 1000) / 1000, // 3 decimais
    dalle: Math.round(dalleCost * 1000) / 1000,
    total: Math.round((openaiCost + dalleCost) * 1000) / 1000
  }
}

/**
 * Gera HTML do email de resumo diário
 */
function generateEmailHTML(data: DailySummaryData): string {
  const { date, stats, events, estimatedAPICosts } = data
  
  // Formata data em português
  const dateObj = new Date(date + 'T12:00:00')
  const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Separa eventos por tipo
  const blogsGenerated = events.filter(e => e.event_type === 'blog_generated')
  const blogsFailed = events.filter(e => e.event_type === 'blog_failed')
  const instagramPublished = events.filter(e => e.event_type === 'instagram_published')
  const instagramFailed = events.filter(e => e.event_type === 'instagram_failed')
  const linkedinPublished = events.filter(e => e.event_type === 'linkedin_published')
  const linkedinFailed = events.filter(e => e.event_type === 'linkedin_failed')
  const cronErrors = events.filter(e => e.event_type === 'cron_failed')

  const hasErrors = stats.blogsFailed + stats.instagramFailed + stats.linkedinFailed + stats.cronFailed > 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .content {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 0 0 8px 8px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card.success {
      border-left-color: #10b981;
    }
    .stat-card.error {
      border-left-color: #ef4444;
    }
    .stat-card.warning {
      border-left-color: #f59e0b;
    }
    .stat-card h3 {
      margin: 0 0 5px 0;
      font-size: 28px;
      color: #1f2937;
    }
    .stat-card p {
      margin: 0;
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .event-item {
      padding: 10px;
      margin: 10px 0;
      background: #f9fafb;
      border-left: 3px solid #667eea;
      border-radius: 4px;
    }
    .event-item.error {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .event-item h4 {
      margin: 0 0 5px 0;
      font-size: 14px;
      color: #1f2937;
    }
    .event-item p {
      margin: 5px 0;
      font-size: 13px;
      color: #6b7280;
    }
    .event-item .time {
      font-size: 11px;
      color: #9ca3af;
    }
    .cost-breakdown {
      background: #f0fdf4;
      border: 1px solid #86efac;
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
    }
    .cost-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 14px;
    }
    .cost-item.total {
      border-top: 2px solid #86efac;
      margin-top: 10px;
      padding-top: 10px;
      font-weight: bold;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #6b7280;
    }
    .emoji {
      font-size: 20px;
      margin-right: 8px;
    }
    .alert {
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐱 Resumo Diário - CatBytes IA</h1>
    <p>${formattedDate}</p>
  </div>
  
  <div class="content">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card success">
        <h3>${stats.blogsGenerated}</h3>
        <p>✅ Blogs Gerados</p>
      </div>
      
      <div class="stat-card success">
        <h3>${stats.instagramPublished}</h3>
        <p>📸 Posts Instagram</p>
      </div>
      
      <div class="stat-card success">
        <h3>${stats.linkedinPublished}</h3>
        <p>💼 Posts LinkedIn</p>
      </div>
      
      <div class="stat-card ${hasErrors ? 'error' : 'success'}">
        <h3>${stats.blogsFailed + stats.instagramFailed + stats.linkedinFailed + stats.cronFailed}</h3>
        <p>${hasErrors ? '⚠️ Erros Detectados' : '✅ Sem Erros'}</p>
      </div>
    </div>

    ${hasErrors ? `
    <div class="alert">
      <strong>⚠️ Atenção: Foram detectados erros nas automações de hoje.</strong><br>
      Verifique os detalhes abaixo e tome as ações necessárias.
    </div>
    ` : ''}

    <!-- Blogs Gerados -->
    ${blogsGenerated.length > 0 ? `
    <div class="section">
      <h2><span class="emoji">📝</span> Artigos Publicados (${blogsGenerated.length})</h2>
      ${blogsGenerated.map(event => `
        <div class="event-item">
          <h4>${event.title}</h4>
          ${event.description ? `<p>${event.description}</p>` : ''}
          <p class="time">${new Date(event.event_time).toLocaleTimeString('pt-BR')}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Instagram Posts -->
    ${instagramPublished.length > 0 ? `
    <div class="section">
      <h2><span class="emoji">📸</span> Posts Instagram Publicados (${instagramPublished.length})</h2>
      ${instagramPublished.map(event => `
        <div class="event-item">
          <h4>${event.title}</h4>
          ${event.description ? `<p>${event.description}</p>` : ''}
          ${event.metadata?.postId ? `<p>ID: ${event.metadata.postId}</p>` : ''}
          <p class="time">${new Date(event.event_time).toLocaleTimeString('pt-BR')}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- LinkedIn Posts -->
    ${linkedinPublished.length > 0 ? `
    <div class="section">
      <h2><span class="emoji">💼</span> Posts LinkedIn Publicados (${linkedinPublished.length})</h2>
      ${linkedinPublished.map(event => `
        <div class="event-item">
          <h4>${event.title}</h4>
          ${event.description ? `<p>${event.description}</p>` : ''}
          ${event.metadata?.postId ? `<p>ID: ${event.metadata.postId}</p>` : ''}
          <p class="time">${new Date(event.event_time).toLocaleTimeString('pt-BR')}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Erros -->
    ${blogsFailed.length > 0 || instagramFailed.length > 0 || linkedinFailed.length > 0 || cronErrors.length > 0 ? `
    <div class="section">
      <h2><span class="emoji">⚠️</span> Erros e Falhas</h2>
      ${[...blogsFailed, ...instagramFailed, ...linkedinFailed, ...cronErrors].map(event => `
        <div class="event-item error">
          <h4>${event.title}</h4>
          ${event.error_message ? `<p><strong>Erro:</strong> ${event.error_message}</p>` : ''}
          ${event.description ? `<p>${event.description}</p>` : ''}
          <p class="time">${new Date(event.event_time).toLocaleTimeString('pt-BR')}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Custos de API -->
    <div class="section">
      <h2><span class="emoji">💰</span> Custos Estimados de API</h2>
      <div class="cost-breakdown">
        <div class="cost-item">
          <span>OpenAI (GPT-4o-mini + prompts)</span>
          <strong>$${estimatedAPICosts.openai.toFixed(3)}</strong>
        </div>
        <div class="cost-item">
          <span>DALL-E 3 (imagens)</span>
          <strong>$${estimatedAPICosts.dalle.toFixed(3)}</strong>
        </div>
        <div class="cost-item total">
          <span>Total do Dia</span>
          <strong>$${estimatedAPICosts.total.toFixed(3)}</strong>
        </div>
      </div>
      <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
        💡 Projeção mensal (baseado em média de 4 blogs/semana): ~$${(estimatedAPICosts.total * 16).toFixed(2)}/mês
      </p>
    </div>

    ${stats.blogsGenerated === 0 && stats.instagramPublished === 0 && stats.linkedinPublished === 0 ? `
    <div class="section">
      <p style="text-align: center; color: #6b7280;">
        😴 Nenhuma atividade registrada hoje.<br>
        Próxima execução agendada do cron de geração de blog.
      </p>
    </div>
    ` : ''}
  </div>

  <div class="footer">
    <p>
      Este é um resumo automático gerado pela CatBytes IA<br>
      Sistema de Automação e Geração de Conteúdo<br>
      Desenvolvido por Izadora Cury Pierette
    </p>
  </div>
</body>
</html>
  `
}

/**
 * Coleta dados do dia e prepara resumo
 */
async function collectDailySummary(date?: string): Promise<DailySummaryData> {
  const targetDate = date || new Date().toISOString().split('T')[0]
  
  const events = await getEventsForDate(targetDate)
  const stats = await getEventStatsByDate(targetDate)
  const estimatedAPICosts = calculateDailyAPICosts(events)

  return {
    date: targetDate,
    stats: {
      blogsGenerated: stats.blog_generated,
      blogsFailed: stats.blog_failed,
      instagramPublished: stats.instagram_published,
      instagramFailed: stats.instagram_failed,
      linkedinPublished: stats.linkedin_published,
      linkedinFailed: stats.linkedin_failed,
      cronExecuted: stats.cron_executed,
      cronFailed: stats.cron_failed
    },
    events,
    estimatedAPICosts
  }
}

/**
 * Envia email de resumo diário
 */
export async function sendDailySummaryEmail(
  toEmail?: string,
  date?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return {
      success: false,
      error: 'Resend API not configured'
    }
  }

  try {
    const recipientEmail = toEmail || process.env.ADMIN_EMAIL || 'izadora.pierette@gmail.com'
    const summaryData = await collectDailySummary(date)
    const htmlContent = generateEmailHTML(summaryData)

    console.log(`[Daily Summary Email] Sending summary for ${summaryData.date} to ${recipientEmail}`)

    const { data, error } = await resend.emails.send({
      from: 'CatBytes IA <noreply@catbytes.tech>',
      to: recipientEmail,
      subject: `📊 Resumo Diário - ${summaryData.date} - CatBytes IA`,
      html: htmlContent
    })

    if (error) {
      console.error('[Daily Summary Email] Error sending email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email'
      }
    }

    console.log('[Daily Summary Email] ✅ Email sent successfully:', data?.id)
    return { success: true }

  } catch (error) {
    console.error('[Daily Summary Email] Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verifica se já enviou email hoje
 */
export async function shouldSendDailySummary(): Promise<boolean> {
  // Sempre enviar se for chamado manualmente
  // Lógica pode ser expandida para verificar último envio no DB
  return true
}
