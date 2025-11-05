import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

/**
 * POST /api/blog/suggest-image-text
 * Gera sugestão de texto para imagem baseado no artigo
 */
export async function POST(request: NextRequest) {
  try {
    const { title, theme, content } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const prompt = `Você é um especialista em marketing digital e design gráfico.

TAREFA: Crie um texto curto e impactante para sobrepor em uma imagem de capa de artigo de blog.

CONTEXTO:
- Título do artigo: "${title}"
- Categoria: ${theme}
- Conteúdo (resumo): ${content ? content.substring(0, 300) : 'Não fornecido'}

REQUISITOS:
- Máximo 6 palavras
- Texto em MAIÚSCULAS para impacto visual
- Deve capturar a essência do artigo
- Evite artigos (o, a, os, as) sempre que possível
- Foque em números, benefícios ou ação
- Use + ou % quando relevante

EXEMPLOS BONS:
- "AUTOMATIZE 80% TAREFAS"
- "+300% PRODUTIVIDADE"
- "CÓDIGO LIMPO GARANTIDO"
- "GATOS FELIZES SEMPRE"

Responda APENAS com o texto sugerido, sem explicações ou aspas.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em copywriting para redes sociais e design gráfico. Sempre responda de forma concisa e impactante.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 50
    })

    const suggestion = completion.choices[0]?.message?.content?.trim()

    if (!suggestion) {
      throw new Error('No suggestion generated')
    }

    return NextResponse.json({
      success: true,
      suggestion: suggestion.toUpperCase() // Garante maiúsculas
    })

  } catch (error) {
    console.error('Error generating image text suggestion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate suggestion'
      },
      { status: 500 }
    )
  }
}