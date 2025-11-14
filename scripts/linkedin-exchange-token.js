#!/usr/bin/env node

/**
 * Script para trocar o código OAuth por Access Token
 * 
 * USO: node scripts/linkedin-exchange-token.js [CÓDIGO]
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const code = process.argv[2]

if (!code) {
  console.error('❌ Você precisa fornecer o código OAuth!')
  console.log('\n💡 USO:')
  console.log('   node scripts/linkedin-exchange-token.js [CÓDIGO]')
  console.log('\n📋 EXEMPLO:')
  console.log('   node scripts/linkedin-exchange-token.js AQVx...')
  process.exit(1)
}

async function exchangeToken() {
  console.log('\n🔄 Trocando código por Access Token...\n')

  try {
    // 1. Trocar código por token
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI
    })

    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao trocar código: ${response.status} - ${error}`)
    }

    const tokenData = await response.json()

    console.log('✅ Token obtido com sucesso!')
    console.log('\n📋 Detalhes do Token:')
    console.log(`   Access Token: ${tokenData.access_token.substring(0, 30)}...`)
    console.log(`   Expires In: ${tokenData.expires_in} segundos (${Math.floor(tokenData.expires_in / 86400)} dias)`)
    console.log(`   Scope: ${tokenData.scope}`)

    // 2. Buscar informações do usuário com /userinfo
    console.log('\n🔍 Buscando informações do perfil...\n')

    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    let personUrn = null

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      console.log('✅ Informações do usuário:')
      console.log(`   Nome: ${userInfo.name}`)
      console.log(`   Email: ${userInfo.email}`)
      console.log(`   Sub (Person ID): ${userInfo.sub}`)
      
      personUrn = `urn:li:person:${userInfo.sub}`
      console.log(`   Person URN: ${personUrn}`)
    } else {
      console.log('⚠️  /userinfo não disponível, tentando /v2/me...')
      
      const meResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'LinkedIn-Version': '202405'
        }
      })

      if (meResponse.ok) {
        const meData = await meResponse.json()
        personUrn = meData.id
        console.log(`   Person URN (via /me): ${personUrn}`)
        console.log('   ⚠️  ATENÇÃO: Este URN pode estar no formato errado (vanity name)')
        console.log('   💡 Recomendado: Usar /userinfo com scope openid+profile')
      }
    }

    // 3. Buscar organizações
    console.log('\n🏢 Buscando organizações...\n')

    const orgsResponse = await fetch(
      `https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(localizedName,vanityName)))`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'LinkedIn-Version': '202405'
        }
      }
    )

    let organizationUrn = null

    if (orgsResponse.ok) {
      const orgsData = await orgsResponse.json()
      if (orgsData.elements && orgsData.elements.length > 0) {
        const org = orgsData.elements[0]
        organizationUrn = org.organization
        const orgDetails = org['organization~']
        console.log(`✅ Organização encontrada: ${orgDetails?.localizedName}`)
        console.log(`   URN: ${organizationUrn}`)
      } else {
        console.log('ℹ️  Nenhuma organização encontrada')
      }
    } else {
      console.log('⚠️  Não foi possível buscar organizações')
    }

    // 4. Calcular data de expiração
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

    // 5. Salvar no .env.local
    console.log('\n💾 Salvando no .env.local...\n')

    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = fs.readFileSync(envPath, 'utf8')

    const updates = {
      LINKEDIN_ACCESS_TOKEN: tokenData.access_token,
      LINKEDIN_PERSON_URN: personUrn || '',
      LINKEDIN_ORGANIZATION_URN: organizationUrn || ''
    }

    for (const [key, value] of Object.entries(updates)) {
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(
          new RegExp(`${key}=.*`, 'g'),
          `${key}=${value}`
        )
      } else {
        envContent += `\n${key}=${value}`
      }
    }

    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local atualizado!')

    // 6. Salvar no banco de dados
    if (supabaseUrl && supabaseServiceKey) {
      console.log('\n💾 Salvando no banco de dados...\n')

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const { error } = await supabase
        .from('linkedin_settings')
        .upsert({
          id: 1,
          access_token: tokenData.access_token,
          person_urn: personUrn,
          organization_urn: organizationUrn,
          token_expires_at: expiresAt.toISOString(),
          token_type: 'Bearer',
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('❌ Erro ao salvar no banco:', error)
      } else {
        console.log('✅ Banco de dados atualizado!')
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('✨ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!')
    console.log('='.repeat(70))
    console.log('\n📋 Resumo:')
    console.log(`   ✅ Access Token: Salvo (expira em ${expiresAt.toLocaleDateString('pt-BR')})`)
    console.log(`   ✅ Person URN: ${personUrn || '⚠️  Não obtido'}`)
    console.log(`   ✅ Organization URN: ${organizationUrn || 'N/A'}`)
    console.log('\n🚀 Próximos passos:')
    console.log('   1. Reinicie o servidor: npm run dev')
    console.log('   2. Teste a publicação no LinkedIn')
    console.log('   3. Verifique os logs do console para debug\n')

  } catch (error) {
    console.error('\n❌ Erro:', error.message)
    console.log('\n💡 Dicas:')
    console.log('   - Verifique se o código não expirou (válido por 30 min)')
    console.log('   - Certifique-se de que os scopes estão corretos')
    console.log('   - Confirme que o produto "Sign In" está ativo no app')
    process.exit(1)
  }
}

exchangeToken()
