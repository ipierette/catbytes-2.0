import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
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

    // ====== STEP 4: Log generation ======
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
