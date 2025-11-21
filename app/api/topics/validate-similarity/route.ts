import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'

/**
 * POST /api/topics/validate-similarity
 * Valida se um tópico é muito similar aos existentes
 * 
 * Body: {
 *   category: string,
 *   topic: string,
 *   threshold?: number (default 0.75)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { category, topic, threshold = 0.75 } = await request.json()

    if (!category || !topic) {
      return NextResponse.json({ error: 'Categoria e tópico obrigatórios' }, { status: 400 })
    }

    // Buscar tópicos existentes
    const { data: existingTopics, error } = await supabase
      .from('topic_usage_history')
      .select('topic_text, used_at')
      .eq('category', category)

    if (error) {
      console.error('Erro ao buscar tópicos:', error)
      return NextResponse.json({ error: 'Erro ao validar' }, { status: 500 })
    }

    const topicLower = topic.toLowerCase().trim()
    
    // Verificar duplicata exata
    const exactMatch = existingTopics?.find(t => 
      t.topic_text.toLowerCase().trim() === topicLower
    )

    if (exactMatch) {
      return NextResponse.json({
        valid: false,
        reason: 'duplicate',
        message: 'Tópico já existe exatamente como está',
        match: exactMatch,
        similarity: 1.0
      })
    }

    // Verificar similaridade
    const similarities = existingTopics?.map(existing => ({
      topic: existing.topic_text,
      usedAt: existing.used_at,
      similarity: calculateSimilarity(topicLower, existing.topic_text.toLowerCase())
    })) || []

    // Ordenar por similaridade (maior primeiro)
    similarities.sort((a, b) => b.similarity - a.similarity)

    const mostSimilar = similarities[0]
    const isTooSimilar = mostSimilar && mostSimilar.similarity > threshold

    if (isTooSimilar) {
      return NextResponse.json({
        valid: false,
        reason: 'similar',
        message: `Tópico muito similar a um existente (${Math.round(mostSimilar.similarity * 100)}% de similaridade)`,
        match: mostSimilar,
        topSimilar: similarities.slice(0, 3)
      })
    }

    return NextResponse.json({
      valid: true,
      message: 'Tópico único e válido',
      similarity: mostSimilar?.similarity || 0,
      topSimilar: similarities.slice(0, 3)
    })

  } catch (error) {
    console.error('Erro em validate-similarity:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
}

/**
 * Calcula similaridade entre duas strings usando múltiplos métodos
 */
function calculateSimilarity(str1: string, str2: string): number {
  // Método 1: Jaccard similarity (palavras)
  const words1 = new Set(str1.split(/\s+/))
  const words2 = new Set(str2.split(/\s+/))
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  const jaccardScore = intersection.size / union.size

  // Método 2: Substring comum mais longa
  const lcs = longestCommonSubstring(str1, str2)
  const lcsScore = lcs / Math.max(str1.length, str2.length)

  // Método 3: Levenshtein distance normalizada
  const levenScore = 1 - (levenshteinDistance(str1, str2) / Math.max(str1.length, str2.length))

  // Média ponderada (Jaccard tem mais peso)
  return (jaccardScore * 0.5) + (lcsScore * 0.25) + (levenScore * 0.25)
}

/**
 * Longest Common Substring length
 */
function longestCommonSubstring(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  let max = 0
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        max = Math.max(max, dp[i][j])
      }
    }
  }

  return max
}

/**
 * Levenshtein Distance (edit distance)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        )
      }
    }
  }

  return dp[m][n]
}
