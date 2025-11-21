/**
 * Topic Generator - Gera tópicos automaticamente usando IA
 * Expande o pool de tópicos quando necessário
 */

import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'
import { BLOG_TOPICS } from '@/types/blog'
import type { BlogTheme } from '@/types/blog'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface TopicGenerationResult {
  generated: string[]
  total: number
  category: BlogTheme
}

/**
 * Verifica se uma categoria precisa de mais tópicos
 */
export async function needsMoreTopics(
  category: BlogTheme,
  threshold: number = 20 // Gera novos quando restam < 20 disponíveis
): Promise<boolean> {
  if (!supabaseAdmin) return false

  try {
    const { data: usedTopics } = await supabaseAdmin
      .from('topic_usage_history')
      .select('topic_text, used_at')
      .eq('category', category)

    const now = new Date()
    const blockedCount = usedTopics?.filter(t => {
      const reusableAfter = new Date(t.used_at)
      reusableAfter.setDate(reusableAfter.getDate() + 730)
      return reusableAfter > now
    }).length || 0

    const totalTopics = BLOG_TOPICS[category].length
    const availableTopics = totalTopics - blockedCount

    console.log(`[Topic Generator] ${category}: ${availableTopics}/${totalTopics} disponíveis`)

    return availableTopics < threshold
  } catch (error) {
    console.error('[Topic Generator] Erro ao verificar necessidade:', error)
    return false
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
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1]
        )
      }
    }
  }
  return dp[m][n]
}

/**
 * Gera novos tópicos usando IA com validação de similaridade
 */
export async function generateNewTopics(
  category: BlogTheme,
  count: number = 30
): Promise<TopicGenerationResult> {
  
  const existingTopics = BLOG_TOPICS[category]
  
  // Buscar tópicos já usados no banco (para validação adicional)
  let usedTopicsFromDB: string[] = []
  if (supabaseAdmin) {
    try {
      const { data: usedTopics } = await supabaseAdmin
        .from('topic_usage_history')
        .select('topic_text')
        .eq('category', category)
      
      usedTopicsFromDB = usedTopics?.map(t => t.topic_text) || []
    } catch (error) {
      console.warn('[Topic Generator] Aviso: não foi possível buscar tópicos usados do DB:', error)
    }
  }

  // Combinar tópicos existentes do código + usados do DB
  const allExistingTopics = Array.from(new Set([...existingTopics, ...usedTopicsFromDB]))
  
  const categoryDescriptions: Record<BlogTheme, string> = {
    'Automação e Negócios': 'automação empresarial, produtividade, ferramentas no-code/low-code, chatbots, sistemas de gestão, marketing automation, vendas online',
    'Programação e IA': 'desenvolvimento de software, inteligência artificial, machine learning, frameworks modernos, APIs, cloud computing, DevOps, LLMs',
    'Cuidados Felinos': 'saúde de gatos, comportamento felino, alimentação, brinquedos, adestramento, curiosidades sobre gatos, dicas para tutores',
    'Tech Aleatório': 'tecnologia em geral, gadgets, apps úteis, produtividade pessoal, design, UX/UI, inovações tecnológicas, tendências'
  }

  const prompt = `Você é um especialista em criação de conteúdo para blog sobre ${categoryDescriptions[category]}.

CONTEXTO:
- Categoria: "${category}"
- Tópicos já existentes: ${allExistingTopics.length}
- Público: empreendedores, profissionais de tech, entusiastas de tecnologia e negócios

TÓPICOS EXISTENTES (NÃO REPETIR nem criar similares):
${allExistingTopics.slice(0, 100).join('\n')}
${allExistingTopics.length > 100 ? `...e mais ${allExistingTopics.length - 100} tópicos` : ''}

TAREFA:
Gere ${count} NOVOS tópicos de artigos que:
1. Sejam DIFERENTES dos existentes (não repita ideias)
2. Sejam específicos e práticos (evite genéricos)
3. Tenham apelo SEO (buscas comuns)
4. Sejam relevantes para 2025-2027
5. Misturem: tutoriais práticos, comparações, listas, guias, tendências
6. Tenham títulos chamativos mas informativos

FORMATO:
Retorne APENAS uma lista JSON com os tópicos, exemplo:
["Tópico 1 aqui", "Tópico 2 aqui", "Tópico 3 aqui"]

NÃO inclua numeração, NÃO inclua explicações, APENAS o array JSON.`

  try {
    console.log(`[Topic Generator] Gerando ${count} novos tópicos para "${category}"...`)
    
    // Usar GPT-4o (mais recente) ou GPT-4 Turbo para memória atualizada
    const model = process.env.OPENAI_TOPIC_MODEL || 'gpt-4o' // gpt-4o tem dados até out/2023
    console.log(`[Topic Generator] Using model: ${model}`)
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em criação de tópicos para blog de tecnologia e negócios. Tem conhecimento atualizado sobre as últimas tendências, ferramentas e inovações até 2023. Retorne APENAS um array JSON válido com tópicos relevantes e atuais.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9, // Alta criatividade
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content?.trim() || '[]'
    
    // Extrair JSON (pode vir com ```json ou outros wrappers)
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Resposta não contém array JSON válido')
    }

    const generatedTopics: string[] = JSON.parse(jsonMatch[0])
    
    console.log(`[Topic Generator] ✓ ${generatedTopics.length} tópicos gerados pela IA`)

    // VALIDAÇÃO DE SIMILARIDADE
    const validatedTopics: string[] = []
    const duplicates: string[] = []
    const similar: Array<{ new: string; existing: string; similarity: number }> = []
    const threshold = 0.75 // 75% de similaridade

    for (const newTopic of generatedTopics) {
      const newTopicLower = newTopic.toLowerCase().trim()

      // Verificar duplicata exata
      if (allExistingTopics.some(existing => 
        existing.toLowerCase().trim() === newTopicLower
      )) {
        duplicates.push(newTopic)
        continue
      }

      // Verificar similaridade
      let isSimilar = false
      for (const existing of allExistingTopics) {
        const similarity = calculateSimilarity(newTopicLower, existing.toLowerCase())
        if (similarity > threshold) {
          isSimilar = true
          similar.push({ new: newTopic, existing, similarity })
          break
        }
      }

      if (!isSimilar) {
        validatedTopics.push(newTopic)
        // Adicionar à lista de existentes para validar próximos
        allExistingTopics.push(newTopic)
      }
    }

    console.log(`[Topic Generator] 📊 Validação:`)
    console.log(`  - Gerados: ${generatedTopics.length}`)
    console.log(`  - ✅ Validados: ${validatedTopics.length}`)
    console.log(`  - 🔴 Duplicatas: ${duplicates.length}`)
    console.log(`  - 🟡 Similares: ${similar.length}`)

    if (duplicates.length > 0) {
      console.log(`[Topic Generator] Duplicatas filtradas:`, duplicates.slice(0, 3))
    }
    if (similar.length > 0) {
      console.log(`[Topic Generator] Similares filtrados (primeiros 3):`)
      similar.slice(0, 3).forEach(s => {
        console.log(`  - "${s.new}" similar a "${s.existing}" (${Math.round(s.similarity * 100)}%)`)
      })
    }

    return {
      generated: validatedTopics,
      total: validatedTopics.length,
      category
    }

  } catch (error) {
    console.error('[Topic Generator] Erro ao gerar tópicos:', error)
    throw error
  }
}

