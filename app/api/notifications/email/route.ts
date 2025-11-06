import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tipos de notificação
type NotificationType = 
  | 'post_approved' 
  | 'post_rejected' 
  | 'post_published' 
  | 'daily_report'
  | 'weekly_report'
  | 'translation_complete'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data }: { type: NotificationType; data: any } = body

    const adminEmail = process.env.ADMIN_EMAIL || 'izadora@catbytes.site'

    switch (type) {
      case 'post_approved':
        await sendPostApprovedEmail(adminEmail, data)
        break
      case 'post_rejected':
        await sendPostRejectedEmail(adminEmail, data)
        break
      case 'post_published':
        await sendPostPublishedEmail(adminEmail, data)
        break
      case 'daily_report':
        await sendDailyReportEmail(adminEmail)
        break
      case 'weekly_report':
        await sendWeeklyReportEmail(adminEmail)
        break
      case 'translation_complete':
        await sendTranslationCompleteEmail(adminEmail, data)
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de notificação inválido'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação enviada com sucesso'
    })
  } catch (error) {
    console.error('Error sending email notification:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar notificação'
    }, { status: 500 })
  }
}

// Post aprovado
async function sendPostApprovedEmail(to: string, data: any) {
  const { postId, caption, scheduledFor } = data
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CATBytes Admin <admin@catbytes.site>',
      to,
      subject: '✅ Post do Instagram Aprovado',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Post Aprovado!</h1>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d3748; margin-top: 0;">Post #${postId}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
              <p style="color: #4a5568; line-height: 1.6; margin: 0;">
                ${caption.substring(0, 150)}${caption.length > 150 ? '...' : ''}
              </p>
            </div>
            
            <div style="background: #e6fffa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #234e52; margin: 0;">
                📅 <strong>Publicação agendada para:</strong><br>
                ${new Date(scheduledFor).toLocaleString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/instagram" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Ver no Painel Admin
            </a>
          </div>
        </div>
      `
    })
  })

  if (!response.ok) {
    throw new Error('Failed to send email via Resend')
  }
}

// Post rejeitado
async function sendPostRejectedEmail(to: string, data: any) {
  const { postId, caption, reason } = data
  
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CATBytes Admin <admin@catbytes.site>',
      to,
      subject: '❌ Post do Instagram Rejeitado',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f56565 0%, #c53030 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">❌ Post Rejeitado</h1>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d3748; margin-top: 0;">Post #${postId}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fc8181;">
              <p style="color: #4a5568; line-height: 1.6; margin: 0;">
                ${caption.substring(0, 150)}${caption.length > 150 ? '...' : ''}
              </p>
            </div>
            
            ${reason ? `
              <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #742a2a; margin: 0;">
                  <strong>Motivo:</strong><br>
                  ${reason}
                </p>
              </div>
            ` : ''}
            
            <p style="color: #718096;">
              O post foi movido para a lixeira e não será publicado.
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/instagram" 
               style="display: inline-block; background: #f56565; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Ver no Painel Admin
            </a>
          </div>
        </div>
      `
    })
  })
}

