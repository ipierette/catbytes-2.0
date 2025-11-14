#!/usr/bin/env node

/**
 * Script para verificar e atualizar token LinkedIn do Vercel para o banco
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAndSync() {
  console.log('🔍 Verificando tokens do LinkedIn...\n')

  // 1. Verificar variáveis de ambiente
  const envToken = process.env.LINKEDIN_ACCESS_TOKEN
  const envPersonUrn = process.env.LINKEDIN_PERSON_URN
  const envOrgUrn = process.env.LINKEDIN_ORGANIZATION_URN
  const envExpiresAt = process.env.LINKEDIN_TOKEN_EXPIRES_AT

  console.log('📋 Variáveis de Ambiente (.env.local):')
  console.log('  - Token:', envToken ? `${envToken.substring(0, 15)}...` : 'AUSENTE')
  console.log('  - Person URN:', envPersonUrn || 'AUSENTE')
  console.log('  - Organization URN:', envOrgUrn || 'AUSENTE')
  console.log('  - Expira em:', envExpiresAt || 'AUSENTE')
  console.log()

  // 2. Verificar banco de dados
  const { data: dbSettings, error } = await supabase
    .from('linkedin_settings')
    .select('*')
    .single()

  if (error) {
    console.error('❌ Erro ao buscar do banco:', error.message)
    return
  }

  console.log('💾 Banco de Dados (Supabase):')
  console.log('  - Token:', dbSettings.access_token ? `${dbSettings.access_token.substring(0, 15)}...` : 'AUSENTE')
  console.log('  - Person URN:', dbSettings.person_urn || 'AUSENTE')
  console.log('  - Organization URN:', dbSettings.organization_urn || 'AUSENTE')
  console.log('  - Expira em:', dbSettings.expires_at || 'AUSENTE')
  console.log('  - Última atualização:', dbSettings.updated_at)
  console.log()

  // 3. Verificar se estão sincronizados
  const needsSync = 
    envToken && 
    envToken !== 'PENDING_OAUTH' &&
    envToken !== dbSettings.access_token

  if (needsSync) {
    console.log('⚠️  DESSINCRONIA DETECTADA!')
    console.log('   O token no .env.local é diferente do banco.\n')
    
    // Perguntar se quer sincronizar
    console.log('🔄 Deseja atualizar o banco com os dados do .env.local? (y/n)')
    
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('> ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🔄 Atualizando banco de dados...')
        
        const { error: updateError } = await supabase
          .from('linkedin_settings')
          .update({
            access_token: envToken,
            person_urn: envPersonUrn || dbSettings.person_urn,
            organization_urn: envOrgUrn || dbSettings.organization_urn,
            expires_at: envExpiresAt || dbSettings.expires_at,
            updated_at: new Date().toISOString()
          })
          .eq('id', dbSettings.id)

        if (updateError) {
          console.error('❌ Erro ao atualizar:', updateError.message)
        } else {
          console.log('✅ Banco atualizado com sucesso!')
          console.log('\n🧪 Testando chamada à API...')
          await testApi(envToken)
        }
      } else {
        console.log('\n❌ Atualização cancelada')
      }
      rl.close()
    })
  } else if (envToken === dbSettings.access_token) {
    console.log('✅ Token sincronizado entre .env.local e banco!')
    
    if (envToken && envToken !== 'PENDING_OAUTH') {
      console.log('\n🧪 Testando chamada à API...')
      await testApi(envToken)
    }
  } else {
    console.log('⚠️  .env.local não tem token válido')
    console.log('   Banco tem:', dbSettings.access_token ? 'TOKEN' : 'PENDING_OAUTH')
  }
}

async function testApi(token) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '202405'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ API funcionando!')
      console.log(`   Nome: ${data.localizedFirstName} ${data.localizedLastName}`)
      console.log(`   ID: ${data.id}`)
    } else {
      const error = await response.json()
      console.error('❌ Erro na API:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Mensagem:`, error)
      
      if (response.status === 401) {
        console.log('\n💡 Token inválido ou expirado. Execute:')
        console.log('   npm run linkedin:renew-token')
      }
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message)
  }
}

checkAndSync()