/**
 * Salva novos tópicos no arquivo types/blog.ts
 */
export async function saveTopicsToFile(
  category: BlogTheme,
  newTopics: string[]
): Promise<void> {
  // Esta função seria implementada para atualizar o arquivo types/blog.ts
  // Por enquanto, apenas loga os tópicos gerados para adição manual
  
  console.log(`\n[Topic Generator] ========================================`)
  console.log(`[Topic Generator] NOVOS TÓPICOS GERADOS - ${category}`)
  console.log(`[Topic Generator] ========================================\n`)
  
  newTopics.forEach((topic, i) => {
    console.log(`  '${topic}',`)
  })
  
  console.log(`\n[Topic Generator] Adicione estes ${newTopics.length} tópicos em types/blog.ts`)
  console.log(`[Topic Generator] na categoria "${category}"\n`)
}

/**
 * Processo completo: verifica necessidade e gera tópicos automaticamente
 */
export async function autoExpandTopics(
  category?: BlogTheme,
  threshold: number = 20
): Promise<void> {
  const categoriesToCheck = category 
    ? [category] 
    : Object.keys(BLOG_TOPICS) as BlogTheme[]

  for (const cat of categoriesToCheck) {
    const needs = await needsMoreTopics(cat, threshold)
    
    if (needs) {
      console.log(`[Topic Generator] 🔄 Categoria "${cat}" precisa de mais tópicos`)
      
      try {
        const result = await generateNewTopics(cat, 30)
        await saveTopicsToFile(cat, result.generated)
      } catch (error) {
        console.error(`[Topic Generator] ❌ Falha ao gerar tópicos para "${cat}":`, error)
      }
    } else {
      console.log(`[Topic Generator] ✓ Categoria "${cat}" tem tópicos suficientes`)
    }
  }
}
