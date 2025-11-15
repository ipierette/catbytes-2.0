/**
 * Script para enviar newsletter manualmente para o artigo de hoje
 * Uso: node send-newsletter-today.js
 */

require('dotenv').config({ path: '.env.local' })
const { Resend } = require('resend')
const { createClient } = require('@supabase/supabase-js')

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const POST_SLUG = 'alimentacao-amorosa-o-guia-completo-para-cada-fase-do-gato'

function getNewPostEmailHTML(name, title, excerpt, coverImage, postUrl, locale, baseUrl) {
  const isEnglish = locale === 'en-US'
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
        🚀 ${isEnglish ? 'New Article Published!' : 'Novo Artigo Publicado!'}
      </h1>
    </div>
    
    <!-- Content -->
    <div style="background-color: white; padding: 32px; border-radius: 0 0 12px 12px;">
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
        ${isEnglish ? `Hi ${name},` : `Olá ${name},`}
      </p>
      
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #374151; line-height: 1.6;">
        ${isEnglish 
          ? `We just published a new article on the CatBytes blog that might interest you!`
          : `Acabamos de publicar um novo artigo no blog da CatBytes que pode te interessar!`
        }
      </p>
      
      <!-- Post Card -->
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
        ${coverImage ? `
          <img src="${coverImage}" alt="${title}" style="width: 100%; height: auto; display: block;" />
        ` : ''}
        
        <div style="padding: 20px;">
          <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #111827; font-weight: 600;">
            ${title}
          </h2>
          
          <p style="margin: 0 0 16px 0; font-size: 15px; color: #6b7280; line-height: 1.6;">
            ${excerpt}
          </p>
          
          <a href="${postUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            ${isEnglish ? '📖 Read Full Article' : '📖 Ler Artigo Completo'}
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
          ${isEnglish 
            ? `You're receiving this because you subscribed to the CatBytes newsletter.`
            : `Você está recebendo este email porque se inscreveu na newsletter da CatBytes.`
          }
        </p>
        
        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
          <a href="${baseUrl}/newsletter/unsubscribe" style="color: #6366f1; text-decoration: none;">
            ${isEnglish ? 'Unsubscribe' : 'Cancelar inscrição'}
          </a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

async function main() {
  try {
    console.log('='.repeat(60))
    console.log('📧 Envio Manual de Newsletter')
    console.log('='.repeat(60))
    console.log(`\nArtigo: ${POST_SLUG}\n`)
    
    // Busca o post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', POST_SLUG)
      .eq('locale', 'pt-BR')
      .single()
    
    if (postError || !post) {
      throw new Error('Post não encontrado: ' + (postError?.message || POST_SLUG))
    }
    
    console.log('✅ Post encontrado:', post.title)
    console.log('   Categoria:', post.category)
    console.log('   Publicado:', post.published ? 'Sim' : 'Não')
    
    // Busca assinantes verificados
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, name, locale')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'pt-BR') // Apenas PT-BR para este artigo
    
    if (subError) {
      throw new Error('Erro ao buscar assinantes: ' + subError.message)
    }
    
    if (!subscribers || subscribers.length === 0) {
      console.log('\n⚠️ Nenhum assinante encontrado!')
      return
    }
    
    console.log(`\n📬 Enviando para ${subscribers.length} assinante(s)...`)
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.catbytes.site'
    const postUrl = `${baseUrl}/pt-BR/blog/${post.slug}`
    
    // Enviar emails
    const results = await Promise.allSettled(
      subscribers.map(subscriber => 
        resend.emails.send({
          from: 'CatBytes <contato@catbytes.site>',
          to: subscriber.email,
          subject: `🚀 Novo Artigo: ${post.title}`,
          html: getNewPostEmailHTML(
            subscriber.name || 'Amigo',
            post.title,
            post.excerpt,
            post.cover_image_url,
            postUrl,
            'pt-BR',
            baseUrl
          )
        })
      )
    )
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Resultado do Envio:')
    console.log('='.repeat(60))
    
    const successful = results.filter(r => r.status === 'fulfilled')
    const failed = results.filter(r => r.status === 'rejected')
    
    console.log(`✅ Enviados com sucesso: ${successful.length}`)
    console.log(`❌ Falhas: ${failed.length}`)
    
    if (failed.length > 0) {
      console.log('\nErros:')
      failed.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.reason}`)
      })
    }
    
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    process.exit(1)
  }
}

main()
