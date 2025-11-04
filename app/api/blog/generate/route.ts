import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Resend } from 'resend'
import { db, generateSlug, supabaseAdmin, uploadImageFromUrl } from '@/lib/supabase'
import { SEO_KEYWORDS, BLOG_TOPICS, BLOG_CATEGORIES } from '@/types/blog'
import type { AIGeneratedPost, BlogPostInsert } from '@/types/blog'
import { getNewPostEmailHTML } from '@/lib/email-templates'
import { translatePostToEnglish, estimateTranslationCost } from '@/lib/translation-service'

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

    const dallEImageUrl = imageResponse.data?.[0]?.url
    if (!dallEImageUrl) {
      throw new Error('No image generated from DALL-E')
    }

    console.log('[Generate] DALL-E image generated:', dallEImageUrl)

    // ====== STEP 2.5: Upload image to Supabase Storage ======
    console.log('[Generate] Uploading image to Supabase Storage...')
    const slug = generateSlug(generatedPost.title)

    let coverImageUrl: string
    try {
      coverImageUrl = await uploadImageFromUrl(dallEImageUrl, slug)
      console.log('[Generate] Image uploaded to Supabase:', coverImageUrl)
    } catch (uploadError) {
      console.error('[Generate] Failed to upload to Supabase, using DALL-E URL as fallback:', uploadError)
      coverImageUrl = dallEImageUrl // Fallback to DALL-E URL if upload fails
    }

    // ====== STEP 3: Create post in database ======

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
      locale: 'pt-BR', // Portuguese version (original)
    }

    const createdPost = await db.createPost(postData)
    console.log('[Generate] Post created:', createdPost.id)

    // ====== STEP 3.5: Translate post to English ======
    let translatedPost: any = null
    try {
      console.log('[Generate] Translating post to English...')
      const translationStartTime = Date.now()
      
      const translatedContent = await translatePostToEnglish({
        title: generatedPost.title,
        content: generatedPost.content,
        excerpt: generatedPost.excerpt,
        category: selectedCategory
      })

      const translationTime = Date.now() - translationStartTime
      const estimatedCost = estimateTranslationCost({
        title: generatedPost.title,
        content: generatedPost.content,
        excerpt: generatedPost.excerpt,
        category: selectedCategory
      })
      
      console.log(`[Generate] Translation completed in ${translationTime}ms (estimated cost: $${estimatedCost.toFixed(4)})`)

      // Create English version with same slug + "-en"
      const enSlug = `${slug}-en`
      
      const enPostData: BlogPostInsert = {
        title: translatedContent.title,
        slug: enSlug,
        excerpt: translatedContent.excerpt,
        content: translatedContent.content,
        cover_image_url: coverImageUrl, // Same image for both languages
        keywords: selectedKeywords,
        seo_title: translatedContent.title,
        seo_description: translatedContent.excerpt,
        published: true,
        category: translatedContent.category,
        tags: generatedPost.tags || [],
        author: 'CatBytes AI',
        ai_model: 'gpt-4o-mini',
        generation_prompt: selectedTopic,
        locale: 'en-US', // English version
        translated_from: createdPost.id // Link to original PT post
      }

      translatedPost = await db.createPost(enPostData)
      console.log('[Generate] English translation saved:', translatedPost.id)

    } catch (translationError) {
      console.error('[Generate] Translation error (continuing without translation):', translationError)
      // Don't fail the entire generation if translation fails
    }

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
      translatedPost: translatedPost || null,
      generationTime,
      metadata: {
        topic: selectedTopic,
        category: selectedCategory,
        keywords: selectedKeywords,
        model: 'gpt-4o-mini',
        imageModel: 'dall-e-3',
        translated: !!translatedPost,
        languages: translatedPost ? ['pt-BR', 'en-US'] : ['pt-BR'],
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
