import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cache simples (5 minutos)
let cachedStats: any = null
let cacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export async function GET(request: NextRequest) {
  try {
    // Verificar cache
    const now = Date.now()
    if (cachedStats && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedStats,
        cached: true
      })
    }

    // Buscar estatísticas do blog
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('status')

    if (blogError) {
      console.error('Error fetching blog stats:', blogError)
    }

    const blogStats = {
      total: blogPosts?.length || 0,
      published: blogPosts?.filter(p => p.status === 'published').length || 0,
      drafts: blogPosts?.filter(p => p.status === 'draft').length || 0,
      scheduled: blogPosts?.filter(p => p.status === 'scheduled').length || 0
    }

    // Buscar estatísticas do Instagram
    const { data: instagramPosts, error: instagramError } = await supabase
      .from('instagram_posts')
      .select('status')

    if (instagramError) {
      console.error('Error fetching instagram stats:', instagramError)
    }

    const instagramStats = {
      total: instagramPosts?.length || 0,
      pending: instagramPosts?.filter(p => p.status === 'pending').length || 0,
      approved: instagramPosts?.filter(p => p.status === 'approved').length || 0,
      published: instagramPosts?.filter(p => p.status === 'published').length || 0,
      failed: instagramPosts?.filter(p => p.status === 'failed').length || 0
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
      timestamp: new Date().toISOString()
    }

    // Atualizar cache
    cachedStats = stats
    cacheTime = now

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false
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
