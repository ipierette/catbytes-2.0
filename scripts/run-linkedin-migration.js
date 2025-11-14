#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  console.log('🔄 Atualizando data de expiração do token LinkedIn...\n')

  try {
    // Atualizar data de expiração diretamente
    // (a coluna expires_at já deve existir ou será criada pela migration SQL)
    const { data, error } = await supabase
      .from('linkedin_settings')
      .update({
        expires_at: '2026-01-12T23:59:59Z'
      })
      .neq('access_token', 'PENDING_OAUTH')
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao atualizar:', error.message)
      
      // Se o erro é porque a coluna não existe, instruir a criar manualmente
      if (error.message.includes('expires_at')) {
        console.log('\n💡 A coluna expires_at não existe.')
        console.log('   Execute este SQL no Supabase Dashboard > SQL Editor:')
        console.log('\n   ALTER TABLE linkedin_settings ADD COLUMN expires_at TIMESTAMPTZ;')
        console.log('   UPDATE linkedin_settings SET expires_at = \'2026-01-12 23:59:59+00\';')
      }
      return
    }

    console.log('✅ Data de expiração atualizada!')
    console.log('\n📋 Settings finais:')
    console.log('  - Token:', data.access_token ? `${data.access_token.substring(0, 15)}...` : 'AUSENTE')
    console.log('  - Person URN:', data.person_urn)
    console.log('  - Organization URN:', data.organization_urn)
    console.log('  - Expira em:', data.expires_at ? new Date(data.expires_at).toLocaleString('pt-BR') : 'AUSENTE')
    
    if (data.expires_at) {
      const days = Math.floor((new Date(data.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
      console.log(`  - Dias restantes: ${days}`)
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

runMigration()
