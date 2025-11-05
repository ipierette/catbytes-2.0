/**
 * Instagram Settings - Configurações do sistema
 * Controla geração automática de posts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * TABELA A CRIAR NO SUPABASE:
 * 
 * CREATE TABLE instagram_settings (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   setting_key VARCHAR(100) UNIQUE NOT NULL,
 *   setting_value TEXT NOT NULL,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Inserir configuração inicial
 * INSERT INTO instagram_settings (setting_key, setting_value)
 * VALUES ('auto_generation_enabled', 'true');
 */

export interface InstagramSettings {
  autoGenerationEnabled: boolean
  lastGenerationDate?: string
}

export const instagramSettings = {
  /**
   * Verifica se a geração automática está habilitada
   */
  async isAutoGenerationEnabled(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('instagram_settings')
        .select('setting_value')
        .eq('setting_key', 'auto_generation_enabled')
        .single()

      if (error) {
        console.error('Error fetching auto_generation_enabled:', error)
        return true // Default: habilitado
      }

      return data.setting_value === 'true'
    } catch (error) {
      console.error('Error checking auto generation:', error)
      return true
    }
  },

  /**
   * Ativa ou desativa a geração automática
   */
  async setAutoGeneration(enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('instagram_settings')
      .upsert({
        setting_key: 'auto_generation_enabled',
        setting_value: enabled ? 'true' : 'false',
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error updating auto_generation_enabled:', error)
      throw error
    }

    console.log(`Auto generation ${enabled ? 'ENABLED' : 'DISABLED'}`)
  },

  /**
   * Busca todas as configurações
   */
  async getAll(): Promise<InstagramSettings> {
    const { data } = await supabase
      .from('instagram_settings')
      .select('*')

    const settings: InstagramSettings = {
      autoGenerationEnabled: true
    }

    if (data) {
      data.forEach(item => {
        if (item.setting_key === 'auto_generation_enabled') {
          settings.autoGenerationEnabled = item.setting_value === 'true'
        }
        if (item.setting_key === 'last_generation_date') {
          settings.lastGenerationDate = item.setting_value
        }
      })
    }

    return settings
  },

  /**
   * Registra última data de geração
   */
  async updateLastGenerationDate(): Promise<void> {
    await supabase
      .from('instagram_settings')
      .upsert({
        setting_key: 'last_generation_date',
        setting_value: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
  }
}
