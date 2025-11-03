import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Resend } from 'resend'
import { db, generateSlug, supabaseAdmin } from '@/lib/supabase'
import { SEO_KEYWORDS, BLOG_TOPICS, BLOG_CATEGORIES } from '@/types/blog'
import type { AIGeneratedPost, BlogPostInsert } from '@/types/blog'

// =====================================================
// POST /api/blog/generate
// Generate AI blog post with OpenAI + Image
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for image generation

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// Email template for new blog post notification
function getNewPostEmailHTML(
  name: string,
  title: string,
  excerpt: string,
  coverImageUrl: string,
  postUrl: string,
  locale: string,
  baseUrl: string
): string {
  const isPortuguese = locale === 'pt-BR'
  
  const texts = {
    greeting: isPortuguese ? `Olá, ${name}!` : `Hello, ${name}!`,
    newPost: isPortuguese ? '🚀 Novo Artigo Publicado!' : '🚀 New Article Published!',
    readMore: isPortuguese ? 'Ler Artigo Completo' : 'Read Full Article',
    viewBlog: isPortuguese ? 'Ver Todos os Artigos' : 'View All Articles',
    unsubscribe: isPortuguese ? 'Cancelar inscrição' : 'Unsubscribe',
    footer: isPortuguese 
      ? 'Você está recebendo este email porque se inscreveu na newsletter da CatBytes.'
      : 'You are receiving this email because you subscribed to the CatBytes newsletter.'
  }

  return `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <img src="${baseUrl}/images/catbytes-logo.png" alt="CatBytes" style="height: 80px; width: auto; margin-bottom: 20px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${texts.newPost}</h1>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 30px 40px 20px;">
                    <p style="color: #333333; font-size: 18px; margin: 0; font-weight: 500;">${texts.greeting}</p>
                  </td>
                </tr>

                <!-- Cover Image -->
                ${coverImageUrl ? `
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <img src="${coverImageUrl}" alt="${title}" style="width: 100%; height: auto; border-radius: 8px; display: block;">
                  </td>
                </tr>
                ` : ''}

                <!-- Post Title -->
                <tr>
                  <td style="padding: 0 40px 15px;">
                    <h2 style="color: #1a1a1a; margin: 0; font-size: 26px; font-weight: 700; line-height: 1.3;">${title}</h2>
                  </td>
                </tr>

                <!-- Post Excerpt -->
                <tr>
                  <td style="padding: 0 40px 30px;">
                    <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">${excerpt}</p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${postUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">${texts.readMore}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- View All Posts -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px;">
                    <a href="${postUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">${texts.viewBlog} →</a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-bottom: 15px;">
                          <img src="${baseUrl}/images/logo-desenvolvedora.png" alt="Developer Logo" style="height: 60px; width: auto;">
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px; line-height: 1.5;">${texts.footer}</p>
                          <a href="${baseUrl}/${locale}/newsletter/unsubscribe" style="color: #9ca3af; text-decoration: underline; font-size: 12px;">${texts.unsubscribe}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Validate Supabase
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    // Get request body (optional parameters)
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // No body provided, use defaults
    }

    const { topic, keywords, category } = body

    // Select random topic if not provided
    const selectedTopic = topic || BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)]
    const selectedCategory = category || BLOG_CATEGORIES[Math.floor(Math.random() * BLOG_CATEGORIES.length)]
    const selectedKeywords = keywords || [
      ...SEO_KEYWORDS.slice(0, 3),
      selectedCategory.toLowerCase(),
    ]

    console.log('[Generate] Creating post about:', selectedTopic)

    // ====== STEP 1: Generate blog content with ChatGPT ======
    const contentPrompt = `Você é um redator especialista em tecnologia e transformação digital, escrevendo para o blog da CatBytes - uma empresa que oferece serviços digitais com IA, aplicações web inteligentes e chatbots personalizados.

TAREFA: Escreva um artigo de blog completo e profissional sobre o tema: "${selectedTopic}"

REQUISITOS:
- Tom: Profissional mas acessível, com toques criativos
- Público-alvo: Empresários, gestores e profissionais de TI
- Objetivo: Educar, engajar e gerar leads qualificados
- SEO: Incluir naturalmente as palavras-chave: ${selectedKeywords.join(', ')}
- Estrutura: Introdução engajante, 3-5 seções com subtítulos, conclusão com CTA
- Tamanho: 800-1200 palavras
- Inclua exemplos práticos e dados quando relevante
- Use listas e bullets para melhor legibilidade
- Mencione sutilmente como a CatBytes pode ajudar (sem ser vendedor demais)

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título impactante e SEO-friendly (max 70 caracteres)",
  "excerpt": "Resumo atrativo do artigo (150-200 caracteres)",
  "content": "Conteúdo completo em Markdown com ## para títulos, ### para subtítulos, **negrito**, listas, etc.",
  "seo_title": "Título otimizado para SEO (55-60 caracteres)",
  "seo_description": "Meta description otimizada (150-160 caracteres)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Gere APENAS o JSON, sem texto adicional antes ou depois.`

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um redator especialista em conteúdo tech e marketing digital. Sempre responda APENAS com JSON válido.',
        },
        {
          role: 'user',
          content: contentPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    })

    const aiResponse = chatCompletion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No content generated from OpenAI')
    }

    const generatedPost: AIGeneratedPost = JSON.parse(aiResponse)
    console.log('[Generate] Content generated:', generatedPost.title)

    // ====== STEP 2: Generate cover image with DALL-E ======
    const imagePrompt = `Professional tech blog header image for article about "${generatedPost.title}".
Modern, clean design with technology elements (circuits, AI, code) combined with cat-themed accents (subtle paw prints, cat silhouette).
Colors: Purple, blue, pink gradient. Style: Minimalist, professional, web-ready.
No text in image. Aspect ratio: 16:9. High quality.`

    console.log('[Generate] Creating cover image...')

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'vivid',
    })

    const coverImageUrl = imageResponse.data?.[0]?.url
    if (!coverImageUrl) {
      throw new Error('No image generated from DALL-E')
    }

    console.log('[Generate] Image generated:', coverImageUrl)

    // ====== STEP 3: Create post in database ======
    const slug = generateSlug(generatedPost.title)

    const postData: BlogPostInsert = {
      title: generatedPost.title,
      slug,
      excerpt: generatedPost.excerpt,
      content: generatedPost.content,
      cover_image_url: coverImageUrl,
      keywords: selectedKeywords,
      seo_title: generatedPost.seo_title,
      seo_description: generatedPost.seo_description,
      published: true,
      category: selectedCategory,
      tags: generatedPost.tags || [],
      author: 'CatBytes AI',
      ai_model: 'gpt-4o-mini',
      generation_prompt: selectedTopic,
    }

    const createdPost = await db.createPost(postData)
    console.log('[Generate] Post created:', createdPost.id)

    // ====== STEP 4: Send to newsletter subscribers ======
    if (resend) {
      try {
        console.log('[Generate] Fetching verified newsletter subscribers...')
        
        const { data: subscribers, error: subError } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('email, name, locale')
          .eq('verified', true)
          .eq('subscribed', true)

        if (subError) {
          console.error('[Generate] Error fetching subscribers:', subError)
        } else if (subscribers && subscribers.length > 0) {
          console.log(`[Generate] Sending new post notification to ${subscribers.length} subscribers...`)
          
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
          
          // Send emails in batches to avoid rate limits
          const batchSize = 50
          for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize)
            
            const emailPromises = batch.map(subscriber => {
              const locale = subscriber.locale || 'pt-BR'
              const postUrl = `${baseUrl}/${locale}/blog`
              
              return resend.emails.send({
                from: 'CatBytes <contato@catbytes.site>',
                to: subscriber.email,
                subject: locale === 'pt-BR' 
                  ? `🚀 Novo Artigo: ${createdPost.title}`
                  : `🚀 New Article: ${createdPost.title}`,
                html: getNewPostEmailHTML(
                  subscriber.name || 'Amigo',
                  createdPost.title,
                  createdPost.excerpt,
                  createdPost.cover_image_url,
                  postUrl,
                  locale,
                  baseUrl
                ),
              })
            })
            
            await Promise.allSettled(emailPromises)
            console.log(`[Generate] Sent batch ${Math.floor(i / batchSize) + 1}`)
          }
          
          console.log('[Generate] Newsletter emails sent successfully!')
        } else {
          console.log('[Generate] No verified subscribers to notify')
        }
      } catch (emailError) {
        console.error('[Generate] Error sending newsletter emails:', emailError)
        // Don't fail post creation if email fails
      }
    }

    // ====== STEP 5: Log generation ======
    const generationTime = Date.now() - startTime

    await supabaseAdmin.from('blog_generation_log').insert({
      post_id: createdPost.id,
      status: 'success',
      generation_time_ms: generationTime,
    })

    // ====== RESPONSE ======
    return NextResponse.json({
      success: true,
      post: createdPost,
      generationTime,
      metadata: {
        topic: selectedTopic,
        category: selectedCategory,
        keywords: selectedKeywords,
        model: 'gpt-4o-mini',
        imageModel: 'dall-e-3',
      },
    })
  } catch (error) {
    const generationTime = Date.now() - startTime
    console.error('[Generate] Error:', error)

    // Log error to database
    if (supabaseAdmin) {
      await supabaseAdmin.from('blog_generation_log').insert({
        post_id: null,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        generation_time_ms: generationTime,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
