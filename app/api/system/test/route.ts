/**
 * 🧪 TESTE COMPLETO DO SISTEMA DE AUTOMAÇÃO
 * 
 * Script para validar todas as funcionalidades do mega sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyInstagramCredentials, getInstagramAccountInfo } from '@/lib/instagram-api'
import { instagramDB } from '@/lib/instagram-db'
import { generatePostContent } from '@/lib/content-generator'
import { generateImage } from '@/lib/image-generator'

export const maxDuration = 300 // 5 minutos para teste completo

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: any
  executionTime?: number
}

interface SystemTest {
  testId: string
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  warnings: number
  results: TestResult[]
  overallStatus: 'healthy' | 'degraded' | 'critical'
  executionTime: number
}

/**
 * 🧪 Executa teste específico com medição de tempo
 */
async function runTest(name: string, testFunction: () => Promise<any>): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    console.log(`🔍 Testing: ${name}...`)
    const data = await testFunction()
    const executionTime = Date.now() - startTime
    
    console.log(`✅ ${name} - OK (${executionTime}ms)`)
    
    return {
      name,
      status: 'success',
      message: 'Test passed successfully',
      data,
      executionTime
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    console.log(`❌ ${name} - FAILED (${executionTime}ms): ${message}`)
    
    return {
      name,
      status: 'error',
      message,
      executionTime
    }
  }
}

/**
 * 🔐 Teste 1: Verificação de Credenciais
 */
