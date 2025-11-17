/**
 * Blog Social Promoter
 * 
 * Gera e publica posts automáticos no Instagram e LinkedIn
 * para divulgar novos artigos do blog
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { logDailyEvent } from './daily-events-logger'

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

// Variações de apresentação da CatBytes IA
const AI_INTRODUCTIONS = [
  "Publicação gerada automaticamente pela CatBytes IA, desenvolvida por Izadora Cury Pierette.",
  
  "Olá! Eu sou a CatBytes IA, criada por Izadora Cury Pierette para compartilhar conteúdos úteis. Vamos ao post de hoje:",
  
  "Prrrrr! Sou a CatBytes IA, a gatificadora da Izadora Cury Pierette. Preparei este conteúdo com cuidado, sem derrubar nada da mesa (dessa vez).",
  
  "Este conteúdo foi produzido pela CatBytes IA, sistema exclusivo de automação e geração de conteúdo desenvolvido por Izadora Cury Pierette. A publicação faz parte do fluxo automatizado de escrita e distribuição inteligente.",
  
  "Miaau! Eu sou a CatBytes IA, assistente criada por Izadora Cury Pierette. Não usei nenhuma pata no teclado desta vez: este post foi gerado com automação inteligente e organizada.",
  
  "Esta é uma publicação automatizada pela CatBytes IA, tecnologia exclusiva desenvolvida por Izadora Cury Pierette para gerenciar comunicação, marketing e processos digitais de forma inteligente e consistente.",
  
  "Miau! Aqui é a CatBytes IA, criada por Izadora Cury Pierette. Ajustei meus bigodes digitais e gerei este post com precisão felina e automação inteligente."
]

interface BlogPost {
  id: string
  title: string
  excerpt: string
  slug: string
  cover_image_url: string
  category?: string
  tags?: string[]
}

interface SocialPostContent {
  introduction: string
  mainContent: string
  hashtags: string[]
  fullText: string
}

/**
 * Seleciona uma introdução aleatória da CatBytes IA
 */
function getRandomIntroduction(): string {
  return AI_INTRODUCTIONS[Math.floor(Math.random() * AI_INTRODUCTIONS.length)]
}

/**
 * Gera hashtags relevantes baseadas no conteúdo do artigo
 */
