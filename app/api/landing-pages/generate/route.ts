import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { NICHES, COLOR_THEMES } from '@/lib/landing-pages-constants'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GenerateRequest {
  niche: string
  problem: string
  solution: string
  cta_text: string
  theme_color: string
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { niche, problem, solution, cta_text, theme_color } = body

    // Validação
    if (!niche || !problem || !solution || !cta_text || !theme_color) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar configuração de tema
    const theme = COLOR_THEMES[theme_color as keyof typeof COLOR_THEMES]
    if (!theme) {
      return NextResponse.json(
        { error: 'Tema de cor inválido' },
        { status: 400 }
      )
    }

    // 1. Gerar conteúdo com GPT-4
    console.log('🤖 Gerando conteúdo com GPT-4...')
    const contentResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em copywriting para landing pages de conversão.
Crie conteúdo persuasivo e profissional para capturar leads qualificados.
Retorne APENAS um JSON válido sem markdown, sem comentários, sem quebras de linha dentro das strings.`
        },
        {
          role: 'user',
          content: `Crie uma landing page para:
- Nicho: ${niche}
- Problema: ${problem}
- Solução: ${solution}
- CTA: ${cta_text}

Retorne um JSON com:
{
  "headline": "Título principal impactante (máx 60 caracteres)",
  "subheadline": "Subtítulo complementar (máx 120 caracteres)",
  "benefits": ["benefício 1", "benefício 2", "benefício 3", "benefício 4"],
  "social_proof": "Texto de prova social",
  "urgency": "Texto de urgência/escassez",
  "image_prompt": "Prompt detalhado para DALL-E 3 gerar uma imagem relacionada ao nicho. IMPORTANTE: peça uma imagem SEM TEXTO, sem palavras, sem letras. Apenas visual representativo do nicho."
}`
        }
      ],
      temperature: 0.8,
    })

    const contentText = contentResponse.choices[0].message.content || '{}'
    const content = JSON.parse(contentText)

    // 2. Gerar imagem com DALL-E 3
    console.log('🎨 Gerando imagem com DALL-E 3...')
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${content.image_prompt}. Professional, high-quality, modern style. NO TEXT, NO WORDS, NO LETTERS in the image. Pure visual only.`,
      size: '1792x1024',
      quality: 'standard',
      n: 1,
    })

    const heroImageUrl = imageResponse.data?.[0]?.url || ''

    // 3. Gerar HTML completo
    console.log('📄 Gerando HTML completo...')
    const htmlResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um desenvolvedor front-end especialista em criar landing pages responsivas e de alta conversão.
Crie HTML válido, semântico, com CSS inline otimizado para performance.
Inclua meta tags para SEO e Open Graph.
Use a logo fornecida no footer com o texto "powered by CATBytes AI".`
        },
        {
          role: 'user',
          content: `Crie uma landing page HTML completa com:

CONTEÚDO:
- Headline: ${content.headline}
- Subheadline: ${content.subheadline}
- Benefícios: ${content.benefits.join(', ')}
- Prova social: ${content.social_proof}
- Urgência: ${content.urgency}
- CTA: ${cta_text}
- Imagem hero: ${heroImageUrl}

DESIGN:
- Cores: ${theme.primary} (primária), ${theme.secondary} (secundária), ${theme.accent} (accent)
- Responsivo (mobile-first)
- Formulário de captura: nome, email, telefone (opcional), mensagem
- Footer: logo da desenvolvedora (https://catbytes.site/images/logo-desenvolvedora.webp) pequena + "powered by CATBytes AI"

SEGURANÇA & PRIVACIDADE:
- reCAPTCHA v3 (site key: 6LfDummy_SiteKey_ForPlaceholder)
- Badge "🔒 Seus dados estão protegidos" visível
- Honeypot field (campo invisível "website")
- Formulário envia POST para /api/landing-pages/submit
- Incluir campos hidden para tracking: utm_source, utm_medium, utm_campaign, referrer, landingPageSlug, landingPageUrl (capturado via JavaScript: window.location.href)

SEO:
- Meta tags otimizadas (title, description, keywords)
- Open Graph completo (og:title, og:description, og:image)
- Twitter Cards
- Schema.org JSON-LD (LocalBusiness ou Service)

IMPORTANTE:
- Logo deve ter background apropriado (não muito claro nem muito escuro)
- Badge de segurança destacado perto do formulário
- Texto: "Seus dados estão protegidos por reCAPTCHA e criptografia SSL"
- Google Analytics opcional (placeholder)
- CSS inline para performance
- Sem dependências externas (exceto reCAPTCHA)

Retorne APENAS o HTML completo, válido, pronto para deploy.`
        }
      ],
      temperature: 0.7,
    })

    const htmlContent = htmlResponse.choices[0].message.content || ''

    // 4. Gerar slug único
    const slug = `${niche}-${Date.now()}`
    const title = content.headline.substring(0, 100)

    // 5. Salvar no banco
    const supabase = createClient()
    const { data: landingPage, error: dbError } = await supabase
      .from('landing_pages')
      .insert({
        title,
        slug,
        niche,
        problem,
        solution,
        cta_text,
        theme_color,
        headline: content.headline,
        subheadline: content.subheadline,
        benefits: content.benefits,
        hero_image_url: heroImageUrl,
        html_content: htmlContent,
        status: 'draft',
        deploy_status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Erro ao salvar no banco:', dbError)
      return NextResponse.json(
        { error: 'Erro ao salvar landing page', details: dbError.message },
        { status: 500 }
      )
    }

    console.log('✅ Landing page gerada com sucesso!')

    return NextResponse.json({
      success: true,
      landingPage: {
        id: landingPage.id,
        slug: landingPage.slug,
        title: landingPage.title,
        headline: content.headline,
        subheadline: content.subheadline,
        heroImageUrl,
        previewUrl: `/lp/${slug}`, // Preview local
      },
      cost: {
        gpt4: 0.03, // ~$0.03 por página
        dalle3: 0.04, // $0.04 por imagem
        total: 0.07,
      }
    })

  } catch (error: any) {
    console.error('❌ Erro ao gerar landing page:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar landing page', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
