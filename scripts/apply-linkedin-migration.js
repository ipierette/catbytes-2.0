const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  console.log('🔧 Aplicando migração para adicionar token_expires_at...\n')

  try {
    // Adicionar coluna token_expires_at
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE linkedin_settings
          ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Bearer';
      `
    })

    if (alterError) {
      console.log('⚠️  Não foi possível adicionar colunas via RPC, tentando com UPDATE direto...')
      console.log('Erro:', alterError.message)
    }

    // Atualizar data de expiração
    const { data, error: updateError } = await supabase
      .from('linkedin_settings')
      .update({
        token_expires_at: '2026-01-12T00:00:00Z',
        token_type: 'Bearer'
      })
      .eq('id', 1)
      .select()

    if (updateError) {
      console.error('❌ Erro ao atualizar settings:', updateError)
      return
    }

    console.log('✅ Migração aplicada com sucesso!')
    console.log('📊 Settings atualizadas:', data)

  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error)
  }
}

applyMigration()
