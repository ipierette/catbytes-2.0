/**
 * DALL-E 3 Post Generator
 * Gera posts completos do Instagram com texto integrado usando DALL-E 3
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

interface PostGenerationRequest {
  nicho: string
  tema: string
  palavrasChave: string[]
  estilo?: 'moderno' | 'minimalista' | 'vibrante' | 'elegante' | 'corporativo'
  coresPrincipais?: string[]
  incluirLogo?: boolean
}

interface GeneratedPost {
  imageUrl: string
  titulo: string
  textoImagem: string
  caption: string
  prompt: string
  revisedPrompt?: string
}

/**
 * Gera um post completo do Instagram usando DALL-E 3
 */
export async function generateInstagramPostWithDALLE(
  request: PostGenerationRequest
): Promise<GeneratedPost> {
  
  console.log('🟣 [DALLE-LIB] === INICIANDO GERAÇÃO ===')
  console.log('🟣 [DALLE-LIB] Request:', request)
  
  // 1. Primeiro, usar GPT-4 para criar conteúdo otimizado
  console.log('🟣 [DALLE-LIB] Gerando conteúdo com GPT-4...')
  const contentPrompt = `
Crie conteúdo para um post do Instagram sobre:

NICHO: ${request.nicho}
TEMA: ${request.tema}
PALAVRAS-CHAVE: ${request.palavrasChave.join(', ')}

Gere um JSON com:
{
  "titulo": "Título impactante (máx 50 caracteres)",
  "textoImagem": "Texto principal para aparecer na imagem (máx 100 caracteres, pode ter quebra de linha)",
  "caption": "Legenda completa do post (200-300 caracteres, com emojis e call-to-action)",
  "pontosVisuais": ["3-4 elementos visuais/ícones que devem aparecer"],
  "cta": "Call to action final"
}

IMPORTANTE: O texto deve ser direto, impactante e otimizado para mobile.
`

  console.log('🟣 [DALLE-LIB] Chamando GPT-4...')
  const contentResponse = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: contentPrompt }],
    response_format: { type: 'json_object' }
  })

  const content = JSON.parse(contentResponse.choices[0].message.content!)
  console.log('🟣 [DALLE-LIB] ✓ Conteúdo gerado:', content)

  // 2. Criar prompt visual detalhado para DALL-E 3
  const visualPrompt = buildDALLEPrompt(request, content)

  console.log('🟣 [DALLE-LIB] Prompt visual:', visualPrompt.substring(0, 200) + '...')

  // 3. Gerar imagem com DALL-E 3
  try {
    console.log('🟣 [DALLE-LIB] Chamando DALL-E 3...')
    console.log('🟣 [DALLE-LIB] Modelo: dall-e-3, Size: 1024x1024, Quality: HD')
    
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: visualPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: request.estilo === 'elegante' ? 'natural' : 'vivid'
    })

    console.log('🟣 [DALLE-LIB] Response recebido:', {
      dataLength: imageResponse.data?.length,
      hasUrl: !!imageResponse.data?.[0]?.url
    })

    if (!imageResponse.data || imageResponse.data.length === 0) {
      console.error('🟣 [DALLE-LIB] ❌ DALL-E não retornou nenhuma imagem')
      throw new Error('DALL-E não retornou nenhuma imagem')
    }

    const imageUrl = imageResponse.data[0]?.url
    const revisedPrompt = imageResponse.data[0]?.revised_prompt

    if (!imageUrl) {
      console.error('🟣 [DALLE-LIB] ❌ URL da imagem não disponível')
      throw new Error('URL da imagem não está disponível')
    }

    console.log('🟣 [DALLE-LIB] ✅ Imagem gerada com sucesso!')
    console.log('🟣 [DALLE-LIB] Image URL:', imageUrl.substring(0, 80) + '...')
    console.log('🟣 [DALLE-LIB] Revised prompt:', revisedPrompt?.substring(0, 150) + '...')

    return {
      imageUrl,
      titulo: content.titulo,
      textoImagem: content.textoImagem,
      caption: content.caption,
      prompt: visualPrompt,
      revisedPrompt
    }
  } catch (error) {
    console.error('🟣 [DALLE-LIB] ❌ ERRO CRÍTICO:', error)
    if (error instanceof Error) {
      console.error('🟣 [DALLE-LIB] Error message:', error.message)
      console.error('🟣 [DALLE-LIB] Error stack:', error.stack)
    }
    throw new Error(`Falha ao gerar imagem: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Constrói um prompt otimizado para DALL-E 3
 */
function buildDALLEPrompt(
  request: PostGenerationRequest,
  content: any
): string {
  const estilos = {
    moderno: 'design moderno e tech, com gradientes suaves, tipografia sans-serif bold',
    minimalista: 'design minimalista e clean, muito espaço em branco, tipografia simples',
    vibrante: 'cores vibrantes e saturadas, composição dinâmica, elementos gráficos ousados',
    elegante: 'design elegante e sofisticado, paleta de cores harmoniosa, tipografia serifada',
    corporativo: 'design profissional e corporativo, cores sóbrias, layout equilibrado'
  }

  const cores = request.coresPrincipais?.length 
    ? request.coresPrincipais.join(', ')
    : 'cores complementares e harmoniosas'

  const prompt = `
Create a professional Instagram post image (1080x1080px square format) with the following specifications:

MAIN CONTENT:
- Primary text (large, prominent): "${content.textoImagem}"
- Title at top: "${content.titulo}"
- Call-to-action at bottom: "${content.cta}"

VISUAL ELEMENTS:
${content.pontosVisuais.map((ponto: string, i: number) => `- Element ${i + 1}: ${ponto}`).join('\n')}

STYLE & DESIGN:
- Theme: ${request.tema}
- Visual style: ${estilos[request.estilo || 'moderno']}
- Color scheme: ${cores}
- Typography: Bold, sans-serif fonts for headlines; clean, readable fonts for body text
- Layout: Balanced composition, mobile-optimized for Instagram feed
${request.incluirLogo ? '- Logo: Small "CatBytes" branding in corner (subtle, not intrusive)' : ''}

TECHNICAL REQUIREMENTS:
- All text must be perfectly readable and part of the image design
- Text should have subtle shadows or outlines for legibility against backgrounds
- Composition should work well when viewed on mobile devices
- Professional, polished look suitable for social media marketing
- No photorealistic people or copyrighted elements

IMPORTANT: All text specified above MUST appear exactly as written in the image, integrated naturally into the design.
`.trim()

  return prompt
}

/**
 * Baixa a imagem gerada e salva no Supabase Storage
 */
export async function downloadAndSaveDALLEImage(
  imageUrl: string,
  postId: string
): Promise<string> {
  try {
    // 1. Baixar imagem da URL temporária do OpenAI
    const response = await fetch(imageUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('[DALL-E Generator] Imagem baixada, tamanho:', buffer.length, 'bytes')

    // 2. Upload para Supabase Storage
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const filename = `dalle-${postId}-${Date.now()}.png`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('instagram-images')
      .upload(filename, buffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload falhou: ${uploadError.message}`)
    }

    // 3. Obter URL pública
    const { data: urlData } = supabase.storage
      .from('instagram-images')
      .getPublicUrl(uploadData.path)

    console.log('[DALL-E Generator] Imagem salva no Supabase:', urlData.publicUrl)

    return urlData.publicUrl
  } catch (error) {
    console.error('[DALL-E Generator] Erro ao salvar imagem:', error)
    throw error
  }
}

