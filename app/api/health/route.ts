/**
 * Health Check Endpoint
 * 
 * Verifica status de todos os serviços críticos do sistema
 * GET /api/health
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { circuitBreakers } from '@/lib/circuit-breaker'
import { getAllRateLimitStats } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

type ServiceStatus = 'up' | 'degraded' | 'down'

interface ServiceHealth {
  status: ServiceStatus
  responseTime?: number
  error?: string
  details?: Record<string, any>
}

/**
 * Verifica saúde do banco de dados
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now()
  
  try {
    if (!supabaseAdmin) {
      return { status: 'down', error: 'Supabase client not configured' }
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .limit(1)
      .single()

    const responseTime = Date.now() - start

    if (error && error.message !== 'No rows found') {
      return { status: 'degraded', responseTime, error: error.message }
    }

    return {
      status: 'up',
      responseTime,
      details: { connected: true, latency: `${responseTime}ms` }
    }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verifica saúde da OpenAI API
 */
async function checkOpenAI(): Promise<ServiceHealth> {
  const start = Date.now()
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { status: 'down', error: 'OpenAI API key not configured' }
    }

    const circuitState = circuitBreakers.openai.getState()
    if (circuitState === 'OPEN') {
      return {
        status: 'degraded',
        error: 'Circuit breaker is OPEN',
        details: circuitBreakers.openai.getStats()
      }
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    })

    const responseTime = Date.now() - start

    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return {
      status: 'up',
      responseTime,
      details: { authenticated: true, latency: `${responseTime}ms` }
    }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verifica saúde da Instagram API
 */
async function checkInstagram(): Promise<ServiceHealth> {
  const start = Date.now()
  
  try {
    if (!process.env.INSTAGRAM_ACCESS_TOKEN || !process.env.INSTAGRAM_ACCOUNT_ID) {
      return { status: 'down', error: 'Instagram credentials not configured' }
    }

    const circuitState = circuitBreakers.instagram.getState()
    if (circuitState === 'OPEN') {
      return {
        status: 'degraded',
        error: 'Circuit breaker is OPEN',
        details: circuitBreakers.instagram.getStats()
      }
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.INSTAGRAM_ACCOUNT_ID}?fields=id,username&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
    )

    const responseTime = Date.now() - start

    if (!response.ok) {
      const error = await response.json()
      return {
        status: 'degraded',
        responseTime,
        error: error.error?.message || `HTTP ${response.status}`
      }
    }

    const data = await response.json()

    return {
      status: 'up',
      responseTime,
      details: { authenticated: true, account: data.username, latency: `${responseTime}ms` }
    }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verifica saúde da LinkedIn API
 */
async function checkLinkedIn(): Promise<ServiceHealth> {
  const start = Date.now()
  
  try {
    if (!process.env.LINKEDIN_ACCESS_TOKEN) {
      return { status: 'down', error: 'LinkedIn credentials not configured' }
    }

    const circuitState = circuitBreakers.linkedin.getState()
    if (circuitState === 'OPEN') {
      return {
        status: 'degraded',
        error: 'Circuit breaker is OPEN',
        details: circuitBreakers.linkedin.getStats()
      }
    }

    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` }
    })

    const responseTime = Date.now() - start

    if (!response.ok) {
      return {
        status: 'degraded',
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return {
      status: 'up',
      responseTime,
      details: { authenticated: true, latency: `${responseTime}ms` }
    }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    // Executar todos os health checks em paralelo
    const [database, openai, instagram, linkedin] = await Promise.all([
      checkDatabase(),
      checkOpenAI(),
      checkInstagram(),
      checkLinkedIn()
    ])

    // Coletar stats de circuit breakers e rate limiters
    const circuitBreakerStats = {
      instagram: circuitBreakers.instagram.getStats(),
      linkedin: circuitBreakers.linkedin.getStats(),
      openai: circuitBreakers.openai.getStats(),
      database: circuitBreakers.database.getStats()
    }

    const rateLimitStats = getAllRateLimitStats()

    // Determinar status geral
    const services = { database, openai, instagram, linkedin }
    const statuses = Object.values(services).map(s => s.status)
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    if (statuses.every(s => s === 'up')) {
      overallStatus = 'healthy'
    } else if (statuses.some(s => s === 'down')) {
      overallStatus = 'unhealthy'
    } else {
      overallStatus = 'degraded'
    }

    // Info de deploy
    const url = new URL(request.url)
    const deployment = {
      vercel: !!process.env.VERCEL,
      vercel_url: process.env.VERCEL_URL,
      vercel_env: process.env.VERCEL_ENV,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7),
      branch: process.env.VERCEL_GIT_COMMIT_REF
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      deployment,
      services,
      circuitBreakers: circuitBreakerStats,
      rateLimits: rateLimitStats
    }

    // Retornar status HTTP apropriado
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 207 : 503

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('[Health Check] Error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}