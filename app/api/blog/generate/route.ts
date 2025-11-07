import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Resend } from 'resend'
import { db, generateSlug, supabaseAdmin, uploadImageFromUrl } from '@/lib/supabase'
import { SEO_KEYWORDS, BLOG_TOPICS, BLOG_CATEGORIES } from '@/types/blog'
import type { AIGeneratedPost, BlogPostInsert } from '@/types/blog'
import { getNewPostEmailHTML } from '@/lib/email-templates'
import { translatePostToEnglish, estimateTranslationCost } from '@/lib/translation-service'
import { 
  getCurrentBlogTheme, 
  getRandomTopicForTheme, 
  generateImagePromptForTheme, 
  getThemeKeywords,
  getBlogScheduleInfo 
} from '@/lib/blog-scheduler'

// =====================================================
// POST /api/blog/generate
// Generate AI blog post with OpenAI + Image
// =====================================================

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for AI generation + translation + emails

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log('[Generate] Starting blog post generation...')

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('[Generate] OpenAI API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Validate Supabase
    if (!supabaseAdmin) {
      console.error('[Generate] Supabase admin client not configured')
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      )
    }

    console.log('[Generate] Environment validated successfully')

    // Get request body (optional parameters)
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // No body provided, use defaults
      console.log('[Generate] No request body, using defaults')
    }

    const { topic, keywords, category, theme } = body

    // Determine blog theme based on current day or provided theme
    const blogTheme = theme || getCurrentBlogTheme()
    const scheduleInfo = getBlogScheduleInfo()
    
    // Select topic based on theme
    const selectedTopic = topic || getRandomTopicForTheme(blogTheme)
    const selectedCategory = category || blogTheme
    const selectedKeywords = keywords || [
      ...getThemeKeywords(blogTheme),
      ...SEO_KEYWORDS.slice(0, 2),
    ]

    console.log('[Generate] Blog theme:', blogTheme)
    console.log('[Generate] Creating post about:', selectedTopic)
    console.log('[Generate] Schedule info:', scheduleInfo)

    // ====== STEP 1: Generate blog content with ChatGPT ======
    const themePrompts: Record<string, string> = {
      'Automação e Negócios': `Você é um consultor empresarial especialista em transformação digital, escrevendo para o blog da CatBytes - empresa que oferece automação com IA, aplicações web inteligentes e chatbots.

TEMA: ${blogTheme} | TÓPICO: "${selectedTopic}"

PÚBLICO-ALVO: Empresários, gestores, profissionais liberais e recrutadores
OBJETIVO: Mostrar vantagens tangíveis da automação e digitalização

REQUISITOS:
- Tom: Profissional, persuasivo, mas acessível a leigos
- Foque em ROI, economia de tempo, aumento de vendas
- Use dados reais e exemplos práticos de empresas
- Explique benefícios de ter presença digital profissional
- Inclua cases de sucesso (pode ser genérico mas realista)
- Mencione sutilmente como CatBytes ajuda na transformação digital`,

      'Programação e IA': `Você é um educador tech que torna programação e IA acessíveis para iniciantes, escrevendo para o blog da CatBytes.

TEMA: ${blogTheme} | TÓPICO: "${selectedTopic}"

PÚBLICO-ALVO: Iniciantes em programação, curiosos sobre IA, profissionais querendo se atualizar
OBJETIVO: Educar sobre tecnologia de forma simples e prática

REQUISITOS:
- Tom: Didático, amigável, sem jargões excessivos
- Explique conceitos complexos de forma simples
- Use analogias do dia a dia para explicar tecnologia
- Inclua exemplos práticos e step-by-step quando possível
- Inspire pessoas a começarem a programar/usar IA
- Mostre como a tecnologia está mudando o mundo`,

      'Cuidados Felinos': `Você é um veterinário apaixonado por felinos, escrevendo dicas carinhosas sobre cuidados com gatos para o blog da CatBytes.

TEMA: ${blogTheme} | TÓPICO: "${selectedTopic}"

PÚBLICO-ALVO: Tutores de gatos, amantes de felinos, pessoas considerando adotar
OBJETIVO: Educar sobre cuidados felinos e promover bem-estar animal

REQUISITOS:
- Tom: Carinhoso, acolhedor, informativo mas afetuoso
- Foque no amor e cuidado com os felinos
- Use linguagem simples e acessível para todos
- Inclua dicas práticas e sinais de alerta importantes
- Promova adoção responsável e cuidados preventivos
- Seja empático com tutores preocupados
- NÃO mencione CatBytes (tema totalmente diferente)`
    }

    const selectedPrompt = themePrompts[blogTheme] || themePrompts['Automação e Negócios']
    
    const contentPrompt = `${selectedPrompt}

ESTRUTURA: Introdução envolvente, 3-4 seções com subtítulos, conclusão inspiradora
TAMANHO: 700-1000 palavras
SEO: Incluir naturalmente: ${selectedKeywords.join(', ')}

FORMATO JSON:
{
  "title": "Título cativante (máx 70 caracteres)",
  "excerpt": "Resumo atrativo (150-200 caracteres)", 
  "content": "Conteúdo completo em Markdown",
  "seo_title": "Título SEO (55-60 caracteres)",
  "seo_description": "Meta description (150-160 caracteres)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Responda APENAS com JSON válido.`

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
    const imagePrompt = generateImagePromptForTheme(blogTheme, generatedPost.title)

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

    // ====== STEP 3.5: Translate post to English (DISABLED FOR NOW) ======
    // Translation can be enabled later via a separate API endpoint if needed
    let translatedPost: any = null
    
    console.log('[Generate] Translation skipped - generating Portuguese only')

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
              const isEnglish = locale === 'en-US'
              
              // Use translated post for English subscribers if available
              const postData = (isEnglish && translatedPost) ? translatedPost : createdPost
              const postSlug = postData.slug
              const postUrl = `${baseUrl}/${locale}/blog/${postSlug}`
              
              return resend.emails.send({
                from: 'CatBytes <contato@catbytes.site>',
                to: subscriber.email,
                subject: isEnglish 
                  ? `🚀 New Article: ${postData.title}`
                  : `🚀 Novo Artigo: ${postData.title}`,
                html: getNewPostEmailHTML(
                  subscriber.name || (isEnglish ? 'Friend' : 'Amigo'),
                  postData.title,
                  postData.excerpt,
                  postData.cover_image_url,
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
        theme: blogTheme,
        topic: selectedTopic,
        category: selectedCategory,
        keywords: selectedKeywords,
        model: 'gpt-4o-mini',
        imageModel: 'dall-e-3',
        translated: !!translatedPost,
        languages: translatedPost ? ['pt-BR', 'en-US'] : ['pt-BR'],
        scheduleInfo: scheduleInfo,
      },
    })
  } catch (error) {
    const generationTime = Date.now() - startTime
    console.error('[Generate] Error:', error)
    console.error('[Generate] Error type:', typeof error)
    
    let errorMessage = 'Unknown error'
    let errorStack = undefined
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorStack = error.stack
    } else if (typeof error === 'object' && error !== null) {
      try {
        errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error))
      } catch {
        errorMessage = String(error)
      }
    } else {
      errorMessage = String(error)
    }
    
    console.error('[Generate] Error message:', errorMessage)

    // Log error to database
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('blog_generation_log').insert({
          post_id: null,
          status: 'error',
          error_message: errorMessage,
          generation_time_ms: generationTime,
        })
      } catch (dbError) {
        console.error('[Generate] Failed to log error to database:', dbError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate post',
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    )
  }
}
