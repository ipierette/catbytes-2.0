import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const maxDuration = 300

/**
 * POST /api/topics/batch-generate
 * Gera múltiplos tópicos em lote com validação de similaridade
 * 
 * Body: {
 *   category: string,
 *   count: number (default 30),
 *   prompt?: string (contexto adicional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { category, count = 30, prompt } = await request.json()

    if (!category) {
      return NextResponse.json({ error: 'Categoria obrigatória' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key não configurada' }, { status: 500 })
    }

    // Buscar tópicos já existentes na categoria
    const { data: existingTopics, error: fetchError } = await supabase
      .from('topic_usage_history')
      .select('topic_text')
      .eq('category', category)

    if (fetchError) {
      console.error('Erro ao buscar tópicos existentes:', fetchError)
      return NextResponse.json({ error: 'Erro ao buscar tópicos existentes' }, { status: 500 })
    }

    const existingTopicsList = existingTopics?.map(t => t.topic_text) || []

    // Prompt baseado na categoria
    const categoryPrompts: Record<string, string> = {
      'Automação e Negócios': 'Gere tópicos sobre automação empresarial, chatbots, sites profissionais, transformação digital, ROI de tecnologia, marketing digital, vendas automatizadas, CRM, e-commerce, landing pages.',
      'Programação e IA': 'Gere tópicos sobre programação web para iniciantes (HTML, CSS, JavaScript, React, Next.js, TypeScript), inteligência artificial (Claude, ChatGPT, Gemini, LLMs, prompts, RAG, fine-tuning), frameworks, ferramentas de IA.',
      'Cuidados Felinos': 'Gere tópicos sobre cuidados com gatos, saúde felina, alimentação, comportamento, raças, adoção, bem-estar, veterinária, primeiros socorros, socialização.',
      'Tech Aleatório': 'Gere tópicos sobre SEO, marketing digital, ferramentas de produtividade (Notion, Obsidian, Figma), hosting (Vercel, Netlify), databases (Supabase, Firebase), automação no-code, tendências tech.'
    }

    const systemPrompt = `Você é um especialista em geração de tópicos de blog relevantes e únicos.

CATEGORIA: ${category}
CONTEXTO: ${categoryPrompts[category] || ''}
${prompt ? `CONTEXTO ADICIONAL: ${prompt}` : ''}

INSTRUÇÕES:
1. Gere EXATAMENTE ${count} tópicos ÚNICOS e DISTINTOS
2. Cada tópico deve ser ESPECÍFICO e ACIONÁVEL (não genérico)
3. EVITE duplicatas ou tópicos muito similares aos já existentes
4. Use linguagem natural, profissional, sem jargões excessivos
5. Foque em problemas REAIS que o público-alvo enfrenta
6. Retorne APENAS os tópicos, um por linha, SEM numeração

TÓPICOS JÁ EXISTENTES (NÃO REPITA nem crie similares):
${existingTopicsList.slice(0, 100).join('\n')}

${existingTopicsList.length > 100 ? `... e mais ${existingTopicsList.length - 100} tópicos` : ''}

GERE AGORA ${count} NOVOS TÓPICOS ÚNICOS:`

    // Chamar OpenAI para gerar tópicos
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
        ],
        temperature: 0.9, // Alta criatividade
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('Erro OpenAI:', errorText)
      return NextResponse.json({ error: 'Erro ao gerar tópicos com IA' }, { status: 500 })
    }

    const openaiData = await openaiResponse.json()
    const generatedText = openaiData.choices[0].message.content

    // Parse tópicos
    const newTopics = generatedText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 10 && !line.match(/^\d+\./)) // Remove numeração e linhas vazias
      .map((line: string) => line.replace(/^[-•*]\s*/, '')) // Remove bullet points

    // Validar similaridade com existentes usando similaridade de string simples
    const validatedTopics: string[] = []
    const duplicates: string[] = []
    const similar: Array<{ new: string; existing: string; similarity: number }> = []

    for (const newTopic of newTopics) {
      // Verificar duplicata exata
      if (existingTopicsList.some(existing => 
        existing.toLowerCase() === newTopic.toLowerCase()
      )) {
        duplicates.push(newTopic)
        continue
      }

      // Verificar similaridade (Levenshtein simplificado)
      let isSimilar = false
      for (const existing of existingTopicsList) {
        const similarity = calculateSimilarity(newTopic.toLowerCase(), existing.toLowerCase())
        if (similarity > 0.75) { // 75% similar
          isSimilar = true
          similar.push({ new: newTopic, existing, similarity })
          break
        }
      }

      if (!isSimilar) {
        validatedTopics.push(newTopic)
      }
    }

    return NextResponse.json({
      success: true,
      category,
      requested: count,
      generated: newTopics.length,
      validated: validatedTopics.length,
      duplicates: duplicates.length,
      similar: similar.length,
      topics: validatedTopics,
      details: {
        duplicates,
        similar: similar.slice(0, 5), // Mostrar apenas primeiros 5
      },
      message: `${validatedTopics.length} tópicos únicos gerados. ${duplicates.length} duplicatas e ${similar.length} similares foram filtrados.`
    })

  } catch (error) {
    console.error('Erro em batch-generate:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
}

/**
 * Calcula similaridade entre duas strings (0-1)
 * Usa algoritmo de Jaccard com n-grams de palavras
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/))
  const words2 = new Set(str2.split(/\s+/))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / union.size
}
