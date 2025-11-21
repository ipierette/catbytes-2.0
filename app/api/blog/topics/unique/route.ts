/**
 * API: Buscar tópico único para geração de blog
 * 
 * GET /api/blog/topics/unique?category=Automação+e+Negócios
 * 
 * Sistema anti-repetição com:
 * - Embeddings vetoriais para detectar similaridade
 * - Bloqueio de tópicos similares usados recentemente
 * - Priorização de tópicos nunca usados
 * - Cooldown configurável (padrão 90 dias)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const similarityThreshold = parseFloat(searchParams.get('similarity_threshold') || '0.85')
    const recentDays = parseInt(searchParams.get('recent_days') || '90')

    if (!category) {
      return NextResponse.json(
        { error: 'Parâmetro "category" é obrigatório' },
        { status: 400 }
      )
    }

    // Validar categoria
    const validCategories = ['Automação e Negócios', 'Programação e IA', 'Cuidados Felinos', 'Tech Aleatório']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida', validCategories },
        { status: 400 }
      )
    }

    console.log(`🔍 [TOPIC-API] Buscando tópico único para categoria: ${category}`)
    console.log(`   📊 Threshold de similaridade: ${similarityThreshold}`)
    console.log(`   ⏰ Cooldown: ${recentDays} dias`)

    // Buscar tópico único usando função do banco
    const { data, error } = await supabaseAdmin
      .rpc('get_unique_blog_topic', {
        p_category: category,
        p_similarity_threshold: similarityThreshold,
        p_recent_days: recentDays
      })

    if (error) {
      console.error('❌ [TOPIC-API] Erro ao buscar tópico:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar tópico', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.warn('⚠️  [TOPIC-API] Nenhum tópico disponível para esta categoria')
      
      // Buscar estatísticas para debug
      const { data: stats } = await supabaseAdmin
        .from('blog_topics_stats')
        .select('*')
        .eq('category', category)
        .single()

      return NextResponse.json(
        {
          error: 'Nenhum tópico disponível no momento',
          message: 'Todos os tópicos foram usados recentemente ou estão bloqueados por similaridade',
          stats,
          suggestions: [
            'Aguarde alguns dias antes de gerar novos posts nesta categoria',
            'Adicione novos tópicos ao banco de dados',
            'Reduza o threshold de similaridade',
            'Reduza o período de cooldown'
          ]
        },
        { status: 404 }
      )
    }

    const topic = data[0]
    
    console.log(`✅ [TOPIC-API] Tópico encontrado:`)
    console.log(`   📝 ${topic.topic}`)
    console.log(`   🔢 Usado ${topic.times_used || 0} vezes`)
    console.log(`   📅 Último uso: ${topic.last_used_at || 'Nunca'}`)

    return NextResponse.json({
      success: true,
      topic: {
        id: topic.id,
        text: topic.topic,
        category: topic.category,
        timesUsed: topic.times_used || 0,
        lastUsedAt: topic.last_used_at
      }
    })

  } catch (error: any) {
    console.error('❌ [TOPIC-API] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