async function generateHashtags(
  title: string, 
  excerpt: string, 
  category?: string,
  tags?: string[]
): Promise<string[]> {
  if (!genAI) {
    console.error('[Blog Social Promoter] Gemini API not configured')
    // Fallback: hashtags genéricas
    return [
      '#tecnologia',
      '#programacao',
      '#desenvolvimentoweb',
      '#tech',
      '#developer',
      '#codigo',
      '#aprenda',
      '#tutorial',
      '#dicas',
      '#blog'
    ]
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
Você é um especialista em marketing digital e SEO. Gere exatamente 12 hashtags em português brasileiro que sejam:
- Relevantes para o conteúdo descrito abaixo
- Populares e com bom engajamento
- Mix de hashtags específicas e genéricas
- Sem espaços, acentos ou caracteres especiais (apenas #palavra)

TÍTULO: ${title}
DESCRIÇÃO: ${excerpt}
CATEGORIA: ${category || 'tecnologia'}
TAGS: ${tags?.join(', ') || 'programação, web'}

Retorne APENAS as 12 hashtags separadas por vírgula, sem numeração ou texto adicional.
Exemplo: #tecnologia,#programacao,#dev,#webdevelopment
`

    const result = await model.generateContent(prompt)
    const response = result.response.text().trim()
    
    // Parse as hashtags
    const hashtags = response
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.startsWith('#'))
      .slice(0, 12) // Garantir máximo 12
    
    // Se não conseguiu gerar 12, completar com genéricas
    const genericTags = [
      '#tecnologia',
      '#programacao',
      '#desenvolvimentoweb',
      '#tech',
      '#developer',
      '#codigo',
      '#aprenda',
      '#tutorial',
      '#dicas',
      '#blog',
      '#ia',
      '#automacao'
    ]
    
    while (hashtags.length < 12) {
      const nextTag = genericTags.find(tag => !hashtags.includes(tag))
      if (nextTag) hashtags.push(nextTag)
      else break
    }
    
    return hashtags.slice(0, 12)
    
  } catch (error) {
    console.error('[Blog Social Promoter] Error generating hashtags:', error)
    // Fallback com tags genéricas
    return [
      '#tecnologia',
      '#programacao',
      '#desenvolvimentoweb',
      '#tech',
      '#developer',
      '#codigo',
      '#aprenda',
      '#tutorial',
      '#dicas',
      '#blog',
      '#ia',
      '#automacao'
    ]
  }
}

/**
 * Gera conteúdo para post do Instagram
 */
export async function generateInstagramPost(
  blogPost: BlogPost
): Promise<SocialPostContent> {
  const introduction = getRandomIntroduction()
  
  // Gerar hashtags relevantes
  const hashtags = await generateHashtags(
    blogPost.title,
    blogPost.excerpt,
    blogPost.category,
    blogPost.tags
  )
  
  // Verificar se é categoria "cuidados felinos" (case-insensitive)
  const isFelineCare = blogPost.category?.toLowerCase().includes('cuidados felinos') || 
                       blogPost.category?.toLowerCase().includes('felino')
  
  // Mensagem social para artigos de cuidados felinos
  const socialMessage = isFelineCare 
    ? `\n\n🐱💙 Este portfólio tem também uma missão social: incentivar a adoção responsável e promover o bem-estar de felinos domésticos. Por isso, dedicamos parte da nossa produção a artigos informativos sobre saúde, cuidado e proteção de gatinhos.\n`
    : ''
  
  // Construir conteúdo principal (Instagram tem limite de caracteres)
  const mainContent = `📰 NOVO ARTIGO NO BLOG!

📌 ${blogPost.title}

✨ ${blogPost.excerpt}${socialMessage}

🔗 Leia o artigo completo no link da bio!

#catbytes #izadoracurypierette`
  
  // Texto completo com apresentação e hashtags
  const fullText = `${introduction}

${mainContent}

${hashtags.join(' ')}`
  
  return {
    introduction,
    mainContent,
    hashtags,
    fullText: fullText.slice(0, 2200) // Instagram limit
  }
}

/**
 * Gera conteúdo para post do LinkedIn
 */
export async function generateLinkedInPost(
  blogPost: BlogPost
): Promise<SocialPostContent> {
  const introduction = getRandomIntroduction()
  
  // Gerar hashtags relevantes
  const hashtags = await generateHashtags(
    blogPost.title,
    blogPost.excerpt,
    blogPost.category,
    blogPost.tags
  )
  
  // Verificar se é categoria "cuidados felinos" (case-insensitive)
  const isFelineCare = blogPost.category?.toLowerCase().includes('cuidados felinos') || 
                       blogPost.category?.toLowerCase().includes('felino')
  
  // Mensagem social para artigos de cuidados felinos
  const socialMessage = isFelineCare 
    ? `\n\n🐱💙 Missão Social\nEste portfólio tem também uma missão social: incentivar a adoção responsável e promover o bem-estar de felinos domésticos. Por isso, dedicamos parte da nossa produção a artigos informativos sobre saúde, cuidado e proteção de gatinhos.\n`
    : ''
  
  // LinkedIn permite posts mais longos e profissionais
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blogPost.slug}`
  
  const mainContent = `📰 NOVO ARTIGO PUBLICADO

📌 Título: ${blogPost.title}

💡 Resumo:
${blogPost.excerpt}${socialMessage}

🔗 Leia o artigo completo:
${articleUrl}

#CatBytes #IzadoraCuryPierette`
  
  // Texto completo
  const fullText = `${introduction}

${mainContent}

${hashtags.join(' ')}`
  
  return {
    introduction,
    mainContent,
    hashtags,
    fullText: fullText.slice(0, 3000) // LinkedIn limit
  }
}

/**
 * Publica post no Instagram usando a API existente
 */
export async function publishToInstagram(
  blogPost: BlogPost,
  content: SocialPostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    // Usar a API de publicação direta do Instagram
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    // Garantir que tem protocolo
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }
    const cronSecret = process.env.CRON_SECRET
    
    const response = await fetch(`${baseUrl}/api/instagram/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      },
      body: JSON.stringify({
        image_url: blogPost.cover_image_url,
        caption: content.fullText,
        auto_publish: true, // Publicar imediatamente
        blog_category: blogPost.category // Passa categoria do blog
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to publish to Instagram')
    }
    
    const result = await response.json()
    
    return {
      success: true,
      postId: result.instagram_post_id || result.id
    }
    
  } catch (error) {
    console.error('[Blog Social Promoter] Instagram publish error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Publica post no LinkedIn usando a API existente
 */
export async function publishToLinkedIn(
  blogPost: BlogPost,
  content: SocialPostContent
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    // Garantir que tem protocolo
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }
    const cronSecret = process.env.CRON_SECRET
    
    const response = await fetch(`${baseUrl}/api/linkedin/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`
      },
      body: JSON.stringify({
        text: content.fullText,
        image_url: blogPost.cover_image_url, // Imagem da capa do artigo
        publish_now: true, // Publicar imediatamente
        blog_category: blogPost.category // Passa categoria do blog
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to publish to LinkedIn')
    }
    
    const result = await response.json()
    
    return {
      success: true,
      postId: result.post_id || result.id
    }
    
  } catch (error) {
    console.error('[Blog Social Promoter] LinkedIn publish error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Promove um artigo do blog em todas as redes sociais
 * 
 * PUBLICAÇÃO AUTOMÁTICA ATIVADA:
 * - Instagram: auto_publish=true (publica imediatamente via Graph API)
 * - LinkedIn: publish_now=true (publica imediatamente via v2/shares)
 * 
 * Em caso de falha na API, o post é salvo como 'approved' para retry manual.
 */
export async function promoteArticle(
  blogPost: BlogPost,
  platforms: ('instagram' | 'linkedin')[] = ['instagram', 'linkedin']
): Promise<{
  instagram?: { success: boolean; postId?: string; error?: string }
  linkedin?: { success: boolean; postId?: string; error?: string }
}> {
  console.log(`[Blog Social Promoter] Starting auto-publish for: ${blogPost.title}`)
  console.log(`[Blog Social Promoter] Target platforms: ${platforms.join(', ')}`)
  
  const results: any = {}
  
  // Instagram
  if (platforms.includes('instagram')) {
    console.log('[Blog Social Promoter] Generating Instagram content...')
    const instagramContent = await generateInstagramPost(blogPost)
    
    console.log('[Blog Social Promoter] Publishing to Instagram (auto_publish=true)...')
    results.instagram = await publishToInstagram(blogPost, instagramContent)
    
    if (results.instagram.success) {
      console.log(`[Blog Social Promoter] ✅ Instagram published successfully! Post ID: ${results.instagram.postId}`)
      
      // Log evento de sucesso
      await logDailyEvent({
        event_type: 'instagram_published',
        title: blogPost.title,
        description: `Post publicado automaticamente no Instagram`,
        metadata: { postId: results.instagram.postId, blogSlug: blogPost.slug }
      })
    } else {
      console.error(`[Blog Social Promoter] ❌ Instagram publish failed: ${results.instagram.error}`)
      
      // Log evento de falha
      await logDailyEvent({
        event_type: 'instagram_failed',
        title: blogPost.title,
        description: `Falha ao publicar no Instagram`,
        error_message: results.instagram.error
      })
    }
  }
  
  // LinkedIn
  if (platforms.includes('linkedin')) {
    console.log('[Blog Social Promoter] Generating LinkedIn content...')
    const linkedInContent = await generateLinkedInPost(blogPost)
    
    console.log('[Blog Social Promoter] Publishing to LinkedIn (publish_now=true)...')
    results.linkedin = await publishToLinkedIn(blogPost, linkedInContent)
    
    if (results.linkedin.success) {
      console.log(`[Blog Social Promoter] ✅ LinkedIn published successfully! Post ID: ${results.linkedin.postId}`)
      
      // Log evento de sucesso
      await logDailyEvent({
        event_type: 'linkedin_published',
        title: blogPost.title,
        description: `Post publicado automaticamente no LinkedIn`,
        metadata: { postId: results.linkedin.postId, blogSlug: blogPost.slug }
      })
    } else {
      console.error(`[Blog Social Promoter] ❌ LinkedIn publish failed: ${results.linkedin.error}`)
      
      // Log evento de falha
      await logDailyEvent({
        event_type: 'linkedin_failed',
        title: blogPost.title,
        description: `Falha ao publicar no LinkedIn`,
        error_message: results.linkedin.error
      })
    }
  }
  
  // Log final summary
  const totalAttempts = platforms.length
  const successCount = [results.instagram?.success, results.linkedin?.success].filter(Boolean).length
  console.log(`[Blog Social Promoter] Promotion complete: ${successCount}/${totalAttempts} platforms published`)
  
  return results
}
