import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * API para upload e processamento de vídeos
 * POST /api/vlog/upload
 * 
 * Body: FormData com:
 *   - file: File (vídeo até 10MB)
 *   - description: string (descrição inicial do vídeo)
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userDescription = formData.get('description') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum vídeo fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato de vídeo inválido. Use MP4, MOV, AVI ou WEBM' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Vídeo muito grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    console.log('[Vlog Upload] Processando vídeo:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `vlog-${timestamp}.${ext}`
    const filepath = `vlogs/${filename}`

    // Upload para Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filepath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('[Vlog Upload] Erro no upload:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload do vídeo' },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filepath)

    const videoUrl = urlData.publicUrl

    console.log('[Vlog Upload] ✅ Vídeo enviado:', videoUrl)

    // Melhorar descrição com IA
    const improvedDescription = await improveDescription(userDescription)

    // Salvar no banco de dados
    const { data: vlogData, error: dbError } = await supabase
      .from('vlogs')
      .insert({
        filename,
        video_url: videoUrl,
        original_description: userDescription,
        improved_description: improvedDescription,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Vlog Upload] Erro ao salvar no banco:', dbError)
      // Tentar deletar o vídeo do storage
      await supabase.storage.from('videos').remove([filepath])
      
      return NextResponse.json(
        { error: 'Erro ao salvar informações do vídeo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      vlog: {
        id: vlogData.id,
        videoUrl,
        originalDescription: userDescription,
        improvedDescription,
        filename
      }
    })

  } catch (error) {
    console.error('[Vlog Upload] Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar vídeo',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

/**
 * Melhora a descrição do vídeo usando IA
 */
async function improveDescription(userDescription: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Você é um social media manager profissional. Melhore esta descrição de vídeo para redes sociais:

DESCRIÇÃO ORIGINAL:
"${userDescription}"

OBJETIVO:
Criar uma descrição profissional, engajadora e otimizada para:
- Instagram Reels
- Instagram Feed
- LinkedIn

REGRAS:
- Tom profissional mas acessível
- Destaque o valor/benefício do conteúdo
- Use emojis relevantes (3-5)
- Inclua call-to-action
- Máximo 2200 caracteres (limite do Instagram)
- Adicione 3-5 hashtags relevantes ao final

ESTRUTURA:
1. Hook inicial (1 linha impactante)
2. Contexto/conteúdo do vídeo (2-3 linhas)
3. Valor/aprendizado (1-2 linhas)
4. Call-to-action
5. Hashtags

Retorne APENAS a descrição melhorada, sem título ou formatação extra.
`

    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (error) {
    console.error('[Improve Description] Erro:', error)
    // Retornar descrição original em caso de erro
    return userDescription
  }
}