/**
 * Gera múltiplos posts em lote com DALL-E 3
 */
export async function generateBatchPostsWithDALLE(
  requests: PostGenerationRequest[],
  delayBetweenRequests: number = 5000 // 5 segundos entre cada geração
): Promise<GeneratedPost[]> {
  const results: GeneratedPost[] = []

  for (const request of requests) {
    try {
      console.log(`[DALL-E Batch] Gerando post: ${request.tema}`)
      
      const post = await generateInstagramPostWithDALLE(request)
      results.push(post)

      // Aguardar antes da próxima geração para evitar rate limits
      if (requests.indexOf(request) < requests.length - 1) {
        console.log(`[DALL-E Batch] Aguardando ${delayBetweenRequests}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests))
      }
    } catch (error) {
      console.error(`[DALL-E Batch] Erro ao gerar post "${request.tema}":`, error)
      // Continuar mesmo com erro
    }
  }

  return results
}

/**
 * Templates de prompts para diferentes nichos
 */
export const NICHE_TEMPLATES = {
  tech: {
    estilo: 'moderno' as const,
    coresPrincipais: ['#0066FF', '#00D4FF', '#1A1A1A'],
    palavrasChave: ['tecnologia', 'inovação', 'digital', 'futuro']
  },
  business: {
    estilo: 'corporativo' as const,
    coresPrincipais: ['#003366', '#0066CC', '#F5F5F5'],
    palavrasChave: ['negócios', 'empreendedorismo', 'sucesso', 'estratégia']
  },
  lifestyle: {
    estilo: 'elegante' as const,
    coresPrincipais: ['#FFB6C1', '#FFF0F5', '#4A4A4A'],
    palavrasChave: ['lifestyle', 'bem-estar', 'qualidade', 'inspiração']
  },
  education: {
    estilo: 'vibrante' as const,
    coresPrincipais: ['#FF6B35', '#004E89', '#FFD23F'],
    palavrasChave: ['educação', 'aprendizado', 'conhecimento', 'crescimento']
  },
  fitness: {
    estilo: 'vibrante' as const,
    coresPrincipais: ['#FF4500', '#000000', '#FFFFFF'],
    palavrasChave: ['fitness', 'saúde', 'força', 'transformação']
  }
}
