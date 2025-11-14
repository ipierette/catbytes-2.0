import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper para salvar credenciais sensíveis de forma segura
async function saveSecureCredential(key: string, value: string) {
  try {
    const { data: existing } = await supabase
      .from('secure_credentials')
      .select('id')
      .eq('key', key)
      .single()

    if (existing) {
      await supabase
        .from('secure_credentials')
        .update({
          value: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('secure_credentials')
        .insert({
          key: key,
          value: value,
          updated_at: new Date().toISOString()
        })
    }
    console.log(`✅ Secure credential saved: ${key}`)
  } catch (error) {
    console.error(`❌ Error saving secure credential ${key}:`, error)
  }
}

// Helper para buscar credencial segura
async function getSecureCredential(key: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('secure_credentials')
      .select('value')
      .eq('key', key)
      .single()
    
    return data?.value || null
  } catch (error) {
    return null
  }
}

// Helper para extrair data de expiração do .env.local
function getTokenExpiryFromEnv(): { linkedin: string | null; instagram: string | null } {
  // LinkedIn expira em 12/01/2026 (do comentário no .env.local)
  const linkedinExpiry = '2026-01-12T00:00:00.000Z' // 12/01/2026
  
  // Instagram - calcular baseado no token atual (60 dias de vida típica)
  // Você pode atualizar isso manualmente quando renovar
  const instagramExpiry = null // Defina quando tiver a data
  
  return {
    linkedin: linkedinExpiry,
    instagram: instagramExpiry
  }
}

// GET - Buscar configurações
export async function GET() {
  try {
    // Buscar tokens salvos de forma segura
    const linkedinToken = await getSecureCredential('linkedin_access_token') || process.env.LINKEDIN_ACCESS_TOKEN || ''
    const linkedinTokenExpiry = await getSecureCredential('linkedin_token_expiry')
    const instagramToken = await getSecureCredential('instagram_access_token') || process.env.INSTAGRAM_ACCESS_TOKEN || ''
    const instagramTokenExpiry = await getSecureCredential('instagram_token_expiry')

    // Pegar datas de expiração do .env se não estiverem no banco
    const envExpiry = getTokenExpiryFromEnv()
    const finalLinkedinExpiry = linkedinTokenExpiry || envExpiry.linkedin
    const finalInstagramExpiry = instagramTokenExpiry || envExpiry.instagram

    // Configurações padrão
    const defaultSettings = {
      automation: {
        blogGeneration: true,
        instagramGeneration: true,
        autoPublishing: true,
        batchSize: 10
      },
      api: {
        openaiKey: process.env.OPENAI_API_KEY || '',
        instagramToken: instagramToken,
        instagramTokenExpiryDate: finalInstagramExpiry || undefined,
        linkedinToken: linkedinToken,
        linkedinTokenExpiryDate: finalLinkedinExpiry || undefined,
        emailService: true,
        databaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      },
      content: {
        blogLanguages: ['pt-BR', 'en-US'],
        instagramNiches: ['advogados', 'medicos', 'terapeutas', 'nutricionistas'],
        defaultAuthor: 'Izadora Cury Pierette',
        contentTone: 'professional' as const
      },
      notifications: {
        emailAlerts: true,
        errorNotifications: true,
        successNotifications: false,
        dailyReports: true
      }
    }

    // Se Supabase não estiver configurado, retornar padrão
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: true,
        settings: defaultSettings,
        isDefault: true
      })
    }

    // Buscar configurações do banco
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching settings:', error)
      // Retornar padrão mesmo com erro
      return NextResponse.json({
        success: true,
        settings: defaultSettings,
        isDefault: true
      })
    }

    // Se não existir, retornar configurações padrão
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: defaultSettings,
        isDefault: true
      })
    }

    // Mesclar configurações do banco com tokens do banco seguro
    const mergedSettings = {
      ...settings.config,
      api: {
        ...settings.config.api,
        instagramToken: instagramToken,
        instagramTokenExpiryDate: finalInstagramExpiry || settings.config.api?.instagramTokenExpiryDate,
        linkedinToken: linkedinToken,
        linkedinTokenExpiryDate: finalLinkedinExpiry || settings.config.api?.linkedinTokenExpiryDate
      }
    }

    return NextResponse.json({
      success: true,
      settings: mergedSettings,
      isDefault: false
    })
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    
    // Retornar padrão em caso de erro
    return NextResponse.json({
      success: true,
      settings: {
        automation: {
          blogGeneration: true,
          instagramGeneration: true,
          autoPublishing: true,
          batchSize: 10
        },
        api: {
          openaiKey: '',
          instagramToken: '',
          linkedinToken: '',
          emailService: true,
          databaseUrl: ''
        },
        content: {
          blogLanguages: ['pt-BR', 'en-US'],
          instagramNiches: ['advogados', 'medicos', 'terapeutas', 'nutricionistas'],
          defaultAuthor: 'Izadora Cury Pierette',
          contentTone: 'professional' as const
        },
        notifications: {
          emailAlerts: true,
          errorNotifications: true,
          successNotifications: false,
          dailyReports: true
        }
      },
      isDefault: true
    })
  }
}

