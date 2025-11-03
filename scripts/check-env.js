#!/usr/bin/env node

/**
 * Script para verificar variáveis de ambiente necessárias
 * Usage: node scripts/check-env.js
 */

const fs = require('fs')
const path = require('path')

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

console.log(`${colors.cyan}${colors.bold}
╔════════════════════════════════════════════════════╗
║     🔍 Verificação de Variáveis de Ambiente       ║
║              CatBytes Newsletter Test              ║
╚════════════════════════════════════════════════════╝
${colors.reset}\n`)

// Variáveis necessárias
const requiredVars = {
  newsletter: [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', description: 'URL do Supabase', example: 'https://xxx.supabase.co' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Chave pública Supabase', example: 'eyJhbGciOi...' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Chave admin Supabase', example: 'eyJhbGciOi...' },
    { name: 'RESEND_API_KEY', description: 'API Key do Resend', example: 're_...' },
    { name: 'NEXT_PUBLIC_SITE_URL', description: 'URL do site', example: 'https://catbytes.site' },
  ],
  optional: [
    { name: 'OPENAI_API_KEY', description: 'API Key OpenAI (para IA)' },
    { name: 'GITHUB_TOKEN', description: 'Token GitHub (para stats)' },
    { name: 'NEXT_PUBLIC_WHATSAPP_NUMBER', description: 'Número WhatsApp' },
    { name: 'CRON_SECRET', description: 'Secret para cron jobs' },
  ],
}

// Verifica se .env.local existe
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.local.example')

if (!fs.existsSync(envPath)) {
  console.log(`${colors.red}❌ Arquivo .env.local não encontrado!${colors.reset}\n`)
  
  if (fs.existsSync(envExamplePath)) {
    console.log(`${colors.yellow}💡 Dica: Copie o .env.local.example:${colors.reset}`)
    console.log(`   cp .env.local.example .env.local\n`)
  }
  
  process.exit(1)
}

// Carrega variáveis do .env.local
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach((line) => {
  const match = line.match(/^([A-Z_]+)=(.*)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

// Função para verificar variável
function checkVar(varName, description, example) {
  const value = envVars[varName]
  const isSet = value && value.trim() !== '' && !value.includes('your_') && !value.includes('_here')
  
  if (isSet) {
    console.log(`${colors.green}✅ ${varName}${colors.reset}`)
    console.log(`   ${colors.blue}${description}${colors.reset}`)
    
    // Mostra preview da variável (mascarado)
    if (value.length > 20) {
      console.log(`   ${colors.cyan}Valor: ${value.substring(0, 15)}...${value.substring(value.length - 5)}${colors.reset}`)
    } else {
      console.log(`   ${colors.cyan}Valor: ${value}${colors.reset}`)
    }
  } else {
    console.log(`${colors.red}❌ ${varName}${colors.reset}`)
    console.log(`   ${colors.yellow}${description}${colors.reset}`)
    if (example) {
      console.log(`   ${colors.yellow}Exemplo: ${example}${colors.reset}`)
    }
  }
  console.log('')
  
  return isSet
}

// Verifica variáveis necessárias para newsletter
console.log(`${colors.bold}📧 Variáveis necessárias para Newsletter:${colors.reset}\n`)
let allNewsletterVarsSet = true

requiredVars.newsletter.forEach((v) => {
  const isSet = checkVar(v.name, v.description, v.example)
  if (!isSet) allNewsletterVarsSet = false
})

// Verifica variáveis opcionais
console.log(`${colors.bold}🔧 Variáveis opcionais:${colors.reset}\n`)
requiredVars.optional.forEach((v) => {
  checkVar(v.name, v.description)
})

// Resultado final
console.log(`${colors.cyan}${colors.bold}
╔════════════════════════════════════════════════════╗${colors.reset}`)

if (allNewsletterVarsSet) {
  console.log(`${colors.green}${colors.bold}║  ✅ TODAS as variáveis de Newsletter configuradas! ║${colors.reset}`)
  console.log(`${colors.cyan}${colors.bold}╚════════════════════════════════════════════════════╝${colors.reset}\n`)
  
  console.log(`${colors.green}🎉 Você está pronto para testar a newsletter!${colors.reset}\n`)
  console.log(`${colors.cyan}Próximos passos:${colors.reset}`)
  console.log(`  1. Inicie o servidor: ${colors.yellow}npm run dev${colors.reset}`)
  console.log(`  2. Acesse: ${colors.yellow}http://localhost:3000/pt-BR/newsletter-test${colors.reset}`)
  console.log(`  3. Preencha o formulário com um email válido`)
  console.log(`  4. Verifique seu email (pode demorar alguns segundos)\n`)
} else {
  console.log(`${colors.red}${colors.bold}║  ❌ Algumas variáveis estão faltando!            ║${colors.reset}`)
  console.log(`${colors.cyan}${colors.bold}╚════════════════════════════════════════════════════╝${colors.reset}\n`)
  
  console.log(`${colors.yellow}⚠️  Configure as variáveis marcadas com ❌ acima${colors.reset}`)
  console.log(`${colors.yellow}    Edite o arquivo: .env.local${colors.reset}\n`)
  
  process.exit(1)
}
