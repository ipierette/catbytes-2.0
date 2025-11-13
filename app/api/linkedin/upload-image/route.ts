import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

/**
 * API para fazer upload de imagens temporárias para posts do LinkedIn
 * Salva na pasta public/temp/linkedin/
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WEBP' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Gerar nome único
    const ext = file.name.split('.').pop()
    const filename = `${uuidv4()}.${ext}`
    const filepath = path.join(process.cwd(), 'public', 'temp', 'linkedin', filename)

    // Criar buffer do arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Salvar arquivo
    await writeFile(filepath, buffer)

    const publicUrl = `/temp/linkedin/${filename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload' },
      { status: 500 }
    )
  }
}
