import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar configurações
export async function GET() {
  try {
    // Buscar configurações do banco
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching settings:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar configurações'
      }, { status: 500 })
    }

    // Se não existir, retornar configurações padrão
    if (!settings) {
      const defaultSettings = {
        automation: {
          blogGeneration: true,
          instagramGeneration: true,
          autoPublishing: true,
          batchSize: 10
        },
        content: {
          blogLanguages: ['pt-BR', 'en-US'],
          instagramNiches: ['advogados', 'medicos', 'terapeutas', 'nutricionistas'],
          defaultAuthor: 'Izadora Cury Pierette',
          contentTone: 'professional'
        },
        notifications: {
          emailAlerts: true,
          errorNotifications: true,
          successNotifications: false,
          dailyReports: true
        }
      }

      return NextResponse.json({
        success: true,
        settings: defaultSettings,
        isDefault: true
      })
    }

    return NextResponse.json({
      success: true,
      settings: settings.config,
      isDefault: false
    })
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
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
    // Atualizar automation_settings
    if (settings.automation) {
      await supabase
        .from('automation_settings')
        .upsert({
          id: 1,
          auto_generation_enabled: settings.automation.blogGeneration || settings.automation.instagramGeneration,
          batch_size: settings.automation.batchSize || 10,
          updated_at: new Date().toISOString()
        })
    }

    // Atualizar instagram_settings se necessário
    if (settings.automation?.instagramGeneration !== undefined) {
      await supabase
        .from('instagram_settings')
        .upsert({
          id: 1,
          auto_generation_enabled: settings.automation.instagramGeneration,
          updated_at: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Error updating related settings:', error)
  }
}
