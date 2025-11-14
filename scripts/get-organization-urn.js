#!/usr/bin/env node

/**
 * Script para buscar Organization URN com o novo token
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const accessToken = process.env.LINKEDIN_ACCESS_TOKEN

if (!accessToken) {
  console.error('❌ Token não encontrado')
  process.exit(1)
}

async function getOrganizations() {
  console.log('🏢 Buscando páginas administradas...\n')

  try {
    const response = await fetch(
      'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(localizedName,vanityName)))',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'LinkedIn-Version': '202405'
        }
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ Erro ${response.status}:`, error)
      
      // Tentar endpoint alternativo
      console.log('\n🔄 Tentando endpoint alternativo...\n')
      
      const altResponse = await fetch(
        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': '202405'
          }
        }
      )

      if (!altResponse.ok) {
        console.error('❌ Endpoint alternativo também falhou')
        console.log('\n💡 Possíveis causas:')
        console.log('   1. Você não é administrador de nenhuma página')
        console.log('   2. Precisa adicionar scope: r_organization_social ou w_organization_social')
        console.log('   3. A página precisa ser associada ao app no LinkedIn Developers')
        return
      }

      const altData = await altResponse.json()
      console.log('📋 Resposta alternativa:', JSON.stringify(altData, null, 2))
      return
    }

    const data = await response.json()

    if (!data.elements || data.elements.length === 0) {
      console.log('ℹ️  Nenhuma organização encontrada onde você é administrador')
      console.log('\n💡 Para postar como página:')
      console.log('   1. Adicione o produto "Share on LinkedIn" no app')
      console.log('   2. Associe a página da empresa ao app')
      console.log('   3. Regenere o token com scope: w_organization_social')
      return
    }

    console.log(`✅ Encontradas ${data.elements.length} organização(ões):\n`)

    data.elements.forEach((element, index) => {
      const orgUrn = element.organization
      const orgDetails = element['organization~']
      console.log(`${index + 1}. ${orgDetails?.localizedName || 'Sem nome'}`)
      console.log(`   URN: ${orgUrn}`)
      console.log(`   Vanity: ${orgDetails?.vanityName || 'N/A'}`)
      console.log('')
    })

    // Salvar primeira organização
    const orgUrn = data.elements[0].organization
    
    // Atualizar .env.local
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = fs.readFileSync(envPath, 'utf8')

    if (envContent.includes('LINKEDIN_ORGANIZATION_URN=')) {
      envContent = envContent.replace(
        /LINKEDIN_ORGANIZATION_URN=.*/,
        `LINKEDIN_ORGANIZATION_URN=${orgUrn}`
      )
    } else {
      envContent += `\nLINKEDIN_ORGANIZATION_URN=${orgUrn}`
    }

    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local atualizado!')

    // Atualizar banco
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const { data: existing } = await supabase
        .from('linkedin_settings')
        .select('id')
        .limit(1)
        .single()

      if (existing?.id) {
        await supabase
          .from('linkedin_settings')
          .update({ organization_urn: orgUrn })
          .eq('id', existing.id)
        
        console.log('✅ Banco de dados atualizado!')
      }
    }

    console.log('\n✨ Organization URN salvo com sucesso!')

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

getOrganizations()
