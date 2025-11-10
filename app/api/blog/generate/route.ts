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

    const { topic, keywords, category, theme, textOnly, generateOnly } = body

    // Se generateOnly=true, apenas gera o conteúdo sem salvar no banco
    if (generateOnly) {
      console.log('[Generate] Generate-only mode: will return content without saving to database')
    }

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

    // ====== VALIDATION: Check if this topic was recently used ======
    console.log('[Generate] Checking for recent posts with similar topics...')
    
    const { data: recentPosts, error: recentError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, generation_prompt, created_at')
      .order('created_at', { ascending: false })
      .limit(20) // Check last 20 posts
    
    if (recentError) {
      console.error('[Generate] Error checking recent posts:', recentError)
    } else if (recentPosts && recentPosts.length > 0) {
      // Check if topic was used recently
      const topicUsedRecently = recentPosts.some(post => 
        post.generation_prompt?.toLowerCase().includes(selectedTopic.toLowerCase()) ||
        selectedTopic.toLowerCase().includes(post.generation_prompt?.toLowerCase() || '')
      )
      
      if (topicUsedRecently) {
        console.warn('[Generate] ⚠️ Topic was used recently, selecting alternative...')
        
        // Try to find an unused topic from the same theme
        const usedPrompts = recentPosts
          .map(p => p.generation_prompt?.toLowerCase())
          .filter(Boolean)
        
        const themeTopics = BLOG_TOPICS[blogTheme as keyof typeof BLOG_TOPICS]
        const availableTopics = themeTopics.filter((topic: string) => 
          !usedPrompts.some((used: string | undefined) => 
            used?.includes(topic.toLowerCase()) || 
            topic.toLowerCase().includes(used || '')
          )
        )
        
        if (availableTopics.length > 0) {
          const alternativeTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)]
          console.log('[Generate] ✅ Using alternative topic:', alternativeTopic)
          // Update selectedTopic by reassigning
          const finalTopic = alternativeTopic
          return await POST(request) // Recursive call with new topic context
        } else {
          console.log('[Generate] ⚠️ All topics used recently, proceeding with original (will add uniqueness later)')
        }
      } else {
        console.log('[Generate] ✅ Topic is fresh - not used recently')
      }
      
      // Also check for exact title duplicates in database
      const existingTitles = recentPosts.map(p => p.title.toLowerCase())
      console.log('[Generate] Stored', existingTitles.length, 'recent titles for duplicate check')
    }

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
    
    // Build list of recent titles to avoid
    const recentTitlesWarning = recentPosts && recentPosts.length > 0
      ? `\n\n⚠️ IMPORTANTE - NÃO USE ESTES TÍTULOS (já existem posts recentes):\n${recentPosts.slice(0, 10).map(p => `- "${p.title}"`).join('\n')}\n\nCRIE UM TÍTULO COMPLETAMENTE DIFERENTE E ÚNICO!`
      : ''
    
    const contentPrompt = `${selectedPrompt}${recentTitlesWarning}

ESTRUTURA: Introdução envolvente, 3-4 seções com subtítulos, conclusão inspiradora
TAMANHO: 700-1000 palavras
SEO: Incluir naturalmente: ${selectedKeywords.join(', ')}

📚 OBRIGATÓRIO - CITAÇÕES DE FONTES:
- Cite pelo menos 2-3 fontes externas confiáveis (websites, estudos, estatísticas)
- Formato: "Segundo [Nome da Fonte](URL), [estatística/citação]"
- Prefira: sites governamentais, universidades, empresas de pesquisa (Gartner, McKinsey, etc), blogs tech renomados
- Exemplo: "De acordo com [Gartner](https://gartner.com), 75% das empresas..."
- Adicione as citações no texto onde fazem sentido contextualmente

❓ OBRIGATÓRIO - FAQ (Perguntas Frequentes):
- Adicione seção "## Perguntas Frequentes" no final do artigo (antes da conclusão)
- Inclua 4-6 perguntas e respostas práticas
- Use formato:
  ### Pergunta 1?
  Resposta completa (2-3 linhas)
  
  ### Pergunta 2?
  Resposta completa (2-3 linhas)
- Perguntas devem ser baseadas em dúvidas reais que leitores teriam sobre o tema
- Respostas diretas, práticas e objetivas

FORMATO JSON:
{
  "title": "Título cativante (máx 70 caracteres) - DEVE SER ÚNICO E DIFERENTE DOS LISTADOS ACIMA",
  "excerpt": "Resumo atrativo (150-200 caracteres)", 
  "content": "Conteúdo completo em Markdown (incluindo citações inline e seção FAQ)",
  "seo_title": "Título SEO (55-60 caracteres)",
  "seo_description": "Meta description (150-160 caracteres)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "sources": [
    {"name": "Nome da fonte 1", "url": "https://exemplo1.com"},
    {"name": "Nome da fonte 2", "url": "https://exemplo2.com"}
  ]
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

    // ====== VALIDATION: Check for duplicate titles and slugs ======
    const slug = generateSlug(generatedPost.title)
    
    console.log('[Generate] Checking for duplicate titles/slugs...')
    const { data: existingPosts, error: checkError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug')
      .or(`title.eq.${generatedPost.title},slug.eq.${slug}`)
    
    if (checkError) {
      console.error('[Generate] Error checking duplicates:', checkError)
    } else if (existingPosts && existingPosts.length > 0) {
      console.warn('[Generate] ⚠️ Found duplicate post:', existingPosts[0])
      
      // Add timestamp suffix to make it unique
      const timestamp = Date.now()
      generatedPost.title = `${generatedPost.title} (${new Date().toLocaleDateString('pt-BR')})`
      console.log('[Generate] ✅ Title made unique:', generatedPost.title)
    } else {
      console.log('[Generate] ✅ No duplicates found - title is unique')
    }

    // ====== GENERATE-ONLY MODE: Return content without saving ======
    if (generateOnly) {
      console.log('[Generate] Generate-only mode: returning content without database save')
      
      let imagePromptSuggestion: string | null = null
      let contentImagePrompts: string[] = []
      
      if (textOnly) {
        // Gera prompts de imagem
        imagePromptSuggestion = generateImagePromptForTheme(blogTheme, generatedPost.title)
        
        const contentSections = generatedPost.content.split('##').filter(s => s.trim().length > 50)
        const numSuggestions = Math.min(3, Math.max(2, Math.floor(contentSections.length / 2)))
        
        for (let i = 0; i < numSuggestions; i++) {
          const section = contentSections[i] || ''
          const sectionTitle = section.split('\n')[0].trim()
          const sectionText = section.substring(0, 200)
          
          contentImagePrompts.push(
            `Diagrama técnico profissional sobre "${sectionTitle}". IMPORTANTE: Inclua texto explicativo em português nos elementos do diagrama. Tipo: ${i % 3 === 0 ? 'Fluxograma' : i % 3 === 1 ? 'Infográfico' : 'Diagrama de arquitetura'}. Estilo: Profissional, educacional, limpo. Cores vibrantes mas equilibradas (azul, roxo, verde). Inclua títulos, labels e descrições curtas em cada elemento. Contexto: ${sectionText}. Alta qualidade, 1200x800px, formato horizontal.`
          )
        }
      }
      
      return NextResponse.json({
        success: true,
        post: {
          ...generatedPost,
          category: selectedCategory,
          cover_image_url: textOnly ? 'https://placehold.co/1792x1024/1e293b/64748b?text=Upload+Required' : null,
        },
        textOnly: !!textOnly,
        imagePrompt: imagePromptSuggestion,
        contentImagePrompts: contentImagePrompts,
        metadata: {
          theme: blogTheme,
          topic: selectedTopic,
          category: selectedCategory,
          keywords: selectedKeywords,
          model: 'gpt-4o-mini',
          generateOnly: true,
        },
      })
    }

    // ====== STEP 2: Generate/Suggest cover image ======
    let coverImageUrl: string
    let imagePromptSuggestion: string | null = null
    let contentImagePrompts: string[] = []

    if (textOnly) {
      // Modo Text-Only: Gera apenas o prompt para imagem (usuário faz upload depois)
      imagePromptSuggestion = generateImagePromptForTheme(blogTheme, generatedPost.title)
      console.log('[Generate] Text-only mode: Image prompt generated for manual creation')
      console.log('[Generate] Image prompt:', imagePromptSuggestion)
      
      // Gera 2-3 sugestões de prompts para imagens de conteúdo
      const contentSections = generatedPost.content.split('##').filter(s => s.trim().length > 50)
      const numSuggestions = Math.min(3, Math.max(2, Math.floor(contentSections.length / 2)))
      
      for (let i = 0; i < numSuggestions; i++) {
        const section = contentSections[i] || ''
        const sectionTitle = section.split('\n')[0].trim()
        const sectionText = section.substring(0, 200) // Primeiros 200 chars da seção
        
        contentImagePrompts.push(
          `Diagrama técnico profissional sobre "${sectionTitle}". IMPORTANTE: Inclua texto explicativo em português nos elementos do diagrama. Tipo: ${i % 3 === 0 ? 'Fluxograma' : i % 3 === 1 ? 'Infográfico' : 'Diagrama de arquitetura'}. Estilo: Profissional, educacional, limpo. Cores vibrantes mas equilibradas (azul, roxo, verde). Inclua títulos, labels e descrições curtas em cada elemento. Contexto: ${sectionText}. Alta qualidade, 1200x800px, formato horizontal.`
        )
      }
      
      console.log('[Generate] Generated', contentImagePrompts.length, 'content image prompts')
      
      // Usa imagem placeholder temporária
      coverImageUrl = 'https://placehold.co/1792x1024/1e293b/64748b?text=Upload+Required'
    } else {
      // Modo Normal: Gera imagem automaticamente com DALL-E
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

      try {
        coverImageUrl = await uploadImageFromUrl(dallEImageUrl, slug)
        console.log('[Generate] Image uploaded to Supabase:', coverImageUrl)
      } catch (uploadError) {
        console.error('[Generate] Failed to upload to Supabase, using DALL-E URL as fallback:', uploadError)
        coverImageUrl = dallEImageUrl // Fallback to DALL-E URL if upload fails
      }
    }

    // ====== STEP 3: Create post in database ======
    // Use the slug already validated and generated above (after duplicate check)

    const postData: BlogPostInsert = {
      title: generatedPost.title,
      slug,
      excerpt: generatedPost.excerpt,
      content: generatedPost.content,
      cover_image_url: coverImageUrl,
      keywords: selectedKeywords,
      seo_title: generatedPost.seo_title,
      seo_description: generatedPost.seo_description,
      published: textOnly ? false : true, // Text-only posts ficam como rascunho até upload de imagem
      category: selectedCategory,
      tags: generatedPost.tags || [],
      author: 'CatBytes AI',
      ai_model: 'gpt-4o-mini',
      generation_prompt: selectedTopic,
      locale: 'pt-BR', // Portuguese version (original)
      image_prompt: textOnly ? imagePromptSuggestion : null,
      content_image_prompts: textOnly && contentImagePrompts.length > 0 ? contentImagePrompts : null,
    }

    const createdPost = await db.createPost(postData)
    console.log('[Generate] Post created:', createdPost.id)

    // Log saved prompts
    if (textOnly && imagePromptSuggestion) {
      console.log('[Generate] Text-only mode: Image prompt saved to database for post:', createdPost.slug)
      console.log('[Generate] Content image prompts saved:', contentImagePrompts.length)
    }

    // ====== STEP 3.6: Translate post to English (DISABLED FOR NOW) ======
    // Translation can be enabled later via a separate API endpoint if needed
    let translatedPost: any = null
    
    console.log('[Generate] Translation skipped - generating Portuguese only')

    // ====== STEP 4: Send to newsletter subscribers (only published posts) ======
    console.log('[Generate] Newsletter sending step - Resend configured:', !!resend)
    console.log('[Generate] Post published status:', createdPost.published)
    
    // Only send newsletter if post is published (not textOnly drafts)
    if (resend && createdPost.published) {
      try {
        console.log('[Generate] Fetching verified newsletter subscribers...')
        
        const { data: subscribers, error: subError } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('email, name, locale')
          .eq('verified', true)
          .eq('subscribed', true)

        console.log('[Generate] Subscribers query result:', { 
          count: subscribers?.length || 0, 
          hasError: !!subError,
          errorDetails: subError 
        })

        if (subError) {
          console.error('[Generate] Error fetching subscribers:', subError)
        } else if (subscribers && subscribers.length > 0) {
          console.log(`[Generate] ✅ Sending new post notification to ${subscribers.length} subscribers...`)
          console.log('[Generate] Post details:', { 
            title: createdPost.title, 
            slug: createdPost.slug 
          })
          
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
            console.log(`[Generate] ✅ Sent batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(subscribers.length / batchSize)}`)
          }
          
          console.log('[Generate] ✅✅✅ Newsletter emails sent successfully!')
        } else {
          console.log('[Generate] ⚠️ No verified subscribers to notify')
        }
      } catch (emailError) {
        console.error('[Generate] ❌ Error sending newsletter emails:', emailError)
        // Don't fail post creation if email fails
      }
    } else if (!createdPost.published) {
      console.log('[Generate] ⚠️ Post is draft (textOnly mode) - skipping newsletter')
    } else {
      console.log('[Generate] ⚠️ Resend not configured - skipping newsletter')
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
      textOnly: !!textOnly,
      imagePrompt: imagePromptSuggestion || null,
      contentImagePrompts: contentImagePrompts,
      metadata: {
        theme: blogTheme,
        topic: selectedTopic,
        category: selectedCategory,
        keywords: selectedKeywords,
        model: 'gpt-4o-mini',
        imageModel: textOnly ? 'manual-upload-required' : 'dall-e-3',
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
