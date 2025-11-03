import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// =====================================================
// POST /api/newsletter/verify
// Verify email subscription
// =====================================================

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 })
    }

    // Find subscriber by verification token
    const { data: subscriber, error: fetchError } = await supabaseAdmin!
      .from('newsletter_subscribers')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (fetchError || !subscriber) {
      console.error('[Newsletter] Verification error:', fetchError)
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (subscriber.verified) {
      return NextResponse.json({
        success: true,
        message: 'Este email já foi verificado anteriormente!',
        email: subscriber.email,
        alreadyVerified: true,
      })
    }

    // Update subscriber as verified
    const { error: updateError } = await supabaseAdmin!
      .from('newsletter_subscribers')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)

    if (updateError) {
      console.error('[Newsletter] Update error:', updateError)
      return NextResponse.json(
        { error: 'Erro ao verificar email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso! Bem-vindo à Newsletter CatBytes! 🐱',
      email: subscriber.email,
    })
  } catch (error) {
    console.error('[Newsletter] Verify error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar verificação' },
      { status: 500 }
    )
  }
}
