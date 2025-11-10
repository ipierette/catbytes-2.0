import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { NICHES } from '../generate/route'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface SuggestRequest {
  niche: string
}

export async function POST(req: NextRequest) {
  try {
    const { niche } = await req.json()

    if (!niche) {
      return NextResponse.json(
        { error: 'Nicho é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar info do nicho
    const nicheInfo = NICHES.find(n => n.value === niche)
    if (!nicheInfo) {
      return NextResponse.json(
        { error: 'Nicho inválido' },
        { status: 400 }
      )
    }

    console.log(`🤖 Gerando sugestões para nicho: ${nicheInfo.label}`)

    // Pedir sugestões ao GPT-4
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em marketing digital e automação de negócios.
Sua missão é criar landing pages de alta conversão para capturar leads qualificados.
Retorne APENAS um JSON válido, sem markdown, sem comentários.`
        },
        {
          role: 'user',
          content: `Para o nicho "${nicheInfo.label}", sugira:

1. **Problema principal** que esse tipo de negócio enfrenta (relacionado à falta de automação)
2. **Solução através de automação** que o CatBytes oferece
3. **CTA (Call-to-Action)** irresistível e específico para este nicho
4. **Tema de cor** mais adequado (blue, green, purple, orange, red, teal, indigo)

Retorne um JSON com:
{
  "problem": "Descrição do problema (80-150 caracteres)",
  "solution": "Como a automação resolve (80-150 caracteres)",
  "cta_text": "Texto do botão persuasivo (30-50 caracteres)",
  "theme_color": "blue|green|purple|orange|red|teal|indigo",
  "explanation": "Por que essas sugestões funcionam para este nicho (50 palavras)"
}

IMPORTANTE: Foque em problemas REAIS e URGENTES desse nicho.`
        }
      ],
      temperature: 0.9,
      max_tokens: 500,
    })

    const contentText = response.choices[0].message.content || '{}'
    const suggestions = JSON.parse(contentText)

    console.log('✅ Sugestões geradas:', suggestions)

    return NextResponse.json({
      success: true,
      suggestions: {
        problem: suggestions.problem,
        solution: suggestions.solution,
        cta_text: suggestions.cta_text,
        theme_color: suggestions.theme_color,
        explanation: suggestions.explanation,
      }
    })

  } catch (error: any) {
    console.error('❌ Erro ao gerar sugestões:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar sugestões', details: error.message },
      { status: 500 }
    )
  }
}
