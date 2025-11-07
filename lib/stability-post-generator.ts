/**
 * Gerador de posts usando Stability AI (Stable Diffusion)
 * Alternativa mais barata ao DALL-E 3
 * API: https://platform.stability.ai/
 * Preço: ~$0.002 por imagem (40x mais barato que DALL-E 3)
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface StabilityGenerationRequest {
  nicho: string
  tema: string
  palavrasChave?: string[]
  estilo?: string
  coresPrincipais?: string[]
}

/**
 * Gera post usando Stability AI
 * Mais barato e igualmente eficaz para posts do Instagram
 */
export async function generatePostWithStability(request: StabilityGenerationRequest) {
  console.log('🔷 [STABILITY-LIB] === INICIANDO GERAÇÃO ===')
  console.log('🔷 [STABILITY-LIB] Request:', request)
  
  const stabilityKey = process.env.STABILITY_API_KEY

  if (!stabilityKey) {
    console.error('🔷 [STABILITY-LIB] ❌ STABILITY_API_KEY não configurada')
    throw new Error('STABILITY_API_KEY não configurada. Adicione ao .env.local')
  }
  
  console.log('🔷 [STABILITY-LIB] ✓ API Key configurada:', stabilityKey.substring(0, 10) + '...')

  // 1. Gerar conteúdo com GPT-4 (mesmo sistema do DALL-E)
  console.log('🔷 [STABILITY-LIB] Gerando conteúdo com GPT-4...')
  const contentPrompt = `
Crie conteúdo para um post do Instagram sobre "${request.tema}" no nicho "${request.nicho}".

Formato JSON:
{
  "titulo": "Título chamativo (3-5 palavras, máximo 40 caracteres)",
  "textoImagem": "Texto principal para a imagem (curto, impactante, máximo 60 caracteres)",
  "caption": "Caption completa com hashtags (150-200 caracteres, inclua 5-8 hashtags relevantes)"
}

Palavras-chave: ${request.palavrasChave?.join(', ') || 'tecnologia, inovação'}
Estilo: ${request.estilo || 'moderno'}
`

  console.log('🔷 [STABILITY-LIB] Chamando GPT-4...')
  const contentResponse = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'Você é um especialista em marketing de conteúdo para Instagram. Crie posts engajadores e profissionais.'
      },
      {
        role: 'user',
        content: contentPrompt
      }
    ],
    response_format: { type: 'json_object' }
  })

  const content = JSON.parse(contentResponse.choices[0].message.content || '{}')
  console.log('🔷 [STABILITY-LIB] ✓ Conteúdo gerado:', content)

  // 2. Gerar imagem com Stability AI
  console.log('🔷 [STABILITY-LIB] Construindo prompt para Stability AI...')
  const imagePrompt = buildStabilityPrompt(request, content)
  console.log('🔷 [STABILITY-LIB] Prompt:', imagePrompt.substring(0, 150) + '...')

  console.log('🔷 [STABILITY-LIB] Chamando Stability AI API...')
  
  // SD 3.5 usa FormData (multipart/form-data)
  const formData = new FormData()
  formData.append('prompt', imagePrompt)
  formData.append('negative_prompt', 'blurry, bad quality, distorted, ugly, watermark, text errors, misspelled words, garbled text, unreadable text')
  formData.append('mode', 'text-to-image')
  formData.append('model', 'sd3.5-large')
  formData.append('aspect_ratio', '1:1')
  formData.append('output_format', 'png')
  formData.append('seed', '0')

  const stabilityResponse = await fetch(
    'https://api.stability.ai/v2beta/stable-image/generate/sd3',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stabilityKey}`,
        Accept: 'application/json'
      },
      body: formData
    }
  )

  console.log('🔷 [STABILITY-LIB] Response status:', stabilityResponse.status)
  
  if (!stabilityResponse.ok) {
    const errorText = await stabilityResponse.text()
    console.error('🔷 [STABILITY-LIB] ❌ Erro da API:', errorText)
    throw new Error(`Stability AI error: ${errorText || stabilityResponse.statusText}`)
  }

  const stabilityData = await stabilityResponse.json()
  console.log('🔷 [STABILITY-LIB] ✓ Resposta recebida')
  
  if (!stabilityData.image) {
    console.error('🔷 [STABILITY-LIB] ❌ Nenhuma imagem foi gerada')
    throw new Error('Stability AI não retornou nenhuma imagem')
  }
  
  // SD 3.5 retorna base64 diretamente no campo 'image'
  const imageBase64 = stabilityData.image
  const imageUrl = `data:image/png;base64,${imageBase64}`
  
  console.log('🔷 [STABILITY-LIB] ✓ Imagem gerada:', {
    base64Length: imageBase64?.length || 0,
    hasImageUrl: !!imageUrl
  })

  console.log('🔷 [STABILITY-LIB] ✅ GERAÇÃO COMPLETA!')
  
  return {
    imageUrl,
    imageBase64,
    titulo: content.titulo,
    textoImagem: content.textoImagem,
    caption: content.caption,
    prompt: imagePrompt,
    generator: 'stability-ai'
  }
}

function buildStabilityPrompt(
  request: StabilityGenerationRequest,
  content: any
): string {
  const cores = request.coresPrincipais?.join(', ') || 'vibrant colors'
  const estilo = request.estilo || 'modern'

  // SD 3.5 é EXCELENTE com texto! Prompt mais específico
  return `Instagram post graphic design, ${estilo} style, clear readable text that says exactly "${content.textoImagem}", 
    ${cores} color palette, clean modern layout, professional typography, 
    ${request.tema} theme, social media format, square 1:1 ratio,
    minimalist design, sharp focus, high quality, perfect text rendering, no text errors`
}

function getStylePreset(estilo?: string): string {
  const presets: Record<string, string> = {
    'moderno': 'digital-art',
    'minimalista': 'low-poly',
    'vibrante': 'neon-punk',
    'elegante': 'cinematic',
    'corporativo': 'photographic'
  }

  return presets[estilo || 'moderno'] || 'digital-art'
}

/**
 * Salva imagem base64 no Supabase
 */
export async function saveStabilityImage(
  imageBase64: string,
  postId: string
): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Converter base64 para blob
  const byteCharacters = atob(imageBase64)
  const byteNumbers = new Array(byteCharacters.length)
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'image/png' })

  // Upload para Supabase
  const fileName = `instagram-posts/${postId}-${Date.now()}.png`
  
  const { data, error } = await supabase.storage
    .from('instagram-images')
    .upload(fileName, blob, {
      contentType: 'image/png',
      upsert: false
    })

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from('instagram-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
