/**
 * Instagram Suggest Text API
 * Gera sugestões de texto para overlay na imagem usando IA
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * POST /api/instagram/suggest-text
 * Gera sugestões de textos curtos e impactantes para colocar na imagem
 */
export async function POST(request: NextRequest) {
  try {
    const { nicho, caption, titulo } = await request.json()

    if (!nicho) {
      return NextResponse.json(
        { error: 'Nicho is required' },
        { status: 400 }
      )
    }

    console.log('[Suggest Text] Generating suggestions for:', nicho)

    const nichoDescriptions: Record<string, string> = {
      advogados: 'escritório de advocacia, serviços jurídicos, consultoria legal',
      medicos: 'clínica médica, consultório médico, serviços de saúde',
      terapeutas: 'terapia, saúde mental, bem-estar emocional',
      nutricionistas: 'nutrição, alimentação saudável, dieta personalizada'
    }

    const prompt = `Você é um especialista em marketing digital para Instagram.

Contexto:
- Nicho: ${nicho} (${nichoDescriptions[nicho as keyof typeof nichoDescriptions] || nicho})
- Título: ${titulo || 'Não fornecido'}
- Caption: ${caption?.substring(0, 200) || 'Não fornecida'}

Crie 3 TEXTOS CURTOS E IMPACTANTES para colocar DENTRO DA IMAGEM do post.

REGRAS IMPORTANTES:
1. Cada texto deve ter NO MÁXIMO 6 palavras
2. Use linguagem persuasiva e emocional
3. Foque em RESULTADOS e TRANSFORMAÇÃO
4. Use verbos de ação no imperativo
5. Primeiro texto: CTA principal (mais forte)
6. Segundo texto: Benefício ou problema
7. Terceiro texto: Urgência ou prova social

EXEMPLOS DE BONS TEXTOS:
- "Automatize Agora Seu Consultório"
- "Mais Tempo Para Pacientes"
- "Ganhe 3 Horas Por Dia"
- "Atendimento 24/7 Sem Esforço"
- "Pare De Perder Clientes"

Retorne APENAS um array JSON com os 3 textos, sem explicações:
["texto 1", "texto 2", "texto 3"]`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 200
    })

    const content = response.choices[0].message.content?.trim()
    
    if (!content) {
      throw new Error('No content generated')
    }

    // Parse JSON response
    let suggestions: string[]
    try {
      suggestions = JSON.parse(content)
    } catch (parseError) {
      // Se não for JSON válido, tenta extrair textos
      suggestions = content
        .split('\n')
        .filter(line => line.trim().length > 0 && line.trim().length < 60)
        .slice(0, 3)
    }

    console.log('[Suggest Text] Generated suggestions:', suggestions)

    return NextResponse.json({
      success: true,
      suggestions
    })

  } catch (error) {
    console.error('[Suggest Text] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}