// Post publicado com sucesso
async function sendPostPublishedEmail(to: string, data: any) {
  const { postId, caption, instagramPostId } = data
  
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CATBytes Admin <admin@catbytes.site>',
      to,
      subject: '🎉 Post Publicado no Instagram!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Post Publicado!</h1>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d3748; margin-top: 0;">Post #${postId}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ed64a6;">
              <p style="color: #4a5568; line-height: 1.6; margin: 0;">
                ${caption.substring(0, 150)}${caption.length > 150 ? '...' : ''}
              </p>
            </div>
            
            <div style="background: #fef5f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #702459; margin: 0;">
                ✅ <strong>Publicado com sucesso no Instagram!</strong><br>
                ID: ${instagramPostId}
              </p>
            </div>
            
            <a href="https://www.instagram.com/p/${instagramPostId}" 
               style="display: inline-block; background: #ed64a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Ver no Instagram
            </a>
          </div>
        </div>
      `
    })
  })
}

// Relatório diário
async function sendDailyReportEmail(to: string) {
  // Buscar estatísticas do dia
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: instagramPosts } = await supabase
    .from('instagram_posts')
    .select('status, published_at, created_at')
    .gte('created_at', today.toISOString())

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('status, published_at, created_at')
    .gte('created_at', today.toISOString())

  // Estatísticas gerais (totais)
  const { data: allInstagram } = await supabase
    .from('instagram_posts')
    .select('status')
  
  const { data: allBlog } = await supabase
    .from('blog_posts')
    .select('status')

  const stats = {
    today: {
      instagram: {
        generated: instagramPosts?.length || 0,
        pending: instagramPosts?.filter(p => p.status === 'pending').length || 0,
        approved: instagramPosts?.filter(p => p.status === 'approved').length || 0,
        published: instagramPosts?.filter(p => p.status === 'published').length || 0
      },
      blog: {
        generated: blogPosts?.length || 0,
        published: blogPosts?.filter(p => p.status === 'published').length || 0
      }
    },
    total: {
      instagram: {
        total: allInstagram?.length || 0,
        pending: allInstagram?.filter(p => p.status === 'pending').length || 0,
        published: allInstagram?.filter(p => p.status === 'published').length || 0
      },
      blog: {
        total: allBlog?.length || 0,
        published: allBlog?.filter(p => p.status === 'published').length || 0
      }
    }
  }

  const colors = {
    primary: '#06B6D4',    // Cyan CatBytes
    dark: '#1F2937',       // Dark gray CatBytes
    darkHover: '#374151',
    text: '#111827',
    textLight: '#6B7280',
    bg: '#F9FAFB',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6'
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CATBytes Admin <admin@catbytes.site>',
      to,
      subject: `📊 Relatório Diário CATBytes - ${today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${colors.bg};">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${colors.bg}; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header com gradiente cinza escuro -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkHover} 100%); padding: 40px 30px; text-align: center;">
                      <img src="https://catbytes.site/images/catbytes-logo.png" alt="CatBytes" width="160" height="107" style="display: block; margin: 0 auto 20px;">
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">📊 Relatório Diário</h1>
                      <p style="margin: 10px 0 0; color: #D1D5DB; font-size: 16px;">
                        ${today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </td>
                  </tr>

                  <!-- Resumo do Dia -->
                  <tr>
                    <td style="padding: 30px; background-color: white;">
                      <div style="background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%); border-left: 4px solid ${colors.primary}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px; color: ${colors.dark}; font-size: 18px;">📅 Resumo de Hoje</h3>
                        <p style="margin: 0; color: ${colors.textLight}; font-size: 14px; line-height: 1.6;">
                          <strong style="color: ${colors.primary};">${stats.today.instagram.generated}</strong> posts do Instagram gerados • 
                          <strong style="color: ${colors.primary};">${stats.today.blog.generated}</strong> artigos do blog criados
                        </p>
                      </div>

                      <!-- Instagram Stats -->
                      <h2 style="margin: 0 0 20px; color: ${colors.dark}; font-size: 20px; display: flex; align-items: center;">
                        📸 Instagram
                      </h2>
                      <table width="100%" cellpadding="0" cellspacing="10" style="margin-bottom: 30px;">
                        <tr>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.info}15 0%, ${colors.info}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.info}; margin-bottom: 8px;">${stats.today.instagram.generated}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Gerados Hoje</div>
                          </td>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.warning}15 0%, ${colors.warning}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.warning}; margin-bottom: 8px;">${stats.today.instagram.pending}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Pendentes</div>
                          </td>
                        </tr>
                        <tr>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.success}15 0%, ${colors.success}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.success}; margin-bottom: 8px;">${stats.today.instagram.approved}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Aprovados</div>
                          </td>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.primary}; margin-bottom: 8px;">${stats.today.instagram.published}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Publicados</div>
                          </td>
                        </tr>
                      </table>

                      <!-- Blog Stats -->
                      <h2 style="margin: 0 0 20px; color: ${colors.dark}; font-size: 20px;">📝 Blog</h2>
                      <table width="100%" cellpadding="0" cellspacing="10" style="margin-bottom: 30px;">
                        <tr>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.info}15 0%, ${colors.info}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.info}; margin-bottom: 8px;">${stats.today.blog.generated}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Gerados Hoje</div>
                          </td>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.primary}; margin-bottom: 8px;">${stats.today.blog.published}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Publicados</div>
                          </td>
                        </tr>
                      </table>

                      <!-- Totais Gerais -->
                      <div style="background: ${colors.bg}; border-radius: 8px; padding: 20px; border: 1px solid ${colors.border};">
                        <h3 style="margin: 0 0 15px; color: ${colors.dark}; font-size: 16px;">📊 Estatísticas Totais</h3>
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px; border-bottom: 1px solid ${colors.border};">Instagram Total</td>
                            <td align="right" style="color: ${colors.text}; font-weight: 600; font-size: 14px; border-bottom: 1px solid ${colors.border};">${stats.total.instagram.total} posts</td>
                          </tr>
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px; border-bottom: 1px solid ${colors.border};">Instagram Publicados</td>
                            <td align="right" style="color: ${colors.success}; font-weight: 600; font-size: 14px; border-bottom: 1px solid ${colors.border};">${stats.total.instagram.published}</td>
                          </tr>
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px; border-bottom: 1px solid ${colors.border};">Blog Total</td>
                            <td align="right" style="color: ${colors.text}; font-weight: 600; font-size: 14px; border-bottom: 1px solid ${colors.border};">${stats.total.blog.total} artigos</td>
                          </tr>
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px;">Blog Publicados</td>
                            <td align="right" style="color: ${colors.success}; font-weight: 600; font-size: 14px;">${stats.total.blog.published}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://catbytes.site'}/admin/dashboard" 
                           style="display: inline-block; background: ${colors.primary}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                          🚀 Acessar Painel Admin
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: ${colors.dark}; padding: 25px 30px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 12px;">
                        Este é um relatório automático gerado pelo sistema CATBytes
                      </p>
                      <p style="margin: 0; color: #6B7280; font-size: 12px;">
                        Izadora Cury Pierette - Criadora da CATBytes
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })
  })
}

