#!/usr/bin/env node

/**
 * Script para atualizar data de expiração do token LinkedIn
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateExpiry() {
  // Data de expiração: 12/01/2026
  const expiresAt = new Date('2026-01-12T23:59:59Z')

  console.log('🔄 Atualizando data de expiração do token LinkedIn...\n')
  console.log('Data de expiração:', expiresAt.toLocaleString('pt-BR'))

  const { data, error } = await supabase
    .from('linkedin_settings')
    .update({
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }

  console.log('\n✅ Data de expiração atualizada com sucesso!')
  console.log('\n📋 Settings atualizados:')
  console.log('  - Token:', data.access_token ? `${data.access_token.substring(0, 15)}...` : 'AUSENTE')
  console.log('  - Person URN:', data.person_urn)
  console.log('  - Organization URN:', data.organization_urn)
  console.log('  - Expira em:', new Date(data.expires_at).toLocaleString('pt-BR'))
  console.log('  - Dias restantes:', Math.floor((new Date(data.expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
}

updateExpiry()