// POST - Salvar configurações
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar estrutura básica
    if (!body.automation || !body.content || !body.notifications) {
      return NextResponse.json({
        success: false,
        error: 'Estrutura de configurações inválida'
      }, { status: 400 })
    }

    // Verificar se já existe registro
    const { data: existing } = await supabase
      .from('admin_settings')
      .select('id')
      .single()

    let result

    if (existing) {
      // Atualizar existente
      result = await supabase
        .from('admin_settings')
        .update({
          config: body,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Criar novo
      result = await supabase
        .from('admin_settings')
        .insert({
          config: body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving settings:', result.error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar configurações'
      }, { status: 500 })
    }

    // Atualizar configurações relacionadas
    await updateRelatedSettings(body)

    return NextResponse.json({
      success: true,
      settings: result.data.config,
      message: 'Configurações salvas com sucesso!'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Atualizar configurações relacionadas em outras tabelas
async function updateRelatedSettings(settings: any) {
  try {
    // Salvar tokens sensíveis de forma segura (separado das config gerais)
    if (settings.api) {
      // Salvar token do LinkedIn
      if (settings.api.linkedinToken) {
        await saveSecureCredential('linkedin_access_token', settings.api.linkedinToken)
      }
      if (settings.api.linkedinTokenExpiryDate) {
        await saveSecureCredential('linkedin_token_expiry', settings.api.linkedinTokenExpiryDate)
      }

      // Salvar token do Instagram
      if (settings.api.instagramToken) {
        await saveSecureCredential('instagram_access_token', settings.api.instagramToken)
      }
      if (settings.api.instagramTokenExpiryDate) {
        await saveSecureCredential('instagram_token_expiry', settings.api.instagramTokenExpiryDate)
      }
    }

    // Atualizar instagram_settings (controla geração automática de posts)
    if (settings.automation?.instagramGeneration !== undefined) {
      const { data: existing } = await supabase
        .from('instagram_settings')
        .select('id')
        .eq('key', 'auto_generation_enabled')
        .single()

      if (existing) {
        await supabase
          .from('instagram_settings')
          .update({
            value: settings.automation.instagramGeneration ? 'true' : 'false',
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('instagram_settings')
          .insert({
            key: 'auto_generation_enabled',
            value: settings.automation.instagramGeneration ? 'true' : 'false',
            updated_at: new Date().toISOString()
          })
      }
      
      console.log(`✅ Instagram auto-generation: ${settings.automation.instagramGeneration ? 'ENABLED' : 'DISABLED'}`)
    }

    // Atualizar batchSize do Instagram
    if (settings.automation?.batchSize) {
      const { data: existing } = await supabase
        .from('instagram_settings')
        .select('id')
        .eq('key', 'batch_size')
        .single()

      if (existing) {
        await supabase
          .from('instagram_settings')
          .update({
            value: settings.automation.batchSize.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('instagram_settings')
          .insert({
            key: 'batch_size',
            value: settings.automation.batchSize.toString(),
            updated_at: new Date().toISOString()
          })
      }
      
      console.log(`✅ Instagram batch size: ${settings.automation.batchSize}`)
    }

    // Atualizar automation_settings (controla blog generation se implementado)
    if (settings.automation?.blogGeneration !== undefined) {
      const { data: existing } = await supabase
        .from('automation_settings')
        .select('id')
        .single()

      if (existing) {
        await supabase
          .from('automation_settings')
          .update({
            auto_generation_enabled: settings.automation.blogGeneration,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('automation_settings')
          .insert({
            auto_generation_enabled: settings.automation.blogGeneration,
            updated_at: new Date().toISOString()
          })
      }
      
      console.log(`✅ Blog auto-generation: ${settings.automation.blogGeneration ? 'ENABLED' : 'DISABLED'}`)
    }
  } catch (error) {
    console.error('Error updating related settings:', error)
  }
}
