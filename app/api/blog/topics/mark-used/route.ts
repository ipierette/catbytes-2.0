/**
 * API: Marcar tópico como usado após geração de post
 * 
 * POST /api/blog/topics/mark-used
 * Body: { topicId, postId, generationTimeMs, success, errorMessage }
 * 
 * Atualiza estatísticas de uso e registra no histórico
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topicId, postId, generationTimeMs, success = true, errorMessage } = body

    if (!topicId) {
      return NextResponse.json(
        { error: 'topicId é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`📝 [TOPIC-USAGE] Marcando tópico ${topicId} como usado`)
    console.log(`   🆔 Post ID: ${postId || 'N/A'}`)
    console.log(`   ⏱️  Tempo de geração: ${generationTimeMs || 'N/A'}ms`)
    console.log(`   ${success ? '✅' : '❌'} Sucesso: ${success}`)

    // Marcar como usado usando função do banco
    const { error } = await supabaseAdmin
      .rpc('mark_topic_as_used', {
        p_topic_id: topicId,
        p_post_id: postId || null,
        p_generation_time_ms: generationTimeMs || null
      })

    if (error) {
      console.error('❌ [TOPIC-USAGE] Erro ao marcar tópico:', error)
      return NextResponse.json(
        { error: 'Erro ao marcar tópico como usado', details: error.message },
        { status: 500 }
      )
    }

    // Se houve erro, atualizar o histórico
    if (!success && errorMessage) {
      await supabaseAdmin
        .from('blog_topic_usage_history')
        .update({
          success: false,
          error_message: errorMessage
        })
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false })
        .limit(1)
    }

    // Buscar estatísticas atualizadas do tópico
    const { data: topicData } = await supabaseAdmin
      .from('blog_topics')
      .select('topic, times_used, last_used_at, status')
      .eq('id', topicId)
      .single()

    console.log(`✅ [TOPIC-USAGE] Tópico atualizado:`)
    console.log(`   📝 ${topicData?.topic}`)
    console.log(`   🔢 Total de usos: ${topicData?.times_used}`)
    console.log(`   📊 Status: ${topicData?.status}`)

    return NextResponse.json({
      success: true,
      message: 'Tópico marcado como usado',
      topic: topicData
    })

  } catch (error: any) {
    console.error('❌ [TOPIC-USAGE] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}
