/**
 * Blog Social Promoter
 * 
 * Gera e publica posts automáticos no Instagram e LinkedIn
 * para divulgar novos artigos do blog
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

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
  
  // Construir conteúdo principal (Instagram tem limite de caracteres)
  const mainContent = `📝 ${blogPost.title}

${blogPost.excerpt}

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
  
  // LinkedIn permite posts mais longos e profissionais
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blogPost.slug}`
  
  const mainContent = `📝 Novo artigo publicado!

${blogPost.title}

${blogPost.excerpt}

🔗 Leia o artigo completo: ${articleUrl}

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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/instagram/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: blogPost.cover_image_url,
        caption: content.fullText,
        auto_publish: true // Publicar imediatamente
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/linkedin/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: content.fullText,
        image_url: blogPost.cover_image_url,
        publish_now: true // Publicar imediatamente
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
 */
export async function promoteArticle(
  blogPost: BlogPost,
  platforms: ('instagram' | 'linkedin')[] = ['instagram', 'linkedin']
): Promise<{
  instagram?: { success: boolean; postId?: string; error?: string }
  linkedin?: { success: boolean; postId?: string; error?: string }
}> {
  const results: any = {}
  
  // Instagram
  if (platforms.includes('instagram')) {
    const instagramContent = await generateInstagramPost(blogPost)
    results.instagram = await publishToInstagram(blogPost, instagramContent)
  }
  
  // LinkedIn
  if (platforms.includes('linkedin')) {
    const linkedInContent = await generateLinkedInPost(blogPost)
    results.linkedin = await publishToLinkedIn(blogPost, linkedInContent)
  }
  
  return results
}
