#!/usr/bin/env node

/**
 * Script para salvar token no banco após OAuth bem-sucedido
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN
const personUrn = process.env.LINKEDIN_PERSON_URN
const organizationUrn = process.env.LINKEDIN_ORGANIZATION_URN

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis do Supabase não configuradas')
  process.exit(1)
}

if (!accessToken) {
  console.error('❌ LINKEDIN_ACCESS_TOKEN não encontrado no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function saveToDatabase() {
  console.log('\n💾 Salvando configurações do LinkedIn no banco...\n')

  try {
    // 1. Buscar ID existente
    const { data: existing } = await supabase
      .from('linkedin_settings')
      .select('id')
      .limit(1)
      .single()

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 59) // 59 dias

    const settings = {
      access_token: accessToken,
      person_urn: personUrn || null,
      organization_urn: organizationUrn || null,
      token_expires_at: expiresAt.toISOString(),
      token_type: 'Bearer',
      updated_at: new Date().toISOString()
    }

    let result

    if (existing?.id) {
      // UPDATE
      console.log(`📝 Atualizando registro existente (ID: ${existing.id})...`)
      result = await supabase
        .from('linkedin_settings')
        .update(settings)
        .eq('id', existing.id)
    } else {
      // INSERT
      console.log('📝 Criando novo registro...')
      result = await supabase
        .from('linkedin_settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString()
        })
    }

    if (result.error) {
      throw result.error
    }

    console.log('✅ Configurações salvas no banco com sucesso!\n')
    console.log('📋 Resumo:')
    console.log(`   Access Token: ${accessToken.substring(0, 30)}...`)
    console.log(`   Person URN: ${personUrn || 'N/A'}`)
    console.log(`   Organization URN: ${organizationUrn || 'N/A'}`)
    console.log(`   Expira em: ${expiresAt.toLocaleDateString('pt-BR')}`)
    console.log('\n✨ Pronto! Agora você pode testar a publicação no LinkedIn.')

  } catch (error) {
    console.error('❌ Erro ao salvar no banco:', error)
    process.exit(1)
  }
}

saveToDatabase()
