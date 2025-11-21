/**
 * API: Gerenciamento de tópicos (Admin CRUD)
 * 
 * GET    /api/blog/topics - Listar tópicos
 * POST   /api/blog/topics - Criar novo tópico
 * PATCH  /api/blog/topics - Atualizar tópico
 * DELETE /api/blog/topics - Deletar tópico (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// Gerar embedding para novo tópico
async function generateEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Erro ao gerar embedding:', error)
    return null
  }
}

// GET - Listar tópicos com filtros
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client não configurado' },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('blog_topics')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('topic', `%${search}%`)
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      topics: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao listar tópicos', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Criar novo tópico
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client não configurado' },
        { status: 500 }
      )
    }
    const body = await request.json()
    const { topic, category, priority = 0, tags = [], approved = true } = body

    if (!topic || !category) {
      return NextResponse.json(
        { error: 'topic e category são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar embedding
    const embedding = await generateEmbedding(topic)

    if (!embedding) {
      return NextResponse.json(
        { error: 'Erro ao gerar embedding para o tópico' },
        { status: 500 }
      )
    }

    // Inserir tópico
    const { data, error } = await supabaseAdmin
      .from('blog_topics')
      .insert({
        topic,
        category,
        priority,
        tags,
        approved,
        approved_at: approved ? new Date().toISOString() : null,
        embedding,
        source: 'manual'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao criar tópico', details: error.message },
        { status: 500 }
      )
    }

    // Recalcular similaridades
    await supabaseAdmin.rpc('calculate_topic_similarities', { p_threshold: 0.85 })

    return NextResponse.json({
      success: true,
      message: 'Tópico criado com sucesso',
      topic: data
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao criar tópico', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar tópico
export async function PATCH(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client não configurado' },
        { status: 500 }
      )
    }
    const body = await request.json()
    const { id, updates } = body

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'id e updates são obrigatórios' },
        { status: 400 }
      )
    }

    // Se o texto do tópico mudou, regerar embedding
    if (updates.topic) {
      const embedding = await generateEmbedding(updates.topic)
      if (embedding) {
        updates.embedding = embedding
      }
    }

    const { data, error } = await supabaseAdmin
      .from('blog_topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar tópico', details: error.message },
        { status: 500 }
      )
    }

    // Se mudou o texto, recalcular similaridades
    if (updates.topic) {
      await supabaseAdmin.rpc('calculate_topic_similarities', { p_threshold: 0.85 })
    }

    return NextResponse.json({
      success: true,
      message: 'Tópico atualizado com sucesso',
      topic: data
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao atualizar tópico', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete de tópico
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client não configurado' },
        { status: 500 }
      )
    }
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('blog_topics')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao deletar tópico', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tópico deletado com sucesso'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao deletar tópico', details: error.message },
      { status: 500 }
    )
  }
}
