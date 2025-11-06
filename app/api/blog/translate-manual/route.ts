import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, targetLanguage = 'en', sendNewsletter = true } = body

    // Buscar post original
    const { data: originalPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError || !originalPost) {
      return NextResponse.json({
        success: false,
        error: 'Post não encontrado'
      }, { status: 404 })
    }

    // Traduzir com OpenAI
    console.log(`🌍 Traduzindo post "${originalPost.title}" para ${targetLanguage}...`)
    
    const translationPrompt = `Você é um tradutor especialista. Traduza o seguinte conteúdo de blog do português para o inglês, mantendo o tom ${originalPost.tone || 'professional'} e a formatação markdown:

TÍTULO:
${originalPost.title}

EXCERPT:
${originalPost.excerpt}

CONTEÚDO:
${originalPost.content}

Retorne APENAS um JSON válido no seguinte formato:
{
  "title": "título traduzido",
  "excerpt": "excerpt traduzido",
  "content": "conteúdo traduzido com markdown preservado"
}

IMPORTANTE: Preserve toda formatação markdown, links e código.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in technical content translation.'
        },
        {
          role: 'user',
          content: translationPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })

    const translated = JSON.parse(completion.choices[0].message.content || '{}')

    // Criar slug traduzido
    const translatedSlug = `${originalPost.slug}-en`

    // Salvar post traduzido
    const { data: translatedPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        title: translated.title,
        slug: translatedSlug,
        excerpt: translated.excerpt,
        content: translated.content,
        author: originalPost.author,
        status: 'published',
        locale: 'en-US',
        original_post_id: postId,
        published_at: new Date().toISOString(),
        cover_image_url: originalPost.cover_image_url,
        category: originalPost.category,
        tags: originalPost.tags,
        reading_time: originalPost.reading_time,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving translated post:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar post traduzido'
      }, { status: 500 })
    }

    // Enviar newsletter para assinantes em inglês se solicitado
    if (sendNewsletter) {
      try {
        await sendTranslatedNewsletter(translatedPost)
      } catch (error) {
        console.error('Error sending newsletter:', error)
        // Não falha a tradução se newsletter falhar
      }
    }

    // Notificar admin por email
    await sendAdminNotification({
      type: 'translation_complete',
      originalTitle: originalPost.title,
      translatedTitle: translated.title,
      slug: translatedSlug
    })

    return NextResponse.json({
      success: true,
      post: translatedPost,
      message: `Post traduzido com sucesso! Disponível em /en-US/blog/${translatedSlug}`,
      tokensUsed: completion.usage?.total_tokens || 0
    })
  } catch (error) {
    console.error('Error in translation endpoint:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao traduzir post'
    }, { status: 500 })
  }
}

// Enviar newsletter para assinantes em inglês
async function sendTranslatedNewsletter(post: any) {
  // Buscar assinantes que optaram por inglês
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email, name')
    .eq('confirmed', true)
    .eq('preferred_language', 'en-US')

  if (!subscribers || subscribers.length === 0) {
    console.log('Nenhum assinante em inglês encontrado')
    return
  }

  console.log(`📧 Enviando newsletter para ${subscribers.length} assinantes em inglês`)

  // Enviar email via Resend
  const response = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      subscribers.map(sub => ({
        from: 'CATBytes <blog@catbytes.site>',
        to: sub.email,
        subject: `📝 New Post: ${post.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">🎉 New Blog Post!</h1>
            <h2 style="color: #0066cc;">${post.title}</h2>
            <p style="color: #666; line-height: 1.6;">${post.excerpt}</p>
            <a href="https://catbytes.site/en-US/blog/${post.slug}" 
               style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Read More
            </a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              You're receiving this because you subscribed to CATBytes newsletter (English version).<br>
              <a href="https://catbytes.site/en-US/newsletter/unsubscribe?email=${sub.email}">Unsubscribe</a>
            </p>
          </div>
        `
      }))
    )
  })

  if (!response.ok) {
    throw new Error('Failed to send newsletter emails')
  }

  console.log('✅ Newsletter enviada com sucesso!')
}

// Notificar admin
async function sendAdminNotification(data: {
  type: string
  originalTitle: string
  translatedTitle: string
  slug: string
}) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'CATBytes Admin <admin@catbytes.site>',
        to: 'izadora@catbytes.site',
        subject: '✅ Tradução de Post Concluída',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>🌍 Tradução Concluída!</h2>
            <p><strong>Post Original:</strong> ${data.originalTitle}</p>
            <p><strong>Post Traduzido:</strong> ${data.translatedTitle}</p>
            <p><strong>Disponível em:</strong> <a href="https://catbytes.site/en-US/blog/${data.slug}">Ver Post</a></p>
            <p>✅ Newsletter enviada para assinantes em inglês</p>
          </div>
        `
      })
    })
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}
