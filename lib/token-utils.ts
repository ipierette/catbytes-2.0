/**
 * Utilitários para gerar e renovar tokens de API
 * Instagram e LinkedIn tokens expiram em 60 dias
 */

interface TokenInfo {
  token: string
  expiresAt: Date
  platform: 'instagram' | 'linkedin'
  status: 'valid' | 'expiring' | 'expired'
  daysRemaining: number
}

/**
 * Instruções para gerar novo token do Instagram
 */
export const getInstagramTokenInstructions = () => {
  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || 'SEU_CLIENT_ID'
  const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL + '/admin/settings/callback')
  
  return {
    step1: {
      title: "Passo 1: Autorização do Usuário",
      description: "Acesse esta URL no navegador para autorizar:",
      url: `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`,
      note: "Você será redirecionado de volta com um código de autorização"
    },
    step2: {
      title: "Passo 2: Trocar código por token",
      description: "Com o código recebido, faça uma requisição POST para:",
      endpoint: "https://api.instagram.com/oauth/access_token",
      method: "POST",
      parameters: {
        client_id: clientId,
        client_secret: "SEU_CLIENT_SECRET",
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: "CODIGO_RECEBIDO_NO_PASSO_1"
      }
    },
    step3: {
      title: "Passo 3: Converter para token de longa duração",
      description: "Troque o token por um de 60 dias:",
      endpoint: "https://graph.instagram.com/access_token",
      method: "GET",
      parameters: {
        grant_type: "ig_exchange_token",
        client_secret: "SEU_CLIENT_SECRET",
        access_token: "TOKEN_DO_PASSO_2"
      }
    }
  }
}

/**
 * Instruções para gerar novo token do LinkedIn
 */
export const getLinkedInTokenInstructions = () => {
  const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'SEU_CLIENT_ID'
  const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL + '/admin/settings/linkedin-callback')
  const state = Math.random().toString(36).substring(7) // Estado aleatório para segurança
  
  return {
    step1: {
      title: "Passo 1: Autorização do Usuário",
      description: "Acesse esta URL no navegador para autorizar:",
      url: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=r_liteprofile%20r_emailaddress%20w_member_social`,
      note: "Você será redirecionado de volta com um código de autorização"
    },
    step2: {
      title: "Passo 2: Trocar código por token",
      description: "Com o código recebido, faça uma requisição POST para:",
      endpoint: "https://www.linkedin.com/oauth/v2/accessToken",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      parameters: {
        grant_type: "authorization_code",
        code: "CODIGO_RECEBIDO_NO_PASSO_1",
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: "SEU_CLIENT_SECRET"
      },
      note: "O token do LinkedIn tem validade de 60 dias"
    }
  }
}

/**
 * Verifica status de um token baseado na data de expiração
 */
export const checkTokenStatus = (expiryDate: string | null): TokenInfo['status'] => {
  if (!expiryDate) return 'expired'
  
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) return 'expired'
  if (diffDays <= 7) return 'expiring'
  return 'valid'
}

/**
 * Calcula dias restantes para expiração
 */
export const getDaysRemaining = (expiryDate: string | null): number => {
  if (!expiryDate) return 0
  
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

/**
 * Gera nova data de expiração (60 dias a partir de hoje)
 */
export const generateExpiryDate = (): string => {
  const date = new Date()
  date.setDate(date.getDate() + 60)
  return date.toISOString()
}

/**
 * Cria lembretes automáticos para renovação de tokens
 */
export const createTokenReminder = async (platform: 'instagram' | 'linkedin', expiryDate: string) => {
  try {
    // Aqui você pode implementar lógica para:
    // 1. Salvar lembrete no banco
    // 2. Agendar email de notificação
    // 3. Criar task automática
    
    const response = await fetch('/api/admin/token-reminders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform,
        expiryDate,
        reminderDays: [30, 14, 7, 3, 1] // Dias antes da expiração para enviar lembretes
      })
    })
    
    return response.json()
  } catch (error) {
    console.error('Erro ao criar lembrete:', error)
    return { success: false, error: 'Erro ao criar lembrete' }
  }
}

/**
 * Template de email para lembrete de token
 */
export const getTokenReminderEmailTemplate = (
  platform: string, 
  daysRemaining: number
) => {
  const platformName = platform === 'instagram' ? 'Instagram' : 'LinkedIn'
  const urgency = daysRemaining <= 3 ? 'URGENTE' : daysRemaining <= 7 ? 'ATENÇÃO' : 'AVISO'
  
  return {
    subject: `${urgency}: Token ${platformName} expira em ${daysRemaining} dias`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${daysRemaining <= 3 ? '#fee2e2' : '#fef3c7'}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: ${daysRemaining <= 3 ? '#dc2626' : '#d97706'};">
            ⚠️ Token ${platformName} Expirando
          </h2>
        </div>
        
        <p>Olá,</p>
        
        <p>Seu token de acesso do <strong>${platformName}</strong> expirará em <strong>${daysRemaining} dias</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3>⏰ Detalhes:</h3>
          <ul style="margin: 10px 0;">
            <li><strong>Plataforma:</strong> ${platformName}</li>
            <li><strong>Dias restantes:</strong> ${daysRemaining}</li>
            <li><strong>Status:</strong> ${daysRemaining <= 3 ? 'Crítico' : 'Atenção'}</li>
          </ul>
        </div>
        
        <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3>🔧 Ação Necessária:</h3>
          <ol>
            <li>Acesse o painel admin em <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/settings">Configurações</a></li>
            <li>Siga as instruções para gerar um novo token do ${platformName}</li>
            <li>Atualize o token no sistema</li>
            <li>Confirme a renovação (60 dias)</li>
          </ol>
        </div>
        
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          Este é um lembrete automático do sistema CatBytes.<br>
          Para parar esses lembretes, renove o token ou desative nas configurações.
        </p>
      </div>
    `
  }
}

export default {
  getInstagramTokenInstructions,
  getLinkedInTokenInstructions,
  checkTokenStatus,
  getDaysRemaining,
  generateExpiryDate,
  createTokenReminder,
  getTokenReminderEmailTemplate
}