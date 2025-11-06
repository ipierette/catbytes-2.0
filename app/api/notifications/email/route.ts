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
    .select('status, published_at')
    .gte('created_at', today.toISOString())

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('status, published_at')
    .gte('created_at', today.toISOString())

  const stats = {
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
      subject: `📊 Relatório Diário - ${today.toLocaleDateString('pt-BR')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">📊 Relatório Diário</h1>
            <p style="color: #e6fffa; margin: 10px 0 0 0;">${today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #2d3748;">📸 Instagram</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #4299e1;">${stats.instagram.generated}</div>
                <div style="color: #718096; margin-top: 5px;">Gerados</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #ed8936;">${stats.instagram.pending}</div>
                <div style="color: #718096; margin-top: 5px;">Pendentes</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #48bb78;">${stats.instagram.approved}</div>
                <div style="color: #718096; margin-top: 5px;">Aprovados</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #9f7aea;">${stats.instagram.published}</div>
                <div style="color: #718096; margin-top: 5px;">Publicados</div>
              </div>
            </div>
            
            <h2 style="color: #2d3748; margin-top: 30px;">📝 Blog</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #4299e1;">${stats.blog.generated}</div>
                <div style="color: #718096; margin-top: 5px;">Gerados</div>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #9f7aea;">${stats.blog.published}</div>
                <div style="color: #718096; margin-top: 5px;">Publicados</div>
              </div>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard" 
               style="display: inline-block; background: #4299e1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
              Acessar Painel Admin
            </a>
          </div>
        </div>
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
