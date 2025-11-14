#!/usr/bin/env node

/**
 * Script para testar credenciais do LinkedIn
 * Verifica token, URNs e faz uma chamada de teste à API
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testLinkedInCredentials() {
  console.log('🔍 Testando credenciais do LinkedIn...\n')

  try {
    // 1. Buscar settings do banco
    const { data: settings, error } = await supabase
      .from('linkedin_settings')
      .select('*')
      .single()

    if (error) {
      console.error('❌ Erro ao buscar settings:', error.message)
      return
    }

    if (!settings) {
      console.error('❌ Nenhuma configuração encontrada no banco')
      return
    }

    console.log('📋 Settings encontrados:')
    console.log('  - Token:', settings.access_token ? `${settings.access_token.substring(0, 15)}...` : 'AUSENTE')
    console.log('  - Person URN:', settings.person_urn || 'AUSENTE')
    console.log('  - Organization URN:', settings.organization_urn || 'AUSENTE')
    console.log('  - Expira em:', settings.expires_at || 'AUSENTE')
    console.log('  - Última atualização:', settings.updated_at)
    console.log()

    // 2. Verificar expiração
    if (settings.expires_at) {
      const expiresAt = new Date(settings.expires_at)
      const now = new Date()
      const daysUntilExpiry = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24))

      if (expiresAt < now) {
        console.log('⚠️  TOKEN EXPIRADO!')
        console.log(`   Expirou em: ${expiresAt.toLocaleString('pt-BR')}`)
        console.log('   Execute: npm run linkedin:renew-token')
        console.log()
        return
      } else {
        console.log(`✅ Token válido por mais ${daysUntilExpiry} dias`)
        console.log(`   Expira em: ${expiresAt.toLocaleString('pt-BR')}`)
        console.log()
      }
    }

    // 3. Testar chamada à API do LinkedIn
    if (settings.access_token && settings.access_token !== 'PENDING_OAUTH') {
      console.log('🔄 Testando chamada à API do LinkedIn...')
      
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${settings.access_token}`,
          'LinkedIn-Version': '202405'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API funcionando!')
        console.log(`   Nome: ${data.localizedFirstName} ${data.localizedLastName}`)
        console.log(`   ID: ${data.id}`)
        console.log()
      } else {
        const error = await response.json()
        console.error('❌ Erro na API do LinkedIn:')
        console.error(`   Status: ${response.status}`)
        console.error(`   Erro:`, error)
        console.log()
        
        if (response.status === 401) {
          console.log('💡 Token parece estar inválido ou expirado')
          console.log('   Execute: npm run linkedin:renew-token')
        }
      }
    } else {
      console.log('⚠️  Token não configurado ou pendente')
      console.log('   Execute: npm run linkedin:oauth')
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testLinkedInCredentials()
