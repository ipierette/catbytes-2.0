#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })

console.log('\n📋 Verificando variáveis de ambiente do LinkedIn:\n')

const requiredVars = {
  'LINKEDIN_CLIENT_ID': process.env.LINKEDIN_CLIENT_ID,
  'LINKEDIN_CLIENT_SECRET': process.env.LINKEDIN_CLIENT_SECRET,
  'LINKEDIN_REDIRECT_URI': process.env.LINKEDIN_REDIRECT_URI,
}

let allValid = true

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value) {
    console.log(`❌ ${key}: NÃO CONFIGURADO`)
    allValid = false
  } else {
    const display = key === 'LINKEDIN_CLIENT_SECRET' 
      ? value.substring(0, 10) + '...' 
      : value
    console.log(`✅ ${key}: ${display}`)
  }
}

console.log('\n')

if (!allValid) {
  console.error('⚠️  Algumas variáveis não estão configuradas!')
  process.exit(1)
} else {
  console.log('✅ Todas as variáveis estão configuradas!')
  console.log('\n💡 IMPORTANTE: Você também precisa adicionar essas variáveis no Vercel!')
  console.log('   Acesse: https://vercel.com/izadora-cury-pierettes-projects/catbytes-portfolio2-0/settings/environment-variables')
}
