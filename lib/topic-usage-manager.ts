/**
 * Topic Usage Manager
 * Garante que tópicos não se repitam por 2 anos (416 artigos)
 */

import { supabaseAdmin } from '@/lib/supabase'
import { BLOG_TOPICS } from '@/types/blog'
import type { BlogTheme } from '@/types/blog'

interface TopicUsage {
  id: string
  category: string
  topic_text: string
  used_at: string
  reusable_after: string
}

/**
 * Registra uso de um tópico no histórico
 */
export async function recordTopicUsage(
  category: BlogTheme,
  topicText: string,
  blogPostId: string
): Promise<void> {
  try {
    if (!supabaseAdmin) {
      console.error('[Topic Manager] supabaseAdmin não inicializado')
      return
    }

    const { error } = await supabaseAdmin
      .from('topic_usage_history')
      .upsert({
        category,
        topic_text: topicText,
        blog_post_id: blogPostId,
        used_at: new Date().toISOString()
      }, {
        onConflict: 'category,topic_text',
        ignoreDuplicates: false // Atualiza used_at se já existe
      })

    if (error) {
      console.error('[Topic Manager] Erro ao registrar uso:', error)
    } else {
      console.log(`[Topic Manager] ✓ Tópico registrado: "${topicText}" (${category})`)
    }
  } catch (error) {
    console.error('[Topic Manager] Erro inesperado:', error)
  }
}

/**
 * Busca tópicos disponíveis (nunca usados OU reutilizáveis após 2 anos)
 */
export async function getAvailableTopics(category: BlogTheme): Promise<readonly string[]> {
  try {
    if (!supabaseAdmin) {
      console.error('[Topic Manager] supabaseAdmin não inicializado')
      return BLOG_TOPICS[category]
    }

    // Buscar tópicos usados que ainda não podem ser reutilizados
    const { data: usedTopics, error } = await supabaseAdmin
      .from('topic_usage_history')
      .select('topic_text, used_at')
      .eq('category', category)

    if (error) {
      console.error('[Topic Manager] Erro ao buscar histórico:', error)
      // Fallback: retornar todos os tópicos se houver erro
      return BLOG_TOPICS[category]
    }

    // Tópicos bloqueados (usados nos últimos 2 anos)
    const now = new Date()
    const blockedTopics = new Set(
      usedTopics
        ?.filter(t => {
          const reusableAfter = new Date(t.used_at)
          reusableAfter.setDate(reusableAfter.getDate() + 730) // + 2 anos
          return reusableAfter > now
        })
        .map(t => t.topic_text.toLowerCase()) || []
    )

    // Filtrar tópicos disponíveis
    const allTopics = BLOG_TOPICS[category]
    const availableTopics = allTopics.filter(
      topic => !blockedTopics.has(topic.toLowerCase())
    )

    console.log(`[Topic Manager] ${category}:`)
    console.log(`  Total de tópicos: ${allTopics.length}`)
    console.log(`  Bloqueados (< 2 anos): ${blockedTopics.size}`)
    console.log(`  Disponíveis: ${availableTopics.length}`)

    return availableTopics

  } catch (error) {
    console.error('[Topic Manager] Erro inesperado:', error)
    return BLOG_TOPICS[category]
  }
}

/**
 * Seleciona tópico inteligente (prioriza nunca usados, permite reuso após 2 anos)
 */
export async function selectSmartTopic(category: BlogTheme): Promise<string> {
  const availableTopics = await getAvailableTopics(category)

  if (availableTopics.length === 0) {
    console.warn(`[Topic Manager] ⚠️ TODOS os tópicos de "${category}" foram usados!`)
    console.warn('[Topic Manager] Buscando tópicos reutilizáveis (> 2 anos)...')

    if (!supabaseAdmin) {
      console.error('[Topic Manager] supabaseAdmin não inicializado')
      const allTopics = [...BLOG_TOPICS[category]]
      return allTopics[Math.floor(Math.random() * allTopics.length)]
    }

    // Buscar tópicos mais antigos (reutilizáveis)
    const { data: reusableTopics } = await supabaseAdmin
      .from('topic_usage_history')
      .select('topic_text, used_at')
      .eq('category', category)
      .order('used_at', { ascending: true }) // Mais antigos primeiro
      .limit(20)

    if (reusableTopics && reusableTopics.length > 0) {
      // Filtrar apenas os que já passaram 2 anos
      const now = new Date()
      const actuallyReusable = reusableTopics.filter(t => {
        const reusableAfter = new Date(t.used_at)
        reusableAfter.setDate(reusableAfter.getDate() + 730)
        return reusableAfter <= now
      })

      if (actuallyReusable.length > 0) {
        const randomReusable = actuallyReusable[Math.floor(Math.random() * actuallyReusable.length)]
        console.log(`[Topic Manager] ✓ Reutilizando tópico antigo: "${randomReusable.topic_text}"`)
        console.log(`[Topic Manager] Último uso: ${new Date(randomReusable.used_at).toLocaleDateString('pt-BR')}`)
        return randomReusable.topic_text
      }
    }

    // Último recurso: pegar qualquer tópico (não deveria acontecer com 104+ tópicos)
    console.error('[Topic Manager] ❌ Nenhum tópico reutilizável encontrado!')
    const allTopics = [...BLOG_TOPICS[category]]
    return allTopics[Math.floor(Math.random() * allTopics.length)]
  }

  // Selecionar aleatoriamente dos disponíveis
  const selectedTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)]
  console.log(`[Topic Manager] ✓ Tópico selecionado: "${selectedTopic}"`)
  
  return selectedTopic
}

/**
 * Obtém estatísticas de uso de tópicos
 */
export async function getTopicUsageStats(): Promise<{
  [key in BlogTheme]: {
    total: number
    used: number
    available: number
    oldestReusable: string | null
  }
}> {
  const stats: any = {}

  for (const category of Object.keys(BLOG_TOPICS) as BlogTheme[]) {
    const allTopics = BLOG_TOPICS[category]
    const availableTopics = await getAvailableTopics(category)

    // Buscar tópico mais antigo reutilizável
    let oldestReusable = null
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('topic_usage_history')
        .select('topic_text, used_at')
        .eq('category', category)
        .order('used_at', { ascending: true })
        .limit(1)
        .single()
      
      // Verificar se já passou 2 anos
      if (data) {
        const reusableAfter = new Date(data.used_at)
        reusableAfter.setDate(reusableAfter.getDate() + 730)
        if (reusableAfter <= new Date()) {
          oldestReusable = data
        }
      }
    }

    stats[category] = {
      total: allTopics.length,
      used: allTopics.length - availableTopics.length,
      available: availableTopics.length,
      oldestReusable: oldestReusable?.used_at || null
    }
  }

  return stats
}
