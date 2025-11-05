/**
 * Image Generator - Gera imagens com DALL-E
 */

import OpenAI from 'openai'

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
 * Adiciona texto overlay à imagem (alternativa: usar API externa ou Canvas)
 * Esta versão retorna o prompt otimizado para DALL-E incluir o texto
 */
export function optimizePromptWithText(basePrompt: string, overlayText: string): string {
  return `${basePrompt}

CRITICAL TEXT OVERLAY REQUIREMENTS:
- Display this EXACT text: "${overlayText}"
- Text must be LARGE, BOLD, and HIGHLY READABLE
- Use modern sans-serif font (like Arial or Roboto)
- Position text in CENTER of image
- Text color: Pure WHITE (#FFFFFF)
- Add thick BLACK border/outline around each letter for maximum contrast
- Text should occupy 20-25% of image height
- Background behind text should have subtle dark gradient overlay for better readability
- Ensure high contrast ratio for accessibility
- Text must be the DOMINANT visual element

Style: Clean, professional, modern business aesthetic. High contrast. Professional photography quality.`
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

