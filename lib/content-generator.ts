/**
 * Content Generator - Sistema de geração de conteúdo estratégico
 * Gera títulos, captions e textos otimizados para conversão
 */

import OpenAI from 'openai'
import { NICHES, IMAGE_OVERLAY_TEXTS, type Niche, type PostContent } from './instagram-automation'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

/**
 * Gera conteúdo completo para uma postagem
 */
export async function generatePostContent(nicho: Niche): Promise<PostContent> {
  const nicheConfig = NICHES[nicho]
  
  // Seleciona texto aleatório para a imagem (máximo 6 palavras)
  const textoImagem = IMAGE_OVERLAY_TEXTS[nicho][
    Math.floor(Math.random() * IMAGE_OVERLAY_TEXTS[nicho].length)
  ]

  // Gera título e caption com OpenAI
  const prompt = `Você é um especialista em copywriting para Instagram focado em conversão e vendas de automações com IA.

PÚBLICO-ALVO: ${nicheConfig.nome}

DORES COMUNS:
${nicheConfig.dores.map(d => `- ${d}`).join('\n')}

BENEFÍCIOS DA AUTOMAÇÃO:
${nicheConfig.beneficios.map(b => `- ${b}`).join('\n')}

TEXTO DA IMAGEM (já definido): "${textoImagem}"

GERE:

1. TÍTULO (uma linha, máx 60 caracteres, chamativo e direto):
Exemplo: "IA que faz seu consultório trabalhar sozinho"

2. CAPTION (200-300 palavras):
- Início com gancho emocional ou pergunta provocativa
- Apresente uma dor específica do público
- Mostre como a automação resolve (com dados específicos quando possível)
- CTA clara direcionando para https://catbytes.site
- Tom: profissional, mas conversacional
- Use quebras de linha para facilitar leitura
- NÃO use emojis excessivos (máx 2-3 estratégicos)

Responda APENAS em formato JSON:
{
  "titulo": "seu título aqui",
  "caption": "sua caption aqui"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em marketing digital e copywriting para Instagram, focado em conversão de profissionais liberais para serviços de automação com IA.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    })

    const response = JSON.parse(completion.choices[0].message.content || '{}')

    // Adiciona hashtags ao final da caption
    const hashtags = nicheConfig.hashtags.slice(0, 8).join(' ')
    const captionComHashtags = `${response.caption}\n\n—\n\n${hashtags}`

    // Monta o prompt para geração da imagem
    const imagePrompt = `${nicheConfig.contextoImagem}. Professional high-quality photograph, natural lighting, candid moment. Text overlay in center: "${textoImagem}". Modern, clean composition. Realistic and authentic workplace scene.`

    return {
      nicho,
      titulo: response.titulo,
      textoImagem,
      caption: captionComHashtags,
      hashtags: nicheConfig.hashtags,
      imagePrompt
    }
  } catch (error) {
    console.error('Error generating content:', error)
    throw new Error(`Failed to generate content for ${nicho}`)
  }
}

/**
 * Gera variações de conteúdo para testes A/B (futuro)
 */
export async function generateContentVariations(nicho: Niche, count = 3): Promise<PostContent[]> {
  const variations: PostContent[] = []
  
  for (let i = 0; i < count; i++) {
    const content = await generatePostContent(nicho)
    variations.push(content)
  }
  
  return variations
}

/**
 * Valida se o conteúdo gerado está dentro dos padrões
 */
export function validatePostContent(content: PostContent): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Valida título
  if (!content.titulo || content.titulo.length > 100) {
    errors.push('Título deve ter entre 1 e 100 caracteres')
  }

  // Valida texto da imagem (máximo 6 palavras)
  const palavras = content.textoImagem.split(' ').length
  if (palavras > 6) {
    errors.push(`Texto da imagem deve ter no máximo 6 palavras (tem ${palavras})`)
  }

  // Valida caption
  if (!content.caption || content.caption.length < 100) {
    errors.push('Caption deve ter pelo menos 100 caracteres')
  }

  if (content.caption.length > 2200) {
    errors.push('Caption excede limite do Instagram (2200 caracteres)')
  }

  // Valida CTA
  if (!content.caption.includes('catbytes.site')) {
    errors.push('Caption deve incluir CTA para catbytes.site')
  }

  // Valida hashtags
  if (!content.hashtags || content.hashtags.length === 0) {
    errors.push('Deve incluir hashtags')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
