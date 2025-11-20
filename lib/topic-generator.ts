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
 * Gera novos tópicos usando IA
 */
export async function generateNewTopics(
  category: BlogTheme,
  count: number = 30
): Promise<TopicGenerationResult> {
  
  const existingTopics = BLOG_TOPICS[category]
  
  const categoryDescriptions: Record<BlogTheme, string> = {
    'Automação e Negócios': 'automação empresarial, produtividade, ferramentas no-code/low-code, chatbots, sistemas de gestão, marketing automation, vendas online',
    'Programação e IA': 'desenvolvimento de software, inteligência artificial, machine learning, frameworks modernos, APIs, cloud computing, DevOps, LLMs',
    'Cuidados Felinos': 'saúde de gatos, comportamento felino, alimentação, brinquedos, adestramento, curiosidades sobre gatos, dicas para tutores',
    'Tech Aleatório': 'tecnologia em geral, gadgets, apps úteis, produtividade pessoal, design, UX/UI, inovações tecnológicas, tendências'
  }

  const prompt = `Você é um especialista em criação de conteúdo para blog sobre ${categoryDescriptions[category]}.

CONTEXTO:
- Categoria: "${category}"
- Tópicos já existentes: ${existingTopics.length}
- Público: empreendedores, profissionais de tech, entusiastas de tecnologia e negócios

TÓPICOS EXISTENTES (NÃO REPETIR):
${existingTopics.slice(0, 50).join('\n')}
...e mais ${existingTopics.length - 50} tópicos

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
    
    console.log(`[Topic Generator] ✓ ${generatedTopics.length} tópicos gerados com sucesso`)

    return {
      generated: generatedTopics,
      total: generatedTopics.length,
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
