import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('📤 [UPLOAD API] === INICIANDO UPLOAD ===')

    // Verificar autenticação via JWT cookie (igual ao verify endpoint)
    const adminToken = request.cookies.get('admin_token')?.value
    
    if (!adminToken) {
      console.error('❌ [UPLOAD API] Cookie ausente')
      return NextResponse.json(
        { error: 'Não autenticado. Faça login primeiro.' },
        { status: 401 }
      )
    }

    // Verificar JWT
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this')
      await jwtVerify(adminToken, JWT_SECRET)
      console.log('✅ [UPLOAD API] Admin autenticado via JWT')
    } catch (jwtError) {
      console.error('❌ [UPLOAD API] JWT inválido:', jwtError)
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Faça login novamente.' },
        { status: 401 }
      )
    }

    // Criar client com SERVICE_ROLE_KEY (BYPASS RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse do formData
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    console.log('📤 [UPLOAD API] Arquivo:', file.name, file.type, file.size)

    // Gerar nome único
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `textonly/${fileName}`

    console.log('📤 [UPLOAD API] Caminho:', filePath)

    // Converter File para ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload usando SERVICE_ROLE (BYPASS RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('instagram-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ [UPLOAD API] Erro no upload:', error)
      throw error
    }

    console.log('✅ [UPLOAD API] Upload bem-sucedido:', data.path)

    // Gerar URL pública
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('instagram-images')
      .getPublicUrl(data.path)

    console.log('✅ [UPLOAD API] URL pública:', publicUrl)

    return NextResponse.json({
      success: true,
      path: data.path,
      publicUrl
    })

  } catch (error: any) {
    console.error('❌ [UPLOAD API] Erro geral:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao fazer upload',
        details: error
      },
      { status: 500 }
    )
  }
}
