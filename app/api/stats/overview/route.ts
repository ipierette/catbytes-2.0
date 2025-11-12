import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cache simples (2 minutos para dados mais atualizados)
let cachedStats: any = null
let cacheTime: number = 0
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutos

export async function GET(request: NextRequest) {
  try {
    // Verificar cache
    const now = Date.now()
    if (cachedStats && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedStats,
        cached: true,
        cacheAge: Math.floor((now - cacheTime) / 1000) // segundos desde cache
      })
    }

    // Buscar estatísticas do blog
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('published, created_at')
      .order('created_at', { ascending: false })

    if (blogError) {
      console.error('Error fetching blog stats:', blogError)
    }

    // Encontrar último post gerado
    const lastBlogGenerated = blogPosts && blogPosts.length > 0 
      ? blogPosts[0].created_at 
      : null

    const blogStats = {
      total: blogPosts?.length || 0,
      published: blogPosts?.filter(p => p.published === true).length || 0,
      drafts: blogPosts?.filter(p => p.published === false).length || 0,
      scheduled: 0, // Campo não usado atualmente
      lastGenerated: lastBlogGenerated
    }

    // Buscar estatísticas do Instagram
    const { data: instagramPosts, error: instagramError } = await supabase
      .from('instagram_posts')
      .select('status, created_at')
      .order('created_at', { ascending: false })

    if (instagramError) {
      console.error('Error fetching instagram stats:', instagramError)
    }

    // Encontrar último post do Instagram gerado
    const lastInstagramGenerated = instagramPosts && instagramPosts.length > 0 
      ? instagramPosts[0].created_at 
      : null

    const instagramStats = {
      total: instagramPosts?.length || 0,
      pending: instagramPosts?.filter(p => p.status === 'pending').length || 0,
      approved: instagramPosts?.filter(p => p.status === 'approved').length || 0,
      published: instagramPosts?.filter(p => p.status === 'published').length || 0,
      failed: instagramPosts?.filter(p => p.status === 'failed').length || 0,
      lastGenerated: lastInstagramGenerated
    }

    // Buscar configurações de automação
    const { data: settings } = await supabase
      .from('automation_settings')
      .select('*')
      .single()

    // Calcular próximas execuções
    const nextGeneration = calculateNextGenerationDate()
    const nextPublication = calculateNextPublicationDate()

    const automationStats = {
      status: settings?.auto_generation_enabled === false ? 'paused' : 'active',
      nextGeneration: nextGeneration.toISOString(),
      nextPublication: nextPublication.toISOString(),
      lastRun: settings?.last_generation_run || new Date().toISOString(),
      cronJobs: 2 // Generation + Publication
    }

    const stats = {
      blog: blogStats,
      instagram: instagramStats,
      automation: automationStats,
      timestamp: new Date().toISOString(),
      // Metadados úteis para o frontend
      meta: {
        cacheEnabled: true,
        cacheDuration: CACHE_DURATION / 1000, // em segundos
        refreshRate: 30 // frontend atualiza a cada 30s
      }
    }

    // Atualizar cache
    cachedStats = stats
    cacheTime = now

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
      cacheAge: 0
    })
  } catch (error) {
    console.error('Error in stats/overview endpoint:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    }, { status: 500 })
  }
}

// Calcular próxima geração (seg, ter, qui, sáb às 13:00)
function calculateNextGenerationDate(): Date {
  const generationDays = new Set([1, 2, 4, 6]) // Seg, Ter, Qui, Sáb
  const generationHour = 13
  
  const now = new Date()
  const result = new Date(now)
  result.setHours(generationHour, 0, 0, 0)
  
  if (now.getHours() >= generationHour) {
    result.setDate(result.getDate() + 1)
  }
  
  let daysChecked = 0
  while (daysChecked < 7) {
    if (generationDays.has(result.getDay())) {
      return result
    }
    result.setDate(result.getDate() + 1)
    daysChecked++
  }
  
  return result
}

// Calcular próxima publicação (seg, qua, sex, dom às 13:00)
function calculateNextPublicationDate(): Date {
  const publicationDays = new Set([1, 3, 5, 0]) // Seg, Qua, Sex, Dom
  const publicationHour = 13
  
  const now = new Date()
  const result = new Date(now)
  result.setHours(publicationHour, 0, 0, 0)
  
  if (now.getHours() >= publicationHour) {
    result.setDate(result.getDate() + 1)
  }
  
  let daysChecked = 0
  while (daysChecked < 7) {
    if (publicationDays.has(result.getDay())) {
      return result
    }
    result.setDate(result.getDate() + 1)
    daysChecked++
  }
  
  return result
}
