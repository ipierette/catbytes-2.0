/**
 * Alert System for Cron Job Monitoring
 * Sends email notifications when cron jobs fail or complete
 */

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface AlertOptions {
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  details?: any
  timestamp?: Date
}

/**
 * Envia alerta por email
 */
export async function sendAlert(options: AlertOptions): Promise<void> {
  if (!resend) {
    console.warn('[Alert System] Resend not configured - skipping email alert')
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'ipierette@gmail.com'
  const timestamp = options.timestamp || new Date()
  
  // Define emoji e cor baseado no tipo
  const typeConfig = {
    success: { emoji: '✅', color: '#10b981', label: 'SUCESSO' },
    warning: { emoji: '⚠️', color: '#f59e0b', label: 'AVISO' },
    error: { emoji: '❌', color: '#ef4444', label: 'ERRO' },
    info: { emoji: 'ℹ️', color: '#3b82f6', label: 'INFO' }
  }
  
  const config = typeConfig[options.type]
  
  // Formata detalhes se fornecidos
  let detailsHtml = ''
  if (options.details) {
    try {
      const detailsStr = typeof options.details === 'string' 
        ? options.details 
        : JSON.stringify(options.details, null, 2)
      
      detailsHtml = `
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Detalhes:</h3>
          <pre style="margin: 0; font-size: 12px; color: #374151; overflow-x: auto;">${detailsStr}</pre>
        </div>
      `
    } catch (e) {
      detailsHtml = `<p style="color: #6b7280; font-size: 14px;">Detalhes não disponíveis</p>`
    }
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 24px; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
        ${config.emoji} ${config.label}
      </h1>
    </div>
    
    <!-- Content -->
    <div style="background-color: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">
        ${options.title}
      </h2>
      
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151; line-height: 1.6;">
        ${options.message}
      </p>
      
      ${detailsHtml}
      
      <!-- Timestamp -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          <strong>Horário:</strong> ${timestamp.toLocaleString('pt-BR', { 
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'full',
            timeStyle: 'long'
          })}
        </p>
      </div>
      
      <!-- Footer -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          Este é um alerta automático do sistema CatBytes.<br>
          Para mais informações, acesse o <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="color: ${config.color};">painel admin</a>.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  try {
    await resend.emails.send({
      from: 'CatBytes Alerts <alerts@catbytes.site>',
      to: adminEmail,
      subject: `[${config.label}] ${options.title}`,
      html: emailHtml
    })
    
    console.log(`[Alert System] ✅ ${config.label} alert sent to ${adminEmail}`)
  } catch (error) {
    console.error('[Alert System] Failed to send email alert:', error)
  }
}

/**
 * Envia alerta de sucesso do cron
 */
export async function alertCronSuccess(
  jobName: string,
  details?: any
): Promise<void> {
  await sendAlert({
    type: 'success',
    title: `Cron Job Executado com Sucesso`,
    message: `O cron job "${jobName}" foi executado com sucesso.`,
    details
  })
}

/**
 * Envia alerta de falha do cron
 */
export async function alertCronFailure(
  jobName: string,
  error: any
): Promise<void> {
  await sendAlert({
    type: 'error',
    title: `Falha no Cron Job`,
    message: `O cron job "${jobName}" falhou durante a execução.`,
    details: {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }
  })
}

/**
 * Envia alerta de aviso do cron
 */
export async function alertCronWarning(
  jobName: string,
  message: string,
  details?: any
): Promise<void> {
  await sendAlert({
    type: 'warning',
    title: `Aviso no Cron Job`,
    message: `${jobName}: ${message}`,
    details
  })
}

/**
 * Envia alerta informativo do cron
 */
export async function alertCronInfo(
  jobName: string,
  message: string,
  details?: any
): Promise<void> {
  await sendAlert({
    type: 'info',
    title: `Informação do Cron Job`,
    message: `${jobName}: ${message}`,
    details
  })
}