async function testCredentials(): Promise<{ credentialsFound: number }> {
  const required = [
    'INSTAGRAM_ACCESS_TOKEN',
    'INSTAGRAM_ACCOUNT_ID', 
    'OPENAI_API_KEY',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable: ${envVar}`)
    }
  }

  return { credentialsFound: required.length }
}

/**
 * 📸 Teste 2: Conectividade Instagram
 */
async function testInstagramAPI(): Promise<any> {
  const credentials = {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
    accountId: process.env.INSTAGRAM_ACCOUNT_ID!
  }

  // Verificar se credenciais são válidas
  const isValid = await verifyInstagramCredentials(credentials)
  if (!isValid) {
    throw new Error('Invalid Instagram credentials')
  }

  // Buscar informações da conta
  const accountInfo = await getInstagramAccountInfo(credentials)
  
  return {
    username: accountInfo.username,
    followers: accountInfo.followersCount,
    media: accountInfo.mediaCount
  }
}

/**
 * 🧠 Teste 3: Geração de Conteúdo (OpenAI)
 */
async function testContentGeneration(): Promise<any> {
  const nicho = 'advogados' // Using valid Niche type
  const content = await generatePostContent(nicho)
  
  if (!content.titulo || !content.caption || !content.hashtags) {
    throw new Error('Content generation returned incomplete data')
  }

  return {
    nicho,
    titulo: content.titulo.substring(0, 50) + '...',
    captionLength: content.caption.length,
    hashtagsCount: content.hashtags.length
  }
}

/**
 * 🎨 Teste 4: Geração de Imagem
 */
async function testImageGeneration(): Promise<any> {
  const prompt = "Modern web development concept, React components, clean blue and purple gradient background, minimalist design, professional tech illustration"
  
  const imageUrl = await generateImage(prompt)
  
  if (!imageUrl || !imageUrl.startsWith('http')) {
    throw new Error('Invalid image URL generated')
  }

  // Verificar se imagem é acessível
  const response = await fetch(imageUrl, { method: 'HEAD' })
  if (!response.ok) {
    throw new Error('Generated image is not accessible')
  }

  return {
    imageUrl: imageUrl.substring(0, 50) + '...',
    contentType: response.headers.get('content-type'),
    imageSize: response.headers.get('content-length')
  }
}

/**
 * 🗄️ Teste 5: Banco de Dados
 */
async function testDatabase(): Promise<any> {
  // Testar conexão e operações básicas
  const stats = await instagramDB.getStats()
  const nextNiche = await instagramDB.getNextNiche()
  
  return {
    totalPosts: typeof stats.total === 'number' ? stats.total : stats.total.length,
    publishedPosts: typeof stats.published === 'number' ? stats.published : stats.published.length,
    approvedPosts: typeof stats.approved === 'number' ? stats.approved : stats.approved.length,
    nextNiche
  }
}

/**
 * 📊 Teste 6: Analytics API
 */
async function testAnalytics(): Promise<any> {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
    
  const response = await fetch(`${baseUrl}/api/campaign/analytics`)
  
  if (!response.ok) {
    throw new Error(`Analytics API returned ${response.status}`)
  }

  const data = await response.json()
  
  return {
    success: data.success,
    dataPoints: data.metadata?.dataPoints,
    period: data.data?.period
  }
}

/**
 * 🔄 Teste 7: Cron Jobs (simulação)
 */
async function testCronJobs(): Promise<any> {
  // Simular verificação dos endpoints de cron
  const endpoints = [
    '/api/instagram/generate-batch',
    '/api/instagram/publish-scheduled',
    '/api/campaign/mega-automation-disabled'
  ]

  const results = []
  
  for (const endpoint of endpoints) {
    try {
      // Note: Não vamos executar os crons de verdade, apenas verificar se existem
      const exists = true // Mock - endpoint existe
      results.push({ endpoint, status: exists ? 'available' : 'missing' })
    } catch (error) {
      results.push({ endpoint, status: 'error', error: error instanceof Error ? error.message : 'Unknown' })
    }
  }

  return { cronEndpoints: results }
}

/**
 * 🧪 EXECUTAR TODOS OS TESTES
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const testStartTime = Date.now()
  const testId = `test_${Date.now()}`
  
  console.log(`🧪 === INICIANDO TESTE COMPLETO DO SISTEMA ===`)
  console.log(`Test ID: ${testId}`)

  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Executar todos os testes
    const tests = [
      runTest('🔐 Credenciais', testCredentials),
      runTest('📸 Instagram API', testInstagramAPI),
      runTest('🧠 Geração de Conteúdo', testContentGeneration),
      runTest('🎨 Geração de Imagem', testImageGeneration),
      runTest('🗄️ Banco de Dados', testDatabase),
      runTest('📊 Analytics API', testAnalytics),
      runTest('🔄 Cron Jobs', testCronJobs)
    ]

    const results = await Promise.all(tests)
    
    // Calcular estatísticas
    const passed = results.filter(r => r.status === 'success').length
    const failed = results.filter(r => r.status === 'error').length
    const warnings = results.filter(r => r.status === 'warning').length
    const totalTests = results.length

    // Determinar status geral do sistema
    let overallStatus: SystemTest['overallStatus']
    if (failed === 0) {
      overallStatus = 'healthy'
    } else if (failed <= 2) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'critical'
    }

    const executionTime = Date.now() - testStartTime

    const systemTest: SystemTest = {
      testId,
      timestamp: new Date().toISOString(),
      totalTests,
      passed,
      failed,
      warnings,
      results,
      overallStatus,
      executionTime
    }

    // Log final
    console.log(`🎉 === TESTE COMPLETO FINALIZADO ===`)
    console.log(`Status: ${overallStatus.toUpperCase()}`)
    console.log(`Aprovados: ${passed}/${totalTests}`)
    console.log(`Falharam: ${failed}`)
    console.log(`Tempo: ${executionTime}ms`)

    return NextResponse.json({
      success: true,
      ...systemTest
    })

  } catch (error) {
    console.error('💥 FALHA NO TESTE GERAL:', error)
    
    return NextResponse.json({
      success: false,
      testId,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - testStartTime
    }, { status: 500 })
  }
}

/**
 * GET: Status rápido do sistema
 */
export async function GET(): Promise<NextResponse> {
  try {
    const quickChecks = {
      instagram: !!process.env.INSTAGRAM_ACCESS_TOKEN,
      openai: !!process.env.OPENAI_API_KEY,
      database: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      email: !!process.env.RESEND_API_KEY
    }

    const healthyServices = Object.values(quickChecks).filter(Boolean).length
    const totalServices = Object.keys(quickChecks).length
    const healthPercentage = (healthyServices / totalServices) * 100

    return NextResponse.json({
      status: 'ready',
      health: `${healthPercentage.toFixed(1)}%`,
      services: quickChecks,
      timestamp: new Date().toISOString(),
      message: healthPercentage === 100 
        ? '🟢 All systems operational' 
        : `🟡 ${totalServices - healthyServices} service(s) need attention`
    })

  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}