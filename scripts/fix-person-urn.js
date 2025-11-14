#!/usr/bin/env node

/**
 * Script para corrigir o PERSON_URN usando o ID numérico correto
 * 
 * INSTRUÇÕES:
 * 1. Acesse: https://www.linkedin.com/developers/tools/profile-inspector
 * 2. Faça login com sua conta
 * 3. Copie o valor de "sub" (exemplo: ABC123XYZ)
 * 4. Execute: node scripts/fix-person-urn.js ABC123XYZ
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixPersonURN(personId) {
  console.log('🔧 Corrigindo Person URN...\n')

  if (!personId) {
    console.error('❌ Você precisa fornecer o Person ID!')
    console.log('\n📋 COMO OBTER O ID:')
    console.log('1. Acesse: https://www.linkedin.com/developers/tools/profile-inspector')
    console.log('2. Faça login com sua conta do LinkedIn')
    console.log('3. Copie o valor do campo "sub" (exemplo: ABC123XYZ)')
    console.log('\n💡 USO:')
    console.log('   node scripts/fix-person-urn.js ABC123XYZ')
    process.exit(1)
  }

  const personUrn = `urn:li:person:${personId}`

  console.log('✅ Person URN gerado:', personUrn)

  try {
    // 1. Atualizar .env.local
    console.log('\n📝 Atualizando .env.local...')
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

    // 2. Atualizar banco de dados
    console.log('\n💾 Atualizando banco de dados...')
    
    const { error } = await supabase
      .from('linkedin_settings')
      .update({ person_urn: personUrn })
      .eq('id', process.env.LINKEDIN_SETTINGS_ID || 1)

    if (error) {
      console.error('❌ Erro ao atualizar banco:', error)
    } else {
      console.log('✅ Banco de dados atualizado!')
    }

    console.log('\n✨ Person URN corrigido com sucesso!')
    console.log('💡 Reinicie o servidor (npm run dev) para aplicar as mudanças')

  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

// Pegar ID dos argumentos da linha de comando
const personId = process.argv[2]
fixPersonURN(personId)
