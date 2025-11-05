import { NextRequest, NextResponse } from 'next/server'

/**
 * Health check endpoint para diagnosticar problemas de deploy
 * Acesse /api/health para verificar se o deploy está funcionando
 */
export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString()
    const url = new URL(request.url)
    
    return NextResponse.json({
      status: 'healthy',
      timestamp,
      environment: process.env.NODE_ENV,
      deployment: {
        vercel: !!process.env.VERCEL,
        vercel_url: process.env.VERCEL_URL,
        vercel_env: process.env.VERCEL_ENV
      },
      build: {
        success: true,
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7),
        branch: process.env.VERCEL_GIT_COMMIT_REF
      },
      config: {
        hostname: url.hostname,
        nextjs: '15.5.6',
        runtime: 'nodejs'
      }
    })
  } catch (error) {
    console.error('[Health Check] Error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}