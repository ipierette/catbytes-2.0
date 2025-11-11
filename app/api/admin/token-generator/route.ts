import { NextRequest, NextResponse } from 'next/server'
import { 
  getInstagramTokenInstructions, 
  getLinkedInTokenInstructions,
  createTokenReminder,
  generateExpiryDate
} from '@/lib/token-utils'

// GET - Obter instruções para gerar tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro platform é obrigatório (instagram|linkedin)'
      }, { status: 400 })
    }

    let instructions
    
    if (platform === 'instagram') {
      instructions = getInstagramTokenInstructions()
    } else if (platform === 'linkedin') {
      instructions = getLinkedInTokenInstructions()
    } else {
      return NextResponse.json({
        success: false,
        error: 'Platform deve ser "instagram" ou "linkedin"'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      platform,
      instructions,
      notes: {
        tokenDuration: '60 dias',
        reminderDays: [30, 14, 7, 3, 1],
        autoReminders: true
      }
    })

  } catch (error) {
    console.error('Erro na API GET token-generator:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST - Validar e salvar novo token
export async function POST(request: NextRequest) {
  try {
    const { platform, token, autoSetExpiry = true } = await request.json()

    if (!platform || !token) {
      return NextResponse.json({
        success: false,
        error: 'Platform e token são obrigatórios'
      }, { status: 400 })
    }

    if (!['instagram', 'linkedin'].includes(platform)) {
      return NextResponse.json({
        success: false,
        error: 'Platform deve ser "instagram" ou "linkedin"'
      }, { status: 400 })
    }

    // Validar token básico (se começa com padrão esperado)
    const tokenValidation = validateTokenFormat(platform, token)
    if (!tokenValidation.valid) {
      return NextResponse.json({
        success: false,
        error: `Token inválido: ${tokenValidation.reason}`
      }, { status: 400 })
    }

    // Gerar data de expiração
    const expiryDate = autoSetExpiry ? generateExpiryDate() : null

    // Criar lembretes automáticos se data de expiração foi definida
    if (expiryDate) {
      await createTokenReminder(platform, expiryDate)
    }

    // Retornar instruções para atualizar as configurações
    return NextResponse.json({
      success: true,
      message: `Token ${platform} validado com sucesso!`,
      platform,
      token: maskToken(token),
      expiryDate,
      autoRemindersCreated: !!expiryDate,
      nextSteps: [
        `1. Copie o token: ${maskToken(token)}`,
        `2. Vá para Configurações > API`,
        `3. Cole o token no campo "${platform === 'instagram' ? 'Instagram' : 'LinkedIn'} Access Token"`,
        `4. Clique em "Definir Data de Expiração" se não foi automática`,
        `5. Salve as configurações`
      ]
    })

  } catch (error) {
    console.error('Erro na API POST token-generator:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

/**
 * Valida formato básico do token
 */
function validateTokenFormat(platform: string, token: string): { valid: boolean; reason?: string } {
  if (!token || token.length < 10) {
    return { valid: false, reason: 'Token muito curto' }
  }

  if (platform === 'instagram') {
    // Instagram tokens geralmente começam com IGQ
    if (!token.startsWith('IGQ') && !token.startsWith('EAA')) {
      return { valid: false, reason: 'Token Instagram deve começar com IGQ ou EAA' }
    }
  }

  if (platform === 'linkedin') {
    // LinkedIn tokens geralmente começam com AQV, AQW, AQX
    if (!token.startsWith('AQ') || token.length <= 50) {
      return { valid: false, reason: 'Token LinkedIn suspeito - verifique o formato' }
    }
  }

  return { valid: true }
}

/**
 * Mascarar token para exibição segura
 */
function maskToken(token: string): string {
  if (token.length <= 10) return token
  
  const start = token.substring(0, 6)
  const end = token.substring(token.length - 4)
  const middle = '*'.repeat(Math.min(12, token.length - 10))
  
  return `${start}${middle}${end}`
}