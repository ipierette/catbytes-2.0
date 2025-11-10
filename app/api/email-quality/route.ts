import { NextRequest, NextResponse } from 'next/server'
import { validateEmailQuality, formatQualityReport } from '@/lib/email-quality-checker'
import { getWelcomeEmailHTML } from '@/lib/email-templates/welcome-email'
import { getNewPostEmailHTML } from '@/lib/email-templates/new-post-email'

/**
 * POST /api/email-quality
 * 
 * Valida a qualidade de um email HTML
 * 
 * Body:
 * - html: string (HTML do email)
 * - subject?: string
 * - template?: 'welcome' | 'new-post' (para testar templates existentes)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { html, subject, template } = body

    let emailHtml = html
    let emailSubject = subject

    // Se template foi especificado, buscar HTML do template
    if (template) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
      
      if (template === 'welcome') {
        emailHtml = getWelcomeEmailHTML('Teste', 'test-token', 'pt-BR')
        emailSubject = '🎉 Bem-vindo à Newsletter CatBytes!'
      } else if (template === 'new-post') {
        emailHtml = getNewPostEmailHTML(
          'Teste',
          'Exemplo: Machine Learning para Iniciantes',
          'Descubra como o Machine Learning funciona de forma simples e prática.',
          `${baseUrl}/images/catbytes-logo.webp`,
          `${baseUrl}/pt-BR/blog`,
          'pt-BR',
          baseUrl
        )
        emailSubject = '🚀 Novo Artigo Publicado!'
      }
    }

    if (!emailHtml) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'HTML do email é obrigatório' 
        },
        { status: 400 }
      )
    }

    // Validar qualidade
    const report = await validateEmailQuality(emailHtml, {
      subject: emailSubject,
      from: 'contato@catbytes.site'
    })

    // Formatar relatório
    const formattedReport = formatQualityReport(report)

    return NextResponse.json({
      success: true,
      report,
      formattedReport,
      summary: {
        score: report.score,
        passed: report.passed,
        criticalIssues: report.issues.filter(i => i.severity === 'critical').length,
        totalIssues: report.issues.length,
        totalWarnings: report.warnings.length
      }
    })
  } catch (error) {
    console.error('Error validating email quality:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao validar qualidade do email' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/email-quality?template=welcome
 * 
 * Testa qualidade de um template específico
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template') || 'welcome'

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
    let emailHtml = ''
    let emailSubject = ''

    if (template === 'welcome') {
      emailHtml = getWelcomeEmailHTML('Teste Quality Check', 'test-token-123', 'pt-BR')
      emailSubject = '🎉 Bem-vindo à Newsletter CatBytes!'
    } else if (template === 'new-post') {
      emailHtml = getNewPostEmailHTML(
        'Teste Quality Check',
        'Machine Learning: Guia Completo para Iniciantes',
        'Descubra como o Machine Learning funciona, suas aplicações práticas e como você pode começar a aprender essa tecnologia revolucionária.',
        `${baseUrl}/images/catbytes-logo.webp`,
        `${baseUrl}/pt-BR/blog/machine-learning-guia-iniciantes`,
        'pt-BR',
        baseUrl
      )
      emailSubject = '🚀 Novo Artigo Publicado no Blog!'
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Template inválido. Use "welcome" ou "new-post"' 
        },
        { status: 400 }
      )
    }

    // Validar qualidade
    const report = await validateEmailQuality(emailHtml, {
      subject: emailSubject,
      from: 'contato@catbytes.site'
    })

    // Formatar relatório
    const formattedReport = formatQualityReport(report)

    return NextResponse.json({
      success: true,
      template,
      report,
      formattedReport,
      summary: {
        score: report.score,
        passed: report.passed,
        criticalIssues: report.issues.filter(i => i.severity === 'critical').length,
        totalIssues: report.issues.length,
        totalWarnings: report.warnings.length
      }
    })
  } catch (error) {
    console.error('Error validating email quality:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao validar qualidade do email' 
      },
      { status: 500 }
    )
  }
}
