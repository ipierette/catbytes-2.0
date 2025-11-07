import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API para autenticar no Supabase Auth usando credenciais admin
 * Isso garante que o upload de imagens funcione com RLS
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Autentica no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Erro ao autenticar no Supabase:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    })

  } catch (error: any) {
    console.error('Erro na API de autenticação Supabase:', error)
    return NextResponse.json(
      { error: 'Erro interno ao autenticar' },
      { status: 500 }
    )
  }
}
