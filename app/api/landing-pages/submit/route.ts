import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Rate limiting simples em memória (produção: usar Redis)
const ipRequests = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // 5 submissões
const RATE_WINDOW = 60 * 60 * 1000 // por hora

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipRequests.get(ip)

  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}

interface SubmitRequest {
  // Dados do lead
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
  
  // Honeypot (deve estar vazio)
  website?: string
  
  // Tracking
  landingPageSlug: string
  landingPageUrl?: string // URL completa da LP
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: SubmitRequest = await req.json()

    // 1. Validação básica
    if (!body.name || !body.email || !body.landingPageSlug) {
      return NextResponse.json(
        { error: 'Nome, email e slug da landing page são obrigatórios' },
        { status: 400 }
      )
    }

    // 2. Honeypot - campo invisível que bots preenchem
    if (body.website) {
      console.log('🍯 Honeypot detectado - provável bot')
      // Retorna sucesso para não alertar o bot
      return NextResponse.json({ success: true })
    }

    // 3. Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // 4. Rate limiting por IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Muitas solicitações. Tente novamente mais tarde.' },
        { status: 429 }
      )
    }

    // 5. Buscar landing page
    const supabase = createClient()
    const { data: landingPage, error: lpError } = await supabase
      .from('landing_pages')
      .select('id, title, niche')
      .eq('slug', body.landingPageSlug)
      .single()

    if (lpError || !landingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // 6. Extrair informações do user agent
    const userAgent = req.headers.get('user-agent') || ''
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                       userAgent.includes('Tablet') ? 'tablet' : 'desktop'
    
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                    userAgent.includes('Firefox') ? 'Firefox' :
                    userAgent.includes('Safari') ? 'Safari' :
                    userAgent.includes('Edge') ? 'Edge' : 'Other'

    // 7. Salvar lead
    const { data: lead, error: leadError } = await supabase
      .from('landing_page_leads')
      .insert({
        landing_page_id: landingPage.id,
        landing_page_url: body.landingPageUrl || landingPage.deploy_url || null,
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        message: body.message || null,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_term: body.utm_term || null,
        utm_content: body.utm_content || null,
        referrer: body.referrer || req.headers.get('referer') || null,
        user_agent: userAgent,
        ip_address: ip,
        device_type: deviceType,
        browser,
        status: 'new',
      })
      .select()
      .single()

    if (leadError) {
      console.error('❌ Erro ao salvar lead:', leadError)
      return NextResponse.json(
        { error: 'Erro ao salvar lead', details: leadError.message },
        { status: 500 }
      )
    }

    // 8. Enviar email de notificação
    try {
      await resend.emails.send({
        from: 'CATBytes AI <noreply@catbytes.site>',
        to: 'ipierette2@gmail.com',
        subject: `🎯 Novo Lead: ${landingPage.title}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .label { font-weight: bold; color: #667eea; }
    .value { margin-left: 10px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎯 Novo Lead Capturado!</h1>
      <p style="margin: 10px 0 0;">Landing Page: ${landingPage.title}</p>
    </div>
    
    <div class="content">
      <div class="info-box">
        <p><span class="label">👤 Nome:</span><span class="value">${body.name}</span></p>
        <p><span class="label">📧 Email:</span><span class="value">${body.email}</span></p>
        ${body.phone ? `<p><span class="label">📱 Telefone:</span><span class="value">${body.phone}</span></p>` : ''}
        ${body.company ? `<p><span class="label">🏢 Empresa:</span><span class="value">${body.company}</span></p>` : ''}
        ${body.message ? `<p><span class="label">💬 Mensagem:</span><span class="value">${body.message}</span></p>` : ''}
      </div>

      <div class="info-box">
        <p><span class="label">🔗 URL:</span><span class="value">${body.landingPageUrl || landingPage.deploy_url || 'N/A'}</span></p>
        <p><span class="label">🎯 Nicho:</span><span class="value">${landingPage.niche}</span></p>
        <p><span class="label">🌐 Origem:</span><span class="value">${body.utm_source || 'Direto'}</span></p>
        <p><span class="label">📱 Dispositivo:</span><span class="value">${deviceType} - ${browser}</span></p>
        <p><span class="label">🕐 Data:</span><span class="value">${new Date().toLocaleString('pt-BR')}</span></p>
      </div>

      ${body.utm_campaign ? `
      <div class="info-box">
        <p><span class="label">📊 UTM Campaign:</span><span class="value">${body.utm_campaign}</span></p>
        ${body.utm_medium ? `<p><span class="label">📊 UTM Medium:</span><span class="value">${body.utm_medium}</span></p>` : ''}
        ${body.utm_term ? `<p><span class="label">📊 UTM Term:</span><span class="value">${body.utm_term}</span></p>` : ''}
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="https://catbytes.site/admin/landing-pages" class="cta-button">
          Ver Todos os Leads no Admin
        </a>
      </div>
    </div>

    <div class="footer">
      <p>Este email foi enviado automaticamente pelo sistema CATBytes AI</p>
      <p>Landing Page Automation System v1.0</p>
    </div>
  </div>
</body>
</html>
        `
      })
      console.log('✅ Email de notificação enviado')
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email (lead foi salvo):', emailError)
      // Não retorna erro pois o lead já foi salvo
    }

    return NextResponse.json({
      success: true,
      message: 'Obrigado! Entraremos em contato em breve.',
      leadId: lead.id,
    })

  } catch (error: any) {
    console.error('❌ Erro ao processar lead:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar solicitação', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
