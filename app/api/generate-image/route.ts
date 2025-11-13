import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * API para gerar imagens com DALL-E 3
 * POST /api/generate-image
 * 
 * Body: {
 *   prompt: string
 *   size?: '1024x1024' | '1792x1024' | '1024x1792'
 * }
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('[Generate Image] OPENAI_API_KEY não configurada')
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null

export async function POST(request: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'Serviço de IA não disponível. Verifique OPENAI_API_KEY.' },
        { status: 500 }
      )
    }

    const { prompt, size = '1024x1024' } = await request.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[Generate Image] 🎨 Gerando imagem com DALL-E 3...')
    console.log('[Generate Image] Prompt:', prompt)
    console.log('[Generate Image] Size:', size)

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt.trim(),
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      quality: 'standard',
      style: 'natural'
    })

    // Verificar se a resposta contém dados
    const imageData = response.data
    if (!imageData || imageData.length === 0) {
      console.error('[Generate Image] DALL-E não retornou dados')
      return NextResponse.json(
        { error: 'Não foi possível gerar a imagem' },
        { status: 500 }
      )
    }

    const imageUrl = imageData[0]?.url

    if (!imageUrl) {
      console.error('[Generate Image] DALL-E não retornou URL da imagem')
      return NextResponse.json(
        { error: 'Não foi possível gerar a imagem' },
        { status: 500 }
      )
    }

    console.log('[Generate Image] ✅ Imagem gerada com sucesso')

    return NextResponse.json({
      success: true,
      url: imageUrl,
      prompt,
      size
    })

  } catch (error) {
    console.error('[Generate Image] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar imagem',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
