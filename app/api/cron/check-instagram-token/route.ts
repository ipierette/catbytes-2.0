/**
 * Instagram Token Expiry Check - Cron Job
 * Verifica se o token Instagram está próximo de expirar
 * Envia email de alerta quando faltar 1 dia
 * Executa: Diariamente às 9h
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação (cron secret)
    const authHeader = request.headers.get('authorization')
    const isCronJob = authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isCronJob) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== Instagram Token Expiry Check Started ===')

    // Busca configurações do admin
    const { data: settingsData, error } = await supabase
      .from('admin_settings')
      .select('config')
      .single()

    if (error || !settingsData) {
      console.log('No settings found')
      return NextResponse.json({
        success: true,
        message: 'No settings configured'
      })
    }

    const settings = settingsData.config
    const tokenExpiryDate = settings?.api?.instagramTokenExpiryDate

    if (!tokenExpiryDate) {
      console.log('No token expiry date configured')
      return NextResponse.json({
        success: true,
        message: 'No token expiry date configured'
      })
    }

    // Calcula dias restantes
    const expiry = new Date(tokenExpiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    console.log(`Token expires in ${diffDays} days`)

    // Envia alerta se faltar 1 dia ou menos
    if (diffDays <= 1 && diffDays >= 0) {
      console.log('🚨 Sending token expiry alert email...')

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                color: white;
                margin: 0;
                font-size: 28px;
                font-weight: 700;
              }
              .emoji {
                font-size: 64px;
                margin-bottom: 16px;
              }
              .content {
                padding: 40px 30px;
              }
              .alert-box {
                background: #fef2f2;
                border-left: 4px solid #ef4444;
                padding: 20px;
                border-radius: 8px;
                margin: 24px 0;
              }
              .alert-box h2 {
                color: #dc2626;
                margin: 0 0 12px 0;
                font-size: 20px;
              }
              .alert-box p {
                color: #7f1d1d;
                margin: 0;
                line-height: 1.6;
              }
              .info-grid {
                display: grid;
                gap: 16px;
                margin: 24px 0;
              }
              .info-item {
                background: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
              }
              .info-label {
                color: #64748b;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                margin-bottom: 4px;
              }
              .info-value {
                color: #0f172a;
                font-size: 16px;
                font-weight: 600;
              }
              .steps {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                padding: 24px;
                margin: 24px 0;
              }
              .steps h3 {
                color: #15803d;
                margin: 0 0 16px 0;
                font-size: 18px;
              }
              .steps ol {
                margin: 0;
                padding-left: 20px;
                color: #166534;
              }
              .steps li {
                margin: 8px 0;
                line-height: 1.6;
              }
              .cta-button {
                display: inline-block;
                background: #10b981;
                color: white;
                padding: 16px 32px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 24px 0;
              }
              .footer {
                background: #f8fafc;
                padding: 24px;
                text-align: center;
                color: #64748b;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">⚠️</div>
                <h1>Token Instagram Expirando</h1>
              </div>
              
              <div class="content">
                <div class="alert-box">
                  <h2>Ação Urgente Necessária!</h2>
                  <p>
                    Seu token de acesso do Instagram está prestes a expirar.
                    ${diffDays === 0 
                      ? 'O token <strong>expira hoje</strong>!' 
                      : 'O token <strong>expira amanhã</strong>!'}
                  </p>
                </div>

                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Data de Expiração</div>
                    <div class="info-value">${expiry.toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Dias Restantes</div>
                    <div class="info-value" style="color: #dc2626;">
                      ${diffDays === 0 ? 'Expira hoje' : '1 dia'}
                    </div>
                  </div>
                </div>

                <div class="steps">
                  <h3>📝 Como Renovar o Token</h3>
                  <ol>
                    <li>Acesse o <strong>Facebook Developers</strong></li>
                    <li>Vá em <strong>Tools → Access Token Debugger</strong></li>
                    <li>Cole seu token atual e clique em <strong>Extend Access Token</strong></li>
                    <li>Copie o novo token (válido por 60 dias)</li>
                    <li>Atualize nas <strong>Configurações do Admin</strong></li>
                  </ol>
                </div>

                <center>
                  <a href="https://catbytes.site/admin/settings" class="cta-button">
                    🔧 Ir para Configurações
                  </a>
                </center>

                <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                  ⚡ <strong>Importante:</strong> Após a expiração, a geração automática 
                  de posts do Instagram será interrompida até que você renove o token.
                </p>
              </div>

              <div class="footer">
                <p>CATBytes - Sistema de Automação</p>
                <p style="margin-top: 8px;">
                  Este é um email automático. Para dúvidas, acesse o painel admin.
                </p>
              </div>
            </div>
          </body>
        </html>
      `

      await resend.emails.send({
        from: 'CATBytes Alerts <contato@catbytes.site>',
        to: 'izadoracury@hotmail.com', // Email do admin
        subject: `⚠️ Token Instagram ${diffDays === 0 ? 'EXPIRA HOJE' : 'Expira Amanhã'}!`,
        html: emailHtml
      })

      console.log('✅ Alert email sent successfully')

      return NextResponse.json({
        success: true,
        message: 'Alert email sent',
        daysRemaining: diffDays,
        expiryDate: expiry.toISOString()
      })
    }

    // Se tiver mais de 1 dia, apenas loga
    return NextResponse.json({
      success: true,
      message: 'Token still valid',
      daysRemaining: diffDays,
      expiryDate: expiry.toISOString()
    })

  } catch (error) {
    console.error('=== Token Check Failed ===')
    console.error('Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
