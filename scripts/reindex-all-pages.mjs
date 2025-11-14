/**
 * Script para re-indexar todas as páginas importantes do site
 * Usa a Google Indexing API para acelerar a descoberta de melhorias de SEO
 * 
 * Execute: node scripts/reindex-all-pages.mjs
 */

import { google } from 'googleapis'

const BASE_URL = 'https://catbytes.site'
const SCOPES = ['https://www.googleapis.com/auth/indexing']

// Função para submeter URL ao Google
async function submitUrlToGoogle(url, type = 'URL_UPDATED') {
  try {
    // Usar o arquivo google-indexing-key.json diretamente
    const authClient = new google.auth.GoogleAuth({
      keyFile: 'google-indexing-key.json',
      scopes: SCOPES,
    })

    const auth = await authClient.getClient()
    const indexing = google.indexing({ version: 'v3', auth })

    // Submit URL
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    })

    console.log(`[Google Indexing] ✅ URL submitted successfully: ${url}`)

    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error(`[Google Indexing] ❌ Error submitting ${url}:`, error.message)
    
    return {
      success: false,
      url,
      error: error.message,
    }
  }
}

// Função para submeter batch de URLs
async function submitBatchUrls(urls, type = 'URL_UPDATED') {
  console.log(`[Google Indexing] Submitting batch of ${urls.length} URLs...`)
  
  const results = await Promise.allSettled(
    urls.map(url => submitUrlToGoogle(url, type))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        url: urls[index],
        error: result.reason?.message || 'Unknown error',
      }
    }
  })
}

// Páginas principais para indexar
const MAIN_PAGES = [
  `${BASE_URL}/pt-BR`,
  `${BASE_URL}/en-US`,
  `${BASE_URL}/pt-BR/sobre`,
  `${BASE_URL}/en-US/about`,
  `${BASE_URL}/pt-BR/projetos`,
  `${BASE_URL}/en-US/projects`,
  `${BASE_URL}/pt-BR/ia-felina`,
  `${BASE_URL}/en-US/feline-ai`,
  `${BASE_URL}/pt-BR/blog`,
  `${BASE_URL}/en-US/blog`,
  `${BASE_URL}/pt-BR/faq`,
  `${BASE_URL}/en-US/faq`,
  `${BASE_URL}/pt-BR/termos-de-uso`,
  `${BASE_URL}/en-US/terms-of-use`,
  `${BASE_URL}/pt-BR/politicas-de-privacidade`,
  `${BASE_URL}/en-US/privacy-policy`,
]

async function main() {
  console.log('🚀 Iniciando re-indexação de todas as páginas...')
  console.log(`📊 Total de páginas principais: ${MAIN_PAGES.length}`)
  
  // 1. Submeter páginas principais
  console.log('\n📋 Submetendo páginas principais...')
  const mainResults = await submitBatchUrls(MAIN_PAGES)
  
  const mainSuccess = mainResults.filter(r => r.success).length
  const mainFailed = mainResults.filter(r => !r.success).length
  
  console.log(`\n✅ Páginas principais submetidas com sucesso: ${mainSuccess}`)
  console.log(`❌ Páginas principais com erro: ${mainFailed}`)
  
  if (mainFailed > 0) {
    console.log('\n⚠️ Erros encontrados:')
    mainResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url}: ${r.error}`)
    })
  }
  
  // 2. Buscar e submeter posts do blog
  console.log('\n📝 Buscando posts do blog...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/blog/posts?pageSize=100&locale=pt-BR`)
    const data = await response.json()
    
    if (data.posts && data.posts.length > 0) {
      const blogUrls = data.posts.map(post => 
        `${BASE_URL}/${post.locale || 'pt-BR'}/blog/${post.slug}`
      )
      
      console.log(`📊 Total de posts encontrados: ${blogUrls.length}`)
      console.log('\n📋 Submetendo posts do blog...')
      
      // Submeter em batches de 50 (limite do Google)
      const batchSize = 50
      let allBlogResults = []
      
      for (let i = 0; i < blogUrls.length; i += batchSize) {
        const batch = blogUrls.slice(i, i + batchSize)
        console.log(`\n  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} posts`)
        
        const batchResults = await submitBatchUrls(batch)
        allBlogResults = [...allBlogResults, ...batchResults]
        
        // Esperar 2 segundos entre batches para não sobrecarregar a API
        if (i + batchSize < blogUrls.length) {
          console.log('  ⏳ Aguardando 2 segundos...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      
      const blogSuccess = allBlogResults.filter(r => r.success).length
      const blogFailed = allBlogResults.filter(r => !r.success).length
      
      console.log(`\n✅ Posts submetidos com sucesso: ${blogSuccess}`)
      console.log(`❌ Posts com erro: ${blogFailed}`)
      
      if (blogFailed > 0) {
        console.log('\n⚠️ Erros encontrados nos posts:')
        allBlogResults.filter(r => !r.success).slice(0, 5).forEach(r => {
          console.log(`  - ${r.url}: ${r.error}`)
        })
        if (blogFailed > 5) {
          console.log(`  ... e mais ${blogFailed - 5} erros`)
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar posts do blog:', error)
  }
  
  console.log('\n✨ Re-indexação concluída!')
  console.log('\n📊 Resumo:')
  console.log(`  Total de URLs principais submetidas: ${MAIN_PAGES.length}`)
  console.log(`  Sucesso: ${mainSuccess}`)
  console.log(`  Falhas: ${mainFailed}`)
  console.log('\n⏰ Tempo estimado para indexação: 3-24 horas')
  console.log('💡 Dica: Verifique o status no Google Search Console')
}

main().catch(console.error)

