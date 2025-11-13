#!/usr/bin/env node

/**
 * Script simplificado para obter LinkedIn URNs
 * Usa métodos alternativos se a API principal falhar
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN

if (!ACCESS_TOKEN || ACCESS_TOKEN === 'PENDING_OAUTH') {
  console.error('❌ LINKEDIN_ACCESS_TOKEN não encontrado no .env.local')
  process.exit(1)
}

console.log('🚀 Buscando LinkedIn URNs...\n')

async function testToken() {
  console.log('🔍 Testando token...')
  
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    })

    console.log('📊 Status da resposta:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na API:', errorText)
      return null
    }

    const data = await response.json()
    console.log('✅ Resposta da API:', JSON.stringify(data, null, 2))
    
    return data
  } catch (error) {
    console.error('❌ Erro ao fazer requisição:', error.message)
    return null
  }
}

async function tryShareAPI() {
  console.log('\n🔍 Tentando API de compartilhamento...')
  
  try {
    // Tentar fazer um post de teste (sem realmente publicar)
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts?action=TEST_SHARE', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author: 'urn:li:person:TEST',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: 'test' },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
      })
    })

    const errorText = await response.text()
    console.log('📊 Resposta:', errorText)
    
    // Mesmo com erro, a resposta pode conter informações úteis
    if (errorText.includes('urn:li:person:')) {
      const match = errorText.match(/urn:li:person:([A-Za-z0-9_-]+)/)
      if (match) {
        console.log('✅ Person URN encontrado no erro:', match[0])
        return match[0]
      }
    }
    
    return null
  } catch (error) {
    console.error('❌ Erro:', error.message)
    return null
  }
}

async function updateEnvFile(personUrn) {
  if (!personUrn) return
  
  console.log('\n📝 Atualizando .env.local...')
  
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = fs.readFileSync(envPath, 'utf8')

    if (envContent.includes('LINKEDIN_PERSON_URN=')) {
      envContent = envContent.replace(
        /LINKEDIN_PERSON_URN=.*/,
        `LINKEDIN_PERSON_URN=${personUrn}`
      )
    } else {
      envContent += `\nLINKEDIN_PERSON_URN=${personUrn}`
    }

    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local atualizado!')
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo:', error.message)
  }
}

async function main() {
  // Método 1: Usar API /v2/me
  const meData = await testToken()
  
  if (meData && meData.id) {
    console.log('\n✅ Person URN encontrado:', meData.id)
    await updateEnvFile(meData.id)
    
    console.log('\n' + '='.repeat(60))
    console.log('✨ SUCESSO!')
    console.log('='.repeat(60))
    console.log('\n📋 Cole este valor no .env.local:')
    console.log(`LINKEDIN_PERSON_URN=${meData.id}`)
    console.log('\n' + '='.repeat(60))
    return
  }

  // Método 2: Tentar extrair do erro da API de compartilhamento
  console.log('\n⚠️  Método 1 falhou, tentando método alternativo...')
  const urnFromError = await tryShareAPI()
  
  if (urnFromError) {
    await updateEnvFile(urnFromError)
    
    console.log('\n' + '='.repeat(60))
    console.log('✨ SUCESSO!')
    console.log('='.repeat(60))
    console.log('\n📋 Cole este valor no .env.local:')
    console.log(`LINKEDIN_PERSON_URN=${urnFromError}`)
    console.log('\n' + '='.repeat(60))
    return
  }

  // Método 3: Instrução manual
  console.log('\n' + '='.repeat(60))
  console.log('❌ NÃO FOI POSSÍVEL OBTER AUTOMATICAMENTE')
  console.log('='.repeat(60))
  console.log('\n📝 MÉTODO MANUAL:')
  console.log('\n1️⃣  Acesse: https://www.linkedin.com/in/me/')
  console.log('\n2️⃣  Na URL, você verá algo como:')
  console.log('   https://www.linkedin.com/in/seu-nome-12345abc/')
  console.log('\n3️⃣  O Person URN é: urn:li:person:12345abc')
  console.log('   (use apenas a parte depois de "in/")')
  console.log('\n4️⃣  OU vá em: https://www.linkedin.com/developers/apps/verification')
  console.log('   E copie o "Member ID" que aparece')
  console.log('\n5️⃣  O URN será: urn:li:person:<member-id>')
  console.log('\n6️⃣  Adicione no .env.local:')
  console.log('   LINKEDIN_PERSON_URN=urn:li:person:<seu-id>')
  console.log('\n' + '='.repeat(60))
  
  console.log('\n💡 ALTERNATIVA: Teste fazer um post de teste na interface')
  console.log('   O erro pode revelar seu Person URN correto')
  console.log('\n')
}

main().catch(console.error)
