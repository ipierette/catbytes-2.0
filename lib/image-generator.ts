/**
 * Image Generator - Gera imagens com DALL-E e adiciona texto via Canvas
 */

import OpenAI from 'openai'
import { addTextOverlay, THEME_TEXT_CONFIGS } from './image-text-overlay'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

/**
 * Gera imagem com DALL-E
 * Retorna URL temporária (válida por ~2h, suficiente para Instagram baixar)
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log('Generating image with DALL-E...', { prompt })

    // Gera imagem com DALL-E
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural' // Estilo mais realista
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E')
    }

    console.log('Image generated successfully', { imageUrl })
    return imageUrl
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

/**
 * Gera prompt otimizado SEM texto para DALL-E
 * O texto será adicionado posteriormente via Canvas
 */
export function optimizePromptWithoutText(basePrompt: string): string {
  return `${basePrompt}

IMPORTANT: DO NOT include any text, words, letters or typography in the image.
Generate a clean, text-free image that will serve as a background.
Focus on visual elements, composition, and atmosphere only.
Leave space for text overlay to be added later.
High quality, professional photography or illustration style.
Clean composition with balanced visual weight.`
}

/**
 * Função legada - mantida para compatibilidade
 * @deprecated Use generateImageWithTextOverlay instead
 */
export function optimizePromptWithText(basePrompt: string, overlayText: string): string {
  return optimizePromptWithoutText(basePrompt)
}

/**
 * Gera imagem de fundo limpa + adiciona texto via Canvas
 * Nova abordagem para textos em português sem erros
 */
export async function generateImageWithTextOverlay(
  backgroundPrompt: string,
  overlayText: string,
  theme?: keyof typeof THEME_TEXT_CONFIGS
): Promise<string> {
  try {
    console.log('Generating image with text overlay system...')
    
    // 1. Gera imagem de fundo limpa (sem texto)
    const cleanPrompt = optimizePromptWithoutText(backgroundPrompt)
    const backgroundImageUrl = await generateImage(cleanPrompt)
    
    console.log('Background image generated, adding text overlay...')
    
    // 2. Adiciona texto usando Canvas
    let finalImageDataUrl: string
    
    if (theme && THEME_TEXT_CONFIGS[theme]) {
      // Usa configuração do tema
      const config = THEME_TEXT_CONFIGS[theme]
      finalImageDataUrl = await addTextOverlay({
        text: overlayText,
        imageUrl: backgroundImageUrl,
        ...config
      })
    } else {
      // Usa configuração padrão
      finalImageDataUrl = await addTextOverlay({
        text: overlayText,
        imageUrl: backgroundImageUrl,
        fontSize: 55,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        position: 'center',
        maxWidth: 700
      })
    }
    
    console.log('Text overlay added successfully')
    return finalImageDataUrl
    
  } catch (error) {
    console.error('Error generating image with text overlay:', error)
    // Fallback para método antigo em caso de erro
    console.log('Falling back to legacy text generation...')
    return generateImage(optimizePromptWithText(backgroundPrompt, overlayText))
  }
}

/**
 * Valida se a imagem foi gerada com sucesso
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

