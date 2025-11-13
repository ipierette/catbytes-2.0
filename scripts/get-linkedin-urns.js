#!/usr/bin/env node

/**
 * Script para obter LINKEDIN_PERSON_URN e LINKEDIN_ORGANIZATION_URN
 * Usa o access token do .env.local para buscar as informações
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

const ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN

if (!ACCESS_TOKEN || ACCESS_TOKEN === 'PENDING_OAUTH') {
  console.error('❌ LINKEDIN_ACCESS_TOKEN não encontrado no .env.local')
  console.error('Execute o fluxo OAuth primeiro para obter o token')
  process.exit(1)
}

async function getPersonURN() {
  console.log('🔍 Buscando Person URN...')
  
  try {
    // Usando /v2/me que funciona apenas com w_member_social
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202405'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao buscar perfil: ${response.status} - ${error}`)
    }

    const data = await response.json()
    console.log('✅ Person URN encontrado!')
    console.log('📋 Dados do usuário:', JSON.stringify(data, null, 2))
    
    // O ID retornado é o Person URN no formato: urn:li:person:XXXXX
    const personUrn = data.id
    return personUrn
  } catch (error) {
    console.error('❌ Erro ao buscar Person URN:', error.message)
    return null
  }
}

async function getOrganizations() {
  console.log('\n🔍 Buscando Organizations (Páginas)...')
  
  try {
    // Primeiro, precisamos do Person ID para buscar as organizações
    const meResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'LinkedIn-Version': '202405'
      }
    })

    if (!meResponse.ok) {
      const error = await meResponse.text()
      throw new Error(`Erro ao buscar perfil: ${meResponse.status} - ${error}`)
    }

    const meData = await meResponse.json()
    const personId = meData.id
    
    console.log(`✅ Person ID: ${personId}`)

    // Buscar páginas administradas
    const orgsResponse = await fetch(
      `https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(localizedName,vanityName)))`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'LinkedIn-Version': '202405'
        }
      }
    )

    if (!orgsResponse.ok) {
      const error = await orgsResponse.text()
      console.warn('⚠️  Não foi possível buscar organizações:', error)
      console.log('💡 Você pode não ter permissão de administrador em nenhuma página')
      return []
    }

    const orgsData = await orgsResponse.json()
    
    if (orgsData.elements && orgsData.elements.length > 0) {
      console.log('✅ Organizações encontradas:')
      orgsData.elements.forEach((element, index) => {
        const orgUrn = element.organization
        const orgDetails = element['organization~']
        console.log(`\n  ${index + 1}. ${orgDetails?.localizedName || 'Sem nome'}`)
        console.log(`     URN: ${orgUrn}`)
        console.log(`     Vanity Name: ${orgDetails?.vanityName || 'N/A'}`)
      })
      return orgsData.elements
    } else {
      console.log('ℹ️  Nenhuma organização encontrada onde você é administrador')
      return []
    }
  } catch (error) {
    console.error('❌ Erro ao buscar Organizations:', error.message)
    return []
  }
}

async function updateEnvFile(personUrn, organizationUrn) {
  console.log('\n📝 Atualizando .env.local...')
  
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = fs.readFileSync(envPath, 'utf8')

    // Atualizar LINKEDIN_PERSON_URN
    if (personUrn) {
      if (envContent.includes('LINKEDIN_PERSON_URN=')) {
        envContent = envContent.replace(
          /LINKEDIN_PERSON_URN=.*/,
          `LINKEDIN_PERSON_URN=${personUrn}`
        )
      } else {
        envContent += `\nLINKEDIN_PERSON_URN=${personUrn}`
      }
    }

    // Atualizar LINKEDIN_ORGANIZATION_URN
    if (organizationUrn) {
      if (envContent.includes('LINKEDIN_ORGANIZATION_URN=')) {
        envContent = envContent.replace(
          /LINKEDIN_ORGANIZATION_URN=.*/,
          `LINKEDIN_ORGANIZATION_URN=${organizationUrn}`
        )
      } else {
        envContent += `\nLINKEDIN_ORGANIZATION_URN=${organizationUrn}`
      }
    }

    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local atualizado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao atualizar .env.local:', error.message)
  }
}

async function main() {
  console.log('🚀 Buscando URNs do LinkedIn...\n')

  const personUrn = await getPersonURN()
  const organizations = await getOrganizations()

  console.log('\n' + '='.repeat(60))
  console.log('📋 RESUMO DOS URNs ENCONTRADOS')
  console.log('='.repeat(60))

  if (personUrn) {
    console.log('\n✅ LINKEDIN_PERSON_URN:')
    console.log(`   ${personUrn}`)
  } else {
    console.log('\n❌ LINKEDIN_PERSON_URN: Não encontrado')
  }

  let selectedOrgUrn = null
  if (organizations.length > 0) {
    console.log('\n✅ ORGANIZAÇÕES DISPONÍVEIS:')
    organizations.forEach((element, index) => {
      const orgUrn = element.organization
      const orgDetails = element['organization~']
      console.log(`\n   ${index + 1}. ${orgDetails?.localizedName || 'Sem nome'}`)
      console.log(`      URN: ${orgUrn}`)
    })

    // Se houver apenas uma organização, usar ela automaticamente
    if (organizations.length === 1) {
      selectedOrgUrn = organizations[0].organization
      console.log(`\n✅ Usando organização única: ${selectedOrgUrn}`)
    } else {
      console.log('\n💡 Se você tem múltiplas organizações, edite manualmente o .env.local')
      console.log('   para escolher qual URN usar no LINKEDIN_ORGANIZATION_URN')
      selectedOrgUrn = organizations[0].organization // Usar a primeira por padrão
    }
  } else {
    console.log('\n⚠️  LINKEDIN_ORGANIZATION_URN: Nenhuma organização encontrada')
    console.log('   Você poderá postar apenas como perfil pessoal')
  }

  console.log('\n' + '='.repeat(60))

  // Atualizar .env.local
  await updateEnvFile(personUrn, selectedOrgUrn)

  console.log('\n✨ Processo concluído!')
  console.log('💡 Reinicie o servidor de desenvolvimento para aplicar as mudanças')
}

main().catch(console.error)
