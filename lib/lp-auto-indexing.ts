/**
 * Landing Page Auto-Indexing System
 * Submete automaticamente novas LPs para Google Indexing API e Sitemap
 */

import { submitUrlToGoogle, autoSubmitLandingPage } from './google-indexing'
import { createClient } from './supabase'

export interface LPIndexingResult {
  lpUrl: string
  googleIndexing: {
    success: boolean
    message: string
  }
  sitemap: {
    included: boolean
    message: string
  }
  seoScore: {
    score: number
    issues: string[]
    recommendations: string[]
  }
}

/**
 * Sistema completo de indexação automática de LP
 */
export async function autoIndexNewLP(slug: string, lpData: {
  title: string
  metaDescription: string
  keywords: string[]
  faqCount: number
  hasTermos: boolean
  hasPrivacidade: boolean
  palavrasTotal: number
}): Promise<LPIndexingResult> {
  
  const lpUrl = `https://catbytes.site/pt-BR/lp/${slug}`
  const result: LPIndexingResult = {
    lpUrl,
    googleIndexing: { success: false, message: '' },
    sitemap: { included: false, message: '' },
    seoScore: { score: 0, issues: [], recommendations: [] }
  }

  console.log(`[LP Auto-Index] Iniciando indexação para: ${lpUrl}`)

  // 1. Google Indexing API
  try {
    const indexResult = await autoSubmitLandingPage(slug)
    result.googleIndexing = {
      success: indexResult.success,
      message: indexResult.success 
        ? '✅ Submetida ao Google Indexing API'
        : `⚠️ ${indexResult.error || 'Erro ao submeter'}`
    }
  } catch (error: any) {
    result.googleIndexing = {
      success: false,
      message: `❌ Erro: ${error.message}`
    }
  }

  // 2. Sitemap (Next.js gera automaticamente em app/sitemap.ts)
  // LPs são incluídas dinamicamente via banco de dados
  result.sitemap = {
    included: true,
    message: '✅ Incluída no sitemap dinâmico (/sitemap.xml)'
  }

  // 3. SEO Score Analysis
  const seoAnalysis = analyzeLPSEO(lpData)
  result.seoScore = seoAnalysis

  // 4. Salvar resultado no banco
  try {
    const supabase = createClient()
    await supabase
      .from('landing_pages')
      .update({
        indexed_at: new Date().toISOString(),
        seo_score: seoAnalysis.score,
        last_indexing_status: JSON.stringify(result)
      })
      .eq('slug', slug)
    
    console.log(`[LP Auto-Index] ✅ Status salvo no banco`)
  } catch (error) {
    console.error(`[LP Auto-Index] ⚠️ Erro ao salvar status:`, error)
  }

  return result
}

/**
 * Analisa SEO da LP e retorna score + recomendações
 */
function analyzeLPSEO(lpData: {
  title: string
  metaDescription: string
  keywords: string[]
  faqCount: number
  hasTermos: boolean
  hasPrivacidade: boolean
  palavrasTotal: number
}): LPIndexingResult['seoScore'] {
  
  const issues: string[] = []
  const recommendations: string[] = []
  let score = 100

  // Title Tag (50-60 chars ideal)
  if (lpData.title.length < 50) {
    issues.push('Title muito curto (< 50 chars)')
    score -= 5
    recommendations.push('Aumente o title para 50-60 caracteres')
  } else if (lpData.title.length > 60) {
    issues.push('Title muito longo (> 60 chars)')
    score -= 5
    recommendations.push('Reduza o title para 50-60 caracteres')
  }

  // Meta Description (150-160 chars ideal)
  if (lpData.metaDescription.length < 150) {
    issues.push('Meta description muito curta (< 150 chars)')
    score -= 5
    recommendations.push('Aumente a description para 150-160 caracteres')
  } else if (lpData.metaDescription.length > 160) {
    issues.push('Meta description muito longa (> 160 chars)')
    score -= 5
    recommendations.push('Reduza a description para 150-160 caracteres')
  }

  // Keywords
  if (lpData.keywords.length < 3) {
    issues.push('Poucas keywords (< 3)')
    score -= 10
    recommendations.push('Adicione mais keywords relevantes (ideal: 5-7)')
  }

  // FAQ (importante para featured snippets)
  if (lpData.faqCount < 5) {
    issues.push('FAQ insuficiente (< 5 perguntas)')
    score -= 10
    recommendations.push('Adicione mais perguntas ao FAQ (ideal: 5-10)')
  }

  // Termos de Uso
  if (!lpData.hasTermos) {
    issues.push('Sem Termos de Uso')
    score -= 15
    recommendations.push('Adicione página de Termos de Uso (compliance)')
  }

  // Política de Privacidade
  if (!lpData.hasPrivacidade) {
    issues.push('Sem Política de Privacidade')
    score -= 15
    recommendations.push('Adicione Política de Privacidade (LGPD obrigatória)')
  }

  // Conteúdo (mínimo 1000 palavras)
  if (lpData.palavrasTotal < 1000) {
    issues.push(`Conteúdo muito curto (${lpData.palavrasTotal} palavras)`)
    score -= 20
    recommendations.push('Adicione mais conteúdo (ideal: 1500+ palavras)')
  }

  // Score mínimo é 0
  score = Math.max(0, score)

  return {
    score,
    issues,
    recommendations
  }
}

/**
 * Re-indexa LP existente (útil após edições)
 */
export async function reindexLP(slug: string): Promise<LPIndexingResult> {
  console.log(`[LP Re-Index] Re-indexando LP: ${slug}`)
  
  const supabase = createClient()
  const { data: lp } = await supabase
    .from('landing_pages')
    .select('title, meta_description, keywords, content')
    .eq('slug', slug)
    .single()

  if (!lp) {
    throw new Error('LP não encontrada')
  }

  // Analisa conteúdo atual
  const lpData = {
    title: lp.title || '',
    metaDescription: lp.meta_description || '',
    keywords: lp.keywords || [],
    faqCount: 0, // TODO: extrair do content
    hasTermos: lp.content?.includes('termos') || false,
    hasPrivacidade: lp.content?.includes('privacidade') || false,
    palavrasTotal: lp.content?.split(' ').length || 0
  }

  return autoIndexNewLP(slug, lpData)
}

/**
 * Batch indexing - indexa múltiplas LPs de uma vez
 */
export async function batchIndexLPs(slugs: string[]): Promise<LPIndexingResult[]> {
  console.log(`[LP Batch Index] Indexando ${slugs.length} LPs...`)
  
  const results: LPIndexingResult[] = []
  
  for (const slug of slugs) {
    try {
      const result = await reindexLP(slug)
      results.push(result)
      
      // Delay de 1s entre requisições (evitar rate limit)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error: any) {
      console.error(`[LP Batch Index] Erro no slug ${slug}:`, error.message)
      results.push({
        lpUrl: `https://catbytes.site/pt-BR/lp/${slug}`,
        googleIndexing: { success: false, message: error.message },
        sitemap: { included: false, message: 'Erro' },
        seoScore: { score: 0, issues: [error.message], recommendations: [] }
      })
    }
  }
  
  console.log(`[LP Batch Index] ✅ Concluído: ${results.filter(r => r.googleIndexing.success).length}/${slugs.length} com sucesso`)
  
  return results
}
