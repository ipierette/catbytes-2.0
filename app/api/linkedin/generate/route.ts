import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { type, articleSlug } = await request.json()

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

      // Gerar post sobre o artigo
      const result = await generateBlogArticlePost(article)
      postText = result.text
      imagePrompt = result.imagePrompt

    } else if (type === 'fullstack-random') {
      // Gerar post aleatório sobre fullstack
      const result = await generateFullstackPost()
      postText = result.text
      imagePrompt = result.imagePrompt
    }

    return NextResponse.json({
      success: true,
      postText,
      imagePrompt,
      article: article ? {
        title: article.title,
        slug: article.slug,
        url: `https://catbytes.site/blog/${article.slug}`
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
async function generateBlogArticlePost(article: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
Você é um social media manager criando um post para o LinkedIn.

ARTIGO DO BLOG:
Título: ${article.title}
Resumo: ${article.excerpt || 'Sem resumo'}

OBJETIVO:
Criar um post chamativo que:
1. Apresente o artigo de forma interessante
2. Convide as pessoas a lerem no site
3. Incentive a inscrição na newsletter

REGRAS:
- Tom profissional mas acessível
- Use emojis relevantes (máximo 3)
- Destaque o principal benefício/aprendizado do artigo
- Inclua call-to-action claro
- Máximo 1300 caracteres
- Não use hashtags demais (máximo 3)

ESTRUTURA:
1. Hook inicial (pergunta ou afirmação impactante)
2. Resumo do conteúdo do artigo
3. Call-to-action (ler no site + inscrever newsletter)
4. Hashtags relevantes

Retorne APENAS o texto do post, sem título ou formatação extra.
`

  const result = await model.generateContent(prompt)
  const postText = result.response.text()

  // Gerar prompt para imagem
  const imagePromptResult = await model.generateContent(`
Crie um prompt em inglês para gerar uma imagem moderna e profissional para este post do LinkedIn:

"${postText}"

O prompt deve:
- Ser em inglês
- Descrever uma cena ou conceito visual relacionado ao tema
- Incluir estilo: "modern, professional, tech, gradient background"
- Ser adequado para redes sociais (16:9 ou 1:1)
- Máximo 150 palavras

Retorne APENAS o prompt da imagem, sem explicações.
`)

  const imagePrompt = imagePromptResult.response.text()

  return {
    text: postText.trim(),
    imagePrompt: imagePrompt.trim()
  }
}

/**
 * Gera post aleatório sobre benefícios do fullstack em diferentes nichos
 */
async function generateFullstackPost() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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

  const result = await model.generateContent(prompt)
  const postText = result.response.text()

  // Gerar prompt para imagem
  const imagePromptResult = await model.generateContent(`
Crie um prompt em inglês para gerar uma imagem moderna e profissional para este post do LinkedIn sobre fullstack development:

"${postText.substring(0, 500)}"

O prompt deve:
- Ser em inglês
- Representar visualmente: tecnologia, desenvolvimento web, fullstack, modernidade
- Incluir: "professional, modern tech illustration, coding, fullstack development, gradient purple and blue background, clean design"
- Adequado para LinkedIn (proporção 1:1 ou 16:9)
- Máximo 150 palavras

Retorne APENAS o prompt da imagem.
`)

  const imagePrompt = imagePromptResult.response.text()

  return {
    text: postText.trim(),
    imagePrompt: imagePrompt.trim()
  }
}
