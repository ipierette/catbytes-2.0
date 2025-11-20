#!/usr/bin/env node

/**
 * Script para corrigir problemas de indexação no Google Search Console
 * 
 * Ações:
 * 1. Submete páginas principais para reindexação
 * 2. Remove URLs problemáticas (raiz, admin com locale)
 * 3. Atualiza sitemap
 */

const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

// URLs para INDEXAR (páginas corrigidas)
const URLS_TO_INDEX = [
  'https://catbytes.site/pt-BR',
  'https://catbytes.site/en-US',
  'https://catbytes.site/pt-BR/blog',
  'https://catbytes.site/en-US/blog',
  'https://catbytes.site/pt-BR/sobre',
  'https://catbytes.site/en-US/about',
  'https://catbytes.site/pt-BR/projetos',
  'https://catbytes.site/en-US/projects',
  'https://catbytes.site/pt-BR/ia-felina',
  'https://catbytes.site/en-US/feline-ai',
  'https://catbytes.site/pt-BR/faq',
  'https://catbytes.site/en-US/faq',
]

// URLs para REMOVER (problemáticas)
const URLS_TO_REMOVE = [
  'https://catbytes.site/', // Raiz (agora redireciona)
  'https://catbytes.site/pt-BR/admin',
  'https://catbytes.site/en-US/admin',
]

const DELAY_BETWEEN_REQUESTS = 2000 // 2 segundos entre requests

/**
 * Carrega credenciais do Google
 */
function loadGoogleCredentials() {
  const keyFilePath = path.join(process.cwd(), 'google-indexing-key.json')
  
  if (!fs.existsSync(keyFilePath)) {
    throw new Error(`❌ Arquivo ${keyFilePath} não encontrado`)
  }
  
  const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf-8'))
  console.log('✅ Credenciais carregadas de google-indexing-key.json')
  
  return credentials
}

/**
 * Cria cliente autenticado do Google Indexing API
 */
async function getGoogleIndexingClient() {
  const credentials = loadGoogleCredentials()
  
  const client = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  })
  
  await client.authorize()
  console.log('✅ Autenticado no Google Indexing API\n')
  
  return google.indexing({ version: 'v3', auth: client })
}

/**
 * Aguarda um delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Solicita indexação de uma URL
 */
async function requestIndexing(indexing, url) {
  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED'
      }
    })
    
    console.log(`✅ ${url}`)
    console.log(`   Status: ${response.data.urlNotificationMetadata?.latestUpdate?.type || 'Solicitado'}`)
    return { success: true, url }
  } catch (error) {
    console.error(`❌ ${url}`)
    console.error(`   Erro: ${error.message}`)
    return { success: false, url, error: error.message }
  }
}

/**
 * Solicita remoção de uma URL (via API não é possível, mas tentamos DELETE)
 */
async function requestRemoval(indexing, url) {
  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_DELETED'
      }
    })
    
    console.log(`🗑️  ${url}`)
    console.log(`   Status: Marcado como DELETED`)
    return { success: true, url }
  } catch (error) {
    console.error(`❌ ${url}`)
    console.error(`   Erro: ${error.message}`)
    console.error(`   💡 Use Google Search Console manualmente para remover`)
    return { success: false, url, error: error.message }
  }
}

/**
 * Verifica status de indexação de uma URL
 */
async function checkIndexingStatus(indexing, url) {
  try {
    const response = await indexing.urlNotifications.getMetadata({
      url: url
    })
    
    const metadata = response.data
    return {
      url,
      lastUpdate: metadata.latestUpdate?.notifyTime || 'Nunca',
      type: metadata.latestUpdate?.type || 'Desconhecido',
    }
  } catch (error) {
    return {
      url,
      lastUpdate: 'Erro',
      type: error.message,
    }
  }
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Iniciando correção de indexação do Google Search Console\n')
  console.log('=' .repeat(70))
  
  try {
    // 1. Autenticar
    const indexing = await getGoogleIndexingClient()
    
    // 2. Indexar páginas principais
    console.log('\n📊 ETAPA 1: Solicitando indexação de páginas principais')
    console.log('=' .repeat(70))
    
    const indexResults = []
    for (const url of URLS_TO_INDEX) {
      const result = await requestIndexing(indexing, url)
      indexResults.push(result)
      await sleep(DELAY_BETWEEN_REQUESTS)
    }
    
    // 3. Remover URLs problemáticas
    console.log('\n\n🗑️  ETAPA 2: Marcando URLs problemáticas como DELETED')
    console.log('=' .repeat(70))
    console.log('⚠️  Nota: Remoção definitiva deve ser feita no Google Search Console')
    console.log('   Console > Remoções > Nova solicitação\n')
    
    const removeResults = []
    for (const url of URLS_TO_REMOVE) {
      const result = await requestRemoval(indexing, url)
      removeResults.push(result)
      await sleep(DELAY_BETWEEN_REQUESTS)
    }
    
    // 4. Resumo
    console.log('\n\n📈 RESUMO')
    console.log('=' .repeat(70))
    
    const successfulIndexing = indexResults.filter(r => r.success).length
    const failedIndexing = indexResults.filter(r => !r.success).length
    
    const successfulRemoval = removeResults.filter(r => r.success).length
    const failedRemoval = removeResults.filter(r => !r.success).length
    
    console.log(`\n✅ Indexação solicitada: ${successfulIndexing}/${URLS_TO_INDEX.length}`)
    if (failedIndexing > 0) {
      console.log(`❌ Falhas na indexação: ${failedIndexing}`)
    }
    
    console.log(`\n🗑️  Remoções marcadas: ${successfulRemoval}/${URLS_TO_REMOVE.length}`)
    if (failedRemoval > 0) {
      console.log(`⚠️  Falhas na remoção: ${failedRemoval}`)
      console.log(`   💡 Remova manualmente no Google Search Console:`)
      removeResults.filter(r => !r.success).forEach(r => {
        console.log(`      - ${r.url}`)
      })
    }
    
    // 5. Próximos passos
    console.log('\n\n🎯 PRÓXIMOS PASSOS')
    console.log('=' .repeat(70))
    console.log('1. ✅ Indexação solicitada via API (concluído)')
    console.log('2. 🌐 Acesse Google Search Console:')
    console.log('   https://search.google.com/search-console')
    console.log('3. 📋 Vá em "Sitemaps" e reenvie:')
    console.log('   https://catbytes.site/sitemap.xml')
    console.log('4. 🗑️  Vá em "Remoções" e remova manualmente:')
    URLS_TO_REMOVE.forEach(url => {
      console.log(`   - ${url}`)
    })
    console.log('5. ⏰ Aguarde 1-3 dias para o Google processar')
    console.log('6. 📊 Monitore em "Visão Geral" do Search Console')
    
    console.log('\n✨ Script concluído com sucesso!')
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Executar
main()
