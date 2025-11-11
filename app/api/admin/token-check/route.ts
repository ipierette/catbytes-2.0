import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Verificar status de todos os tokens (chamado manualmente)
export async function GET() {
  try {
    console.log('🔍 [TOKEN-CHECK] Verificando status dos tokens...')

    // Buscar configurações atuais
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('config')
      .single()

    if (settingsError || !settings) {
      console.log('⚠️ [TOKEN-CHECK] Configurações não encontradas')
      return NextResponse.json({
        success: true,
        tokens: [],
        message: 'Nenhuma configuração de token encontrada'
      })
    }

    const config = settings.config
    const tokenStatus = []
    const alerts = []

    // Verificar token Instagram
    if (config?.api?.instagramToken && config?.api?.instagramTokenExpiryDate) {
      const daysRemaining = calculateDaysRemaining(config.api.instagramTokenExpiryDate)
      const status = getTokenStatus(daysRemaining)
      
      tokenStatus.push({
        platform: 'instagram',
        hasToken: true,
        expiryDate: config.api.instagramTokenExpiryDate,
        daysRemaining,
        status,
        needsAttention: daysRemaining <= 30
      })

      if (daysRemaining <= 30) {
        alerts.push({
          platform: 'Instagram',
          daysRemaining,
          urgency: daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : 'medium',
          message: getAlertMessage('Instagram', daysRemaining)
        })
      }
    } else {
      tokenStatus.push({
        platform: 'instagram',
        hasToken: !!config?.api?.instagramToken,
        expiryDate: null,
        daysRemaining: 0,
        status: 'missing',
        needsAttention: true
      })

      alerts.push({
        platform: 'Instagram',
        daysRemaining: 0,
        urgency: 'critical',
        message: 'Token Instagram não configurado ou sem data de expiração'
      })
    }

    // Verificar token LinkedIn
    if (config?.api?.linkedinToken && config?.api?.linkedinTokenExpiryDate) {
      const daysRemaining = calculateDaysRemaining(config.api.linkedinTokenExpiryDate)
      const status = getTokenStatus(daysRemaining)
      
      tokenStatus.push({
        platform: 'linkedin',
        hasToken: true,
        expiryDate: config.api.linkedinTokenExpiryDate,
        daysRemaining,
        status,
        needsAttention: daysRemaining <= 30
      })

      if (daysRemaining <= 30) {
        alerts.push({
          platform: 'LinkedIn',
          daysRemaining,
          urgency: daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : 'medium',
          message: getAlertMessage('LinkedIn', daysRemaining)
        })
      }
    } else {
      tokenStatus.push({
        platform: 'linkedin',
        hasToken: !!config?.api?.linkedinToken,
        expiryDate: null,
        daysRemaining: 0,
        status: 'missing',
        needsAttention: true
      })

      alerts.push({
        platform: 'LinkedIn',
        daysRemaining: 0,
        urgency: 'critical',
        message: 'Token LinkedIn não configurado ou sem data de expiração'
      })
    }

    const summary = {
      total: tokenStatus.length,
      valid: tokenStatus.filter(t => t.status === 'valid').length,
      expiring: tokenStatus.filter(t => t.status === 'expiring').length,
      expired: tokenStatus.filter(t => t.status === 'expired' || t.status === 'missing').length,
      needsAttention: alerts.length
    }

    console.log('✅ [TOKEN-CHECK] Verificação concluída:', summary)

    return NextResponse.json({
      success: true,
      summary,
      tokens: tokenStatus,
      alerts,
      lastCheck: new Date().toISOString(),
      message: `${alerts.length} token(s) precisam de atenção`
    })

  } catch (error) {
    console.error('❌ [TOKEN-CHECK] Erro na verificação:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar tokens'
    }, { status: 500 })
  }
}

// POST - Marcar verificação como realizada (para controle manual)
export async function POST(request: NextRequest) {
  try {
    const { platform, action } = await request.json()

    if (action === 'mark_checked') {
      // Salvar última verificação no localStorage do cliente
      return NextResponse.json({
        success: true,
        message: 'Verificação registrada',
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'send_reminder_email' && platform) {
      // Aqui você pode implementar envio de email de lembrete
      // Por exemplo, usando Resend ou outro serviço de email
      
      console.log(`📧 [TOKEN-CHECK] Enviando lembrete para ${platform}`)
      
      return NextResponse.json({
        success: true,
        message: `Lembrete de ${platform} enviado (implementar email aqui)`,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Ação não reconhecida'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ [TOKEN-CHECK] Erro no POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno'
    }, { status: 500 })
  }
}

function calculateDaysRemaining(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

function getTokenStatus(daysRemaining: number): string {
  if (daysRemaining <= 0) return 'expired'
  if (daysRemaining <= 7) return 'expiring'
  return 'valid'
}

function getAlertMessage(platform: string, daysRemaining: number): string {
  if (daysRemaining <= 0) {
    return `Token ${platform} EXPIRADO! Renove imediatamente.`
  }
  if (daysRemaining <= 3) {
    return `Token ${platform} expira em ${daysRemaining} dias - URGENTE!`
  }
  if (daysRemaining <= 7) {
    return `Token ${platform} expira em ${daysRemaining} dias - Renove em breve.`
  }
  return `Token ${platform} expira em ${daysRemaining} dias - Planeje a renovação.`
}