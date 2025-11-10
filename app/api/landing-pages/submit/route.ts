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
      .select('id, title, niche, deploy_url')
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
      console.log('✅ Email de notificação enviado para admin')
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email admin (lead foi salvo):', emailError)
    }

    // 9. Enviar e-book para o lead
    try {
      await resend.emails.send({
        from: 'CATBytes AI <noreply@catbytes.site>',
        to: body.email,
        subject: `🎁 Seu E-book Grátis: 100 Dicas de Presença Online`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0 0 10px; font-size: 28px; }
    .content { padding: 40px 30px; background: #f9fafb; }
    .gift-box { background: white; padding: 30px; margin: 20px 0; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .gift-icon { font-size: 64px; margin-bottom: 20px; }
    .download-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .benefits { background: white; padding: 25px; margin: 20px 0; border-radius: 12px; }
    .benefit-item { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .benefit-item:last-child { border-bottom: none; }
    .footer { text-align: center; padding: 30px 20px; color: #6b7280; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 Seu E-book Chegou!</h1>
      <p>Obrigado por se interessar por ${landingPage.title}</p>
    </div>
    
    <div class="content">
      <div class="gift-box">
        <div class="gift-icon">📚</div>
        <h2 style="color: #1a202c; margin: 0 0 10px;">100 Dicas de Presença Online</h2>
        <p style="color: #4a5568; margin: 0 0 20px;">Seu guia completo para fortalecer sua marca digital</p>
        
        <a href="https://catbytes.site/100-dicas-presenca-online-catbytes.pdf" class="download-button" download>
          📥 Baixar E-book Agora
        </a>
        
        <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
          Ou acesse: <a href="https://catbytes.site/100-dicas-presenca-online-catbytes.pdf" style="color: #667eea;">catbytes.site/100-dicas-presenca-online-catbytes.pdf</a>
        </p>
      </div>
      
      <div class="benefits">
        <h3 style="color: #1a202c; margin: 0 0 15px;">📖 O que você vai aprender:</h3>
        <div class="benefit-item">✓ Estratégias de marketing digital comprovadas</div>
        <div class="benefit-item">✓ Como criar conteúdo que engaja</div>
        <div class="benefit-item">✓ Técnicas de SEO para aparecer no Google</div>
        <div class="benefit-item">✓ Dicas de redes sociais e automação</div>
        <div class="benefit-item">✓ Ferramentas essenciais para seu negócio</div>
      </div>
      
      <div style="background: #eef2ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #667eea; margin: 0 0 10px;">💬 Próximos Passos</h3>
        <p style="margin: 0; color: #4a5568;">
          Recebemos sua solicitação sobre <strong>${landingPage.title}</strong>. 
          Nossa equipe entrará em contato em breve para entender melhor suas necessidades!
        </p>
      </div>
    </div>
    
    <div class="footer">
      <img src="https://catbytes.site/images/logo-desenvolvedora.webp" alt="CATBytes" style="height: 40px; margin-bottom: 10px; opacity: 0.7;">
      <p>powered by CATBytes AI</p>
      <p style="margin: 5px 0;">
        <a href="https://catbytes.site">catbytes.site</a> | 
        <a href="mailto:ipierette2@gmail.com">ipierette2@gmail.com</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
        Este email foi enviado porque você solicitou informações em nossa landing page.
      </p>
    </div>
  </div>
</body>
</html>
        `
      })
      console.log('✅ E-book enviado para o lead')
    } catch (ebookError) {
      console.error('⚠️ Erro ao enviar e-book (lead foi salvo):', ebookError)
    }

    return NextResponse.json({
      success: true,
      message: 'Obrigado! Verifique seu email para receber o e-book.',
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
