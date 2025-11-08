import { NextResponse } from 'next/server'

// Diagnostic endpoint to check environment configuration
// Remove this in production after debugging

export const runtime = 'edge'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    runtime: 'edge',
    environment: process.env.NODE_ENV,
    checks: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
    },
    urls: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    }
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    }
  })
}
