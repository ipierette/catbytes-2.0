/**
 * Image Text Overlay - Sistema para adicionar texto sobre imagens
 * Solução para o problema da DALL-E com textos em português
 */

import { createCanvas, loadImage } from 'canvas'

export interface TextOverlayConfig {
  text: string
  imageUrl: string
  fontSize?: number
  fontFamily?: string
  textColor?: string
  strokeColor?: string
  strokeWidth?: number
  position?: 'center' | 'top' | 'bottom'
  backgroundColor?: string
  padding?: number
  maxWidth?: number
}

/**
 * Adiciona texto sobre uma imagem usando Canvas
 * Retorna a URL da nova imagem como base64
 */
export async function addTextOverlay(config: TextOverlayConfig): Promise<string> {
  const {
    text,
    imageUrl,
    fontSize = 60,
    fontFamily = 'Arial, sans-serif',
    textColor = '#FFFFFF',
    strokeColor = '#000000',
    strokeWidth = 3,
    position = 'center',
    backgroundColor = 'rgba(0,0,0,0.5)',
    padding = 20,
    maxWidth = 600
  } = config

  try {
    // Carrega a imagem original
    const image = await loadImage(imageUrl)
    
    // Cria canvas com o mesmo tamanho da imagem
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')
    
    // Desenha a imagem original
    ctx.drawImage(image, 0, 0)
    
    // Configura fonte e estilo do texto
    ctx.font = `bold ${fontSize}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Quebra o texto em múltiplas linhas se necessário
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const testWidth = ctx.measureText(testLine).width
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    // Calcula posição do texto
    const lineHeight = fontSize * 1.2
    const totalTextHeight = lines.length * lineHeight
    
    let startY: number
    switch (position) {
      case 'top':
        startY = totalTextHeight / 2 + padding
        break
      case 'bottom':
        startY = image.height - totalTextHeight / 2 - padding
        break
      default: // center
        startY = image.height / 2
    }
    
    // Desenha fundo semi-transparente atrás do texto
    if (backgroundColor && backgroundColor !== 'transparent') {
      const bgHeight = totalTextHeight + padding * 2
      const bgY = startY - totalTextHeight / 2 - padding
      
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, bgY, image.width, bgHeight)
    }
    
    // Desenha cada linha de texto
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]
      const y = startY - (totalTextHeight / 2) + (index * lineHeight) + (lineHeight / 2)
      
      // Desenha contorno (stroke)
      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth
        ctx.strokeText(line, image.width / 2, y)
      }
      
      // Desenha texto principal
      ctx.fillStyle = textColor
      ctx.fillText(line, image.width / 2, y)
    }
    
    // Retorna como data URL
    return canvas.toDataURL('image/jpeg', 0.9)
    
  } catch (error) {
    console.error('Error adding text overlay:', error)
    throw new Error('Failed to add text overlay to image')
  }
}

/**
 * Configurações pré-definidas para diferentes temas
 */
export const THEME_TEXT_CONFIGS = {
  // Blog themes
  'Automação e Negócios': {
    fontSize: 55,
    textColor: '#FFFFFF',
    strokeColor: '#1a1a1a',
    strokeWidth: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.8)', // Blue overlay
    position: 'center' as const,
    maxWidth: 700
  },
  'Programação e IA': {
    fontSize: 50,
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 3,
    backgroundColor: 'rgba(147, 51, 234, 0.8)', // Purple overlay
    position: 'center' as const,
    maxWidth: 650
  },
  'Cuidados Felinos': {
    fontSize: 48,
    textColor: '#FFFFFF',
    strokeColor: '#8B5CF6',
    strokeWidth: 3,
    backgroundColor: 'rgba(236, 72, 153, 0.7)', // Pink overlay
    position: 'center' as const,
    maxWidth: 600
  },
  
  // Instagram niches
  'advogados': {
    fontSize: 58,
    textColor: '#FFFFFF',
    strokeColor: '#1e3a8a', // Dark blue
    strokeWidth: 5,
    backgroundColor: 'rgba(30, 58, 138, 0.85)', // Professional blue
    position: 'center' as const,
    maxWidth: 750,
    fontFamily: 'Arial Black, Arial'
  },
  'medicos': {
    fontSize: 56,
    textColor: '#FFFFFF', 
    strokeColor: '#166534', // Dark green
    strokeWidth: 5,
    backgroundColor: 'rgba(22, 101, 52, 0.85)', // Medical green
    position: 'center' as const,
    maxWidth: 720,
    fontFamily: 'Arial Black, Arial'
  },
  'terapeutas': {
    fontSize: 54,
    textColor: '#FFFFFF',
    strokeColor: '#7c2d12', // Warm brown
    strokeWidth: 4,
    backgroundColor: 'rgba(124, 45, 18, 0.80)', // Therapeutic warm tone
    position: 'center' as const,
    maxWidth: 680,
    fontFamily: 'Arial Black, Arial'
  },
  'nutricionistas': {
    fontSize: 52,
    textColor: '#FFFFFF',
    strokeColor: '#9a3412', // Orange-red
    strokeWidth: 4,
    backgroundColor: 'rgba(154, 52, 18, 0.80)', // Nutrition orange
    position: 'center' as const,
    maxWidth: 700,
    fontFamily: 'Arial Black, Arial'
  }
}

/**
 * Aplica overlay de texto baseado no tema
 */
export async function applyThemeTextOverlay(
  imageUrl: string, 
  text: string, 
  theme: keyof typeof THEME_TEXT_CONFIGS
): Promise<string> {
  const config = THEME_TEXT_CONFIGS[theme]
  
  return addTextOverlay({
    text,
    imageUrl,
    ...config
  })
}