// Relatório semanal
async function sendWeeklyReportEmail(to: string) {
  // Buscar estatísticas da semana (últimos 7 dias)
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)
  
  const { data: instagramPosts } = await supabase
    .from('instagram_posts')
    .select('status, published_at, created_at')
    .gte('created_at', weekAgo.toISOString())

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('status, published_at, created_at')
    .gte('created_at', weekAgo.toISOString())

  // Estatísticas gerais (totais)
  const { data: allInstagram } = await supabase
    .from('instagram_posts')
    .select('status')
  
  const { data: allBlog } = await supabase
    .from('blog_posts')
    .select('status')

  // Calcular média diária
  const weekStats = {
    week: {
      instagram: {
        generated: instagramPosts?.length || 0,
        pending: instagramPosts?.filter(p => p.status === 'pending').length || 0,
        approved: instagramPosts?.filter(p => p.status === 'approved').length || 0,
        published: instagramPosts?.filter(p => p.status === 'published').length || 0,
        avgPerDay: Math.round((instagramPosts?.length || 0) / 7)
      },
      blog: {
        generated: blogPosts?.length || 0,
        published: blogPosts?.filter(p => p.status === 'published').length || 0,
        avgPerDay: Math.round((blogPosts?.length || 0) / 7)
      }
    },
    total: {
      instagram: {
        total: allInstagram?.length || 0,
        pending: allInstagram?.filter(p => p.status === 'pending').length || 0,
        published: allInstagram?.filter(p => p.status === 'published').length || 0
      },
      blog: {
        total: allBlog?.length || 0,
        published: allBlog?.filter(p => p.status === 'published').length || 0
      }
    }
  }

  const colors = {
    primary: '#06B6D4',
    dark: '#1F2937',
    darkHover: '#374151',
    text: '#111827',
    textLight: '#6B7280',
    bg: '#F9FAFB',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    purple: '#8B5CF6'
  }

  const periodText = `${weekAgo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CATBytes Admin <admin@catbytes.site>',
      to,
      subject: `📈 Relatório Semanal CATBytes - ${periodText}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${colors.bg};">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${colors.bg}; padding: 20px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkHover} 100%); padding: 40px 30px; text-align: center;">
                      <img src="https://catbytes.site/images/catbytes-logo.png" alt="CatBytes" width="160" height="107" style="display: block; margin: 0 auto 20px;">
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">📈 Relatório Semanal</h1>
                      <p style="margin: 10px 0 0; color: #D1D5DB; font-size: 16px;">
                        ${periodText}
                      </p>
                    </td>
                  </tr>

                  <!-- Resumo da Semana -->
                  <tr>
                    <td style="padding: 30px; background-color: white;">
                      <div style="background: linear-gradient(135deg, ${colors.purple}15 0%, ${colors.purple}05 100%); border-left: 4px solid ${colors.purple}; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h3 style="margin: 0 0 10px; color: ${colors.dark}; font-size: 18px;">📅 Resumo dos Últimos 7 Dias</h3>
                        <p style="margin: 0; color: ${colors.textLight}; font-size: 14px; line-height: 1.6;">
                          <strong style="color: ${colors.purple};">${weekStats.week.instagram.generated}</strong> posts do Instagram gerados • 
                          <strong style="color: ${colors.purple};">${weekStats.week.blog.generated}</strong> artigos do blog criados<br>
                          <span style="font-size: 12px;">Média de ${weekStats.week.instagram.avgPerDay} posts/dia no Instagram e ${weekStats.week.blog.avgPerDay} artigos/dia no blog</span>
                        </p>
                      </div>

                      <!-- Instagram Stats -->
                      <h2 style="margin: 0 0 20px; color: ${colors.dark}; font-size: 20px;">📸 Instagram - Últimos 7 Dias</h2>
                      <table width="100%" cellpadding="0" cellspacing="10" style="margin-bottom: 30px;">
                        <tr>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.info}15 0%, ${colors.info}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.info}; margin-bottom: 8px;">${weekStats.week.instagram.generated}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Gerados</div>
                            <div style="color: ${colors.textLight}; font-size: 12px; margin-top: 4px;">≈ ${weekStats.week.instagram.avgPerDay}/dia</div>
                          </td>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.warning}15 0%, ${colors.warning}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.warning}; margin-bottom: 8px;">${weekStats.week.instagram.pending}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Pendentes</div>
                          </td>
                        </tr>
                        <tr>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.success}15 0%, ${colors.success}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.success}; margin-bottom: 8px;">${weekStats.week.instagram.approved}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Aprovados</div>
                          </td>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.primary}; margin-bottom: 8px;">${weekStats.week.instagram.published}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Publicados</div>
                          </td>
                        </tr>
                      </table>

                      <!-- Blog Stats -->
                      <h2 style="margin: 0 0 20px; color: ${colors.dark}; font-size: 20px;">📝 Blog - Últimos 7 Dias</h2>
                      <table width="100%" cellpadding="0" cellspacing="10" style="margin-bottom: 30px;">
                        <tr>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.info}15 0%, ${colors.info}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.info}; margin-bottom: 8px;">${weekStats.week.blog.generated}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Gerados</div>
                            <div style="color: ${colors.textLight}; font-size: 12px; margin-top: 4px;">≈ ${weekStats.week.blog.avgPerDay}/dia</div>
                          </td>
                          <td width="48%" style="background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}05 100%); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid ${colors.border};">
                            <div style="font-size: 36px; font-weight: 700; color: ${colors.primary}; margin-bottom: 8px;">${weekStats.week.blog.published}</div>
                            <div style="color: ${colors.textLight}; font-size: 14px; font-weight: 500;">Publicados</div>
                          </td>
                        </tr>
                      </table>

                      <!-- Totais Gerais -->
                      <div style="background: ${colors.bg}; border-radius: 8px; padding: 20px; border: 1px solid ${colors.border};">
                        <h3 style="margin: 0 0 15px; color: ${colors.dark}; font-size: 16px;">📊 Estatísticas Totais do Sistema</h3>
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px; border-bottom: 1px solid ${colors.border};">Instagram Total</td>
                            <td align="right" style="color: ${colors.text}; font-weight: 600; font-size: 14px; border-bottom: 1px solid ${colors.border};">${weekStats.total.instagram.total} posts</td>
                          </tr>
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px; border-bottom: 1px solid ${colors.border};">Instagram Publicados</td>
                            <td align="right" style="color: ${colors.success}; font-weight: 600; font-size: 14px; border-bottom: 1px solid ${colors.border};">${weekStats.total.instagram.published}</td>
                          </tr>
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px; border-bottom: 1px solid ${colors.border};">Instagram Pendentes</td>
                            <td align="right" style="color: ${colors.warning}; font-weight: 600; font-size: 14px; border-bottom: 1px solid ${colors.border};">${weekStats.total.instagram.pending}</td>
                          </tr>
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px; border-bottom: 1px solid ${colors.border};">Blog Total</td>
                            <td align="right" style="color: ${colors.text}; font-weight: 600; font-size: 14px; border-bottom: 1px solid ${colors.border};">${weekStats.total.blog.total} artigos</td>
                          </tr>
                          <tr>
                            <td style="color: ${colors.textLight}; font-size: 14px;">Blog Publicados</td>
                            <td align="right" style="color: ${colors.success}; font-weight: 600; font-size: 14px;">${weekStats.total.blog.published}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- Performance Box -->
                      <div style="background: linear-gradient(135deg, ${colors.success}15 0%, ${colors.success}05 100%); border-left: 4px solid ${colors.success}; padding: 20px; border-radius: 8px; margin-top: 30px;">
                        <h3 style="margin: 0 0 10px; color: ${colors.dark}; font-size: 16px;">✨ Performance da Semana</h3>
                        <p style="margin: 0; color: ${colors.textLight}; font-size: 14px; line-height: 1.6;">
                          Taxa de publicação: <strong style="color: ${colors.success};">${weekStats.week.instagram.published > 0 ? Math.round((weekStats.week.instagram.published / weekStats.week.instagram.generated) * 100) : 0}%</strong> dos posts do Instagram gerados foram publicados.<br>
                          Blog: <strong style="color: ${colors.success};">${weekStats.week.blog.published > 0 ? Math.round((weekStats.week.blog.published / weekStats.week.blog.generated) * 100) : 0}%</strong> dos artigos foram publicados.
                        </p>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://catbytes.site'}/admin/dashboard" 
                           style="display: inline-block; background: ${colors.primary}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                          🚀 Acessar Painel Admin
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background: ${colors.dark}; padding: 25px 30px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #9CA3AF; font-size: 12px;">
                        Este é um relatório automático gerado pelo sistema CATBytes
                      </p>
                      <p style="margin: 0; color: #6B7280; font-size: 12px;">
                        Izadora Cury Pierette - Criadora da CATBytes
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })
  })
}

// Tradução concluída
async function sendTranslationCompleteEmail(to: string, data: any) {
  const { originalTitle, translatedTitle, slug } = data
  
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CATBytes Admin <admin@catbytes.site>',
      to,
      subject: '🌍 Tradução de Post Concluída',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🌍 Tradução Concluída!</h1>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #718096; margin: 0 0 10px 0;"><strong>Post Original (PT):</strong></p>
              <p style="color: #2d3748; font-size: 18px; margin: 0;">${originalTitle}</p>
            </div>
            
            <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
              <p style="color: #234e52; margin: 0 0 10px 0;"><strong>Post Traduzido (EN):</strong></p>
              <p style="color: #234e52; font-size: 18px; margin: 0;">${translatedTitle}</p>
            </div>
            
            <p style="color: #718096;">
              ✅ Newsletter enviada para assinantes em inglês<br>
              ✅ Post disponível no blog inglês
            </p>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/en-US/blog/${slug}" 
               style="display: inline-block; background: #48bb78; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Ver Post Traduzido
            </a>
          </div>
        </div>
      `
    })
  })
}
