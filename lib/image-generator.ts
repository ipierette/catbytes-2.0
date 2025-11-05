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

IMPORTANT: Include text overlay in the image with these exact words: "${overlayText}"
The text should be:
- Centered in the image
- Large, bold, and easily readable
- White text with black outline or shadow for contrast
- Professional typography
- Positioned in the middle third of the image

The text MUST be clearly visible and readable.`
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

