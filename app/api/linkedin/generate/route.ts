import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * API para gerar posts do LinkedIn
 * POST /api/linkedin/generate
 * 
 * Body: {
 *   type: 'blog-article' | 'fullstack-random'
 *   articleSlug?: string (se type === 'blog-article')
 * }
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('[LinkedIn Generate] OPENAI_API_KEY não configurada')
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null

/**
 * Gera imagem com DALL-E 3
 */
async function generateImageWithDALLE(prompt: string): Promise<string | null> {
  try {
    if (!openai) throw new Error('OpenAI não inicializado')

    console.log('[LinkedIn Generate] 🎨 Gerando imagem com DALL-E...')
    console.log('[LinkedIn Generate] Prompt:', prompt)

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    })

    if (!response.data || response.data.length === 0) {
      console.log('[LinkedIn Generate] ⚠️ DALL-E não retornou dados')
      return null
    }

    const imageUrl = response.data[0]?.url
    
    if (imageUrl) {
      console.log('[LinkedIn Generate] ✅ Imagem gerada com sucesso')
      return imageUrl
    }

    console.log('[LinkedIn Generate] ⚠️ DALL-E não retornou URL da imagem')
    return null

  } catch (error) {
    console.error('[LinkedIn Generate] ❌ Erro ao gerar imagem:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      console.error('[LinkedIn Generate] OpenAI não inicializado')
      return NextResponse.json(
        { error: 'Serviço de IA não disponível. Verifique OPENAI_API_KEY.' },
        { status: 500 }
      )
    }

    const { type, articleSlug } = await request.json()

    console.log('[LinkedIn Generate] Tipo:', type, 'Slug:', articleSlug)

    if (!type || !['blog-article', 'fullstack-random'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo inválido. Use "blog-article" ou "fullstack-random"' },
        { status: 400 }
      )
    }

    let postText = ''
    let imagePrompt = ''
    let article = null

    if (type === 'blog-article') {
      if (!articleSlug) {
        return NextResponse.json(
          { error: 'articleSlug é obrigatório para type="blog-article"' },
          { status: 400 }
        )
      }

      // Buscar artigo no banco
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Erro ao conectar com o banco de dados' },
          { status: 500 }
        )
      }

      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('title, excerpt, slug, content')
        .eq('slug', articleSlug)
        .eq('status', 'published')
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Artigo não encontrado' },
          { status: 404 }
        )
      }

      article = data

      // Gerar post sobre o artigo (com URL incluída)
      const articleUrl = `https://www.catbytes.site/pt-BR/blog/${article.slug}`
      const result = await generateBlogArticlePost(article, articleUrl)
      postText = result.text
      imagePrompt = result.imagePrompt

    } else if (type === 'fullstack-random') {
      // Gerar post aleatório sobre fullstack
      const result = await generateFullstackPost()
      postText = result.text
      imagePrompt = result.imagePrompt
    }

    // Gerar imagem com DALL-E
    console.log('[LinkedIn Generate] Gerando imagem com DALL-E...')
    const generatedImageUrl = await generateImageWithDALLE(imagePrompt)

    return NextResponse.json({
      success: true,
      postText,
      imagePrompt,
      imageUrl: generatedImageUrl,
      article: article ? {
        title: article.title,
        slug: article.slug,
        url: `https://www.catbytes.site/pt-BR/blog/${article.slug}`
      } : null
    })

  } catch (error) {
    console.error('[LinkedIn Generate] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar post',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

/**
 * Gera post sobre um artigo do blog
 */
async function generateBlogArticlePost(article: any, articleUrl: string) {
  if (!openai) throw new Error('OpenAI não inicializado')

  const prompt = `
Você é um social media manager criando um post para o LinkedIn.

ARTIGO DO BLOG:
Título: ${article.title}
Resumo: ${article.excerpt || 'Sem resumo'}
URL: ${articleUrl}

OBJETIVO:
Criar um post chamativo que:
1. Apresente o artigo de forma interessante
2. Convide as pessoas a lerem no site
3. Incentive a inscrição na newsletter
4. INCLUA a URL do artigo no final do post

REGRAS:
- Tom profissional mas acessível
- Use emojis relevantes (máximo 3)
- Destaque o principal benefício/aprendizado do artigo
- Inclua call-to-action claro
- Máximo 1300 caracteres
- Não use hashtags demais (máximo 3)
- OBRIGATÓRIO: Adicione um emoji de link (👉 ou 🔗) seguido da URL completa do artigo no final

ESTRUTURA:
1. Hook inicial (pergunta ou afirmação impactante)
2. Resumo do conteúdo do artigo
3. Call-to-action (ler no site + inscrever newsletter)
4. URL do artigo (com emoji de link)
5. Hashtags relevantes

Retorne APENAS o texto do post, sem título ou formatação extra.
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 800
  })

  const postText = completion.choices[0]?.message?.content || ''

  // Gerar prompt para imagem contextualizado com o artigo
  const imagePromptCompletion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ 
      role: 'user', 
      content: `
Analise este artigo do blog:

Título: "${article.title}"
Resumo: "${article.excerpt || 'Sem resumo'}"

E o post criado:
"${postText}"

Crie um prompt em inglês para DALL-E 3 que gere uma imagem profissional que:

1. REPRESENTE VISUALMENTE O TEMA PRINCIPAL do artigo
2. Seja relacionada ao conteúdo específico, não apenas "tecnologia genérica"
3. Inclua elementos visuais que remetam ao assunto tratado
4. Tenha estilo moderno, profissional e limpo
5. Use cores adequadas para LinkedIn (gradientes azul/roxo ou tons profissionais)
6. Proporção: 1:1 (quadrado)

IMPORTANTE:
- O prompt deve ser específico para o tema do artigo
- Evite termos genéricos como "coding" ou "web development" se não forem o tema central
- Foque no BENEFÍCIO ou CONCEITO principal do artigo
- Máximo 200 caracteres

Retorne APENAS o prompt da imagem em inglês, sem explicações.
`
    }],
    temperature: 0.7,
    max_tokens: 250
  })

  const imagePrompt = imagePromptCompletion.choices[0]?.message?.content || ''

  return {
    text: postText.trim(),
    imagePrompt: imagePrompt.trim()
  }
}

/**
 * Gera post aleatório sobre benefícios do fullstack em diferentes nichos
 */
async function generateFullstackPost() {
  if (!openai) throw new Error('OpenAI não inicializado')

  const nichos = [
    'escritórios de advocacia',
    'clínicas médicas',
    'consultórios de psicologia',
    'clínicas de nutrição',
    'agências de marketing',
    'e-commerce',
    'startups de tecnologia',
    'empresas de educação',
    'setor financeiro',
    'indústria da saúde'
  ]

  const nicho = nichos[Math.floor(Math.random() * nichos.length)]

  const prompt = `
Você é um desenvolvedor fullstack criando conteúdo de valor para o LinkedIn.

TEMA: Benefícios do desenvolvimento fullstack para ${nicho}

OBJETIVO:
Criar um post educativo e engajador que:
1. Explique como o desenvolvimento fullstack pode ajudar ${nicho}
2. Destaque 2-3 benefícios específicos
3. Mostre autoridade técnica sem ser arrogante
4. Convide para conhecer mais sobre nossos serviços

REGRAS:
- Tom profissional e consultivo
- Use emojis relevantes (máximo 4)
- Seja específico sobre como a tecnologia resolve problemas reais
- Inclua call-to-action sutil
- Máximo 1500 caracteres
- Use hashtags relevantes (máximo 4)

ESTRUTURA:
1. Hook sobre um desafio comum do nicho
2. Como o fullstack resolve esse desafio
3. Benefícios práticos (performance, custos, integração)
4. Call-to-action (conheça nosso trabalho / visite o site)
5. Hashtags

Retorne APENAS o texto do post.
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 1000
  })

  const postText = completion.choices[0]?.message?.content || ''

  // Gerar prompt para imagem contextualizado
  const imagePromptCompletion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `
Analise este post do LinkedIn sobre desenvolvimento fullstack para ${nicho}:

"${postText}"

Crie um prompt em inglês para DALL-E 3 que gere uma imagem profissional e moderna que:

1. REPRESENTE VISUALMENTE O CONTEXTO: ${nicho} + tecnologia
2. Mostre a integração entre o setor (${nicho}) e soluções tecnológicas
3. Elementos visuais que podem incluir:
   - Símbolos/ícones relacionados a ${nicho}
   - Interface de software/dashboard
   - Conceito de integração e eficiência
   - Cores modernas (gradientes azul/roxo ou tons profissionais)

IMPORTANTE:
- O prompt deve ser específico para ${nicho}, NÃO genérico sobre "fullstack development"
- Use vocabulário visual relacionado ao contexto do nicho
- Estilo: profissional, moderno, limpo, adequado para LinkedIn
- Proporção: 1:1 (quadrado)
- Máximo 200 caracteres

Retorne APENAS o prompt da imagem em inglês, sem explicações.
`
    }],
    temperature: 0.7,
    max_tokens: 250
  })

  const imagePrompt = imagePromptCompletion.choices[0]?.message?.content || ''

  return {
    text: postText.trim(),
    imagePrompt: imagePrompt.trim()
  }
}
