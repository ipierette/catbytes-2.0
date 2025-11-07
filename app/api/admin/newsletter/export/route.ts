// =====================================================
// API Route: Export Newsletter Subscribers to CSV
// GET /api/admin/newsletter/export
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  try {
    // ========================================
    // 1. Verify Admin Authentication
    // ========================================
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error || NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ========================================
    // 2. Check Supabase Admin
    // ========================================
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin not configured' },
        { status: 500 }
      )
    }

    // ========================================
    // 3. Parse Query Parameters (Optional Filters)
    // ========================================
    const { searchParams } = new URL(request.url)
    const verified = searchParams.get('verified')
    const subscribed = searchParams.get('subscribed')
    const language = searchParams.get('language')

    // ========================================
    // 4. Fetch All Subscribers with Filters
    // ========================================
    let query = supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    if (verified === 'true') query = query.eq('verified', true)
    if (verified === 'false') query = query.eq('verified', false)
    if (subscribed === 'true') query = query.eq('subscribed', true)
    if (subscribed === 'false') query = query.eq('subscribed', false)
    if (language && language !== 'all') query = query.eq('locale', language)

    const { data: subscribers, error } = await query

    if (error) {
      console.error('[Newsletter Export] Error fetching subscribers:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    // ========================================
    // 5. Generate CSV
    // ========================================
    const csvHeaders = [
      'Email',
      'Nome',
      'Verificado',
      'Inscrito',
      'Idioma',
      'Data de Inscrição',
      'Data de Verificação',
      'Origem',
      'Emails Enviados',
      'Emails Abertos',
      'Emails Clicados',
    ].join(',')

    const csvRows = (subscribers || []).map((sub) => {
      return [
        sub.email,
        sub.name || '',
        sub.verified ? 'Sim' : 'Não',
        sub.subscribed ? 'Sim' : 'Não',
        sub.locale || 'pt-BR',
        sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('pt-BR') : '',
        sub.verified_at ? new Date(sub.verified_at).toLocaleDateString('pt-BR') : '',
        sub.source || 'website',
        sub.emails_sent_count || 0,
        sub.emails_opened_count || 0,
        sub.emails_clicked_count || 0,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    })

    const csv = [csvHeaders, ...csvRows].join('\n')

    // Add BOM for Excel UTF-8 support
    const bom = '\uFEFF'
    const csvWithBOM = bom + csv

    // ========================================
    // 6. Generate Filename
    // ========================================
    const now = new Date()
    const timestamp = now.toISOString().split('T')[0]
    const filename = `newsletter-subscribers-${timestamp}.csv`

    // ========================================
    // 7. Return CSV File
    // ========================================
    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[Newsletter Export] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ========================================
// OPTIONS for CORS
// ========================================
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
