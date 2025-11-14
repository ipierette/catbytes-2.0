#!/usr/bin/env node

/**
 * Script de diagnóstico do LinkedIn
 * Verifica configurações e testa formato dos URNs
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnose() {
  console.log('🔍 Diagnóstico LinkedIn\n')

  try {
    // 1. Buscar configurações do banco
    const { data, error } = await supabase
      .from('linkedin_settings')
      .select('*')
      .single()

    if (error || !data) {
      console.error('❌ Erro ao buscar configurações:', error)
      return
    }

    console.log('📋 Configurações atuais:\n')
    console.log('✅ Access Token:', data.access_token ? 
      `${data.access_token.substring(0, 20)}... (${data.access_token.length} caracteres)` : 
      '❌ NÃO CONFIGURADO')
    
    console.log('✅ Person URN:', data.person_urn || '❌ NÃO CONFIGURADO')
    console.log('✅ Organization URN:', data.organization_urn || '❌ NÃO CONFIGURADO')
    console.log('✅ Expira em:', data.token_expires_at ? 
      new Date(data.token_expires_at).toLocaleString('pt-BR') : 
      '❌ NÃO CONFIGURADO')

    // 2. Verificar formato dos URNs
    console.log('\n🔍 Validação de formato:\n')

    if (data.person_urn) {
      const personValid = data.person_urn.startsWith('urn:li:person:')
      console.log(`${personValid ? '✅' : '⚠️'} Person URN formato:`, data.person_urn)
      if (!personValid) {
        console.log('   Deve começar com: urn:li:person:')
      }
    }

    if (data.organization_urn) {
      const orgValid = data.organization_urn.startsWith('urn:li:organization:')
      console.log(`${orgValid ? '✅' : '⚠️'} Organization URN formato:`, data.organization_urn)
      if (!orgValid) {
        console.log('   Deve começar com: urn:li:organization:')
      }
    }

    // 3. Verificar expiração do token
    console.log('\n⏰ Status do token:\n')
    
    if (data.token_expires_at) {
      const expiresAt = new Date(data.token_expires_at)
      const now = new Date()
      const daysRemaining = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24))
      
      if (expiresAt > now) {
        console.log(`✅ Token válido por mais ${daysRemaining} dias`)
      } else {
        console.log('❌ Token EXPIRADO!')
      }
    } else {
      console.log('⚠️ Data de expiração não configurada')
    }

    // 4. Testar conexão com API do LinkedIn (apenas validação)
    console.log('\n🌐 Testando API do LinkedIn...\n')

    const testResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'LinkedIn-Version': '202405'
      }
    })

    if (testResponse.ok) {
      const userInfo = await testResponse.json()
      console.log('✅ API do LinkedIn respondendo:')
      console.log('   Nome:', userInfo.name || 'N/A')
      console.log('   Email:', userInfo.email || 'N/A')
      console.log('   Sub:', userInfo.sub || 'N/A')
    } else {
      const errorText = await testResponse.text()
      console.log(`❌ Erro na API (${testResponse.status}):`, errorText)
    }

    console.log('\n✅ Diagnóstico completo!\n')

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error)
  }
}

diagnose()
