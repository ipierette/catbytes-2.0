/**
 * 📧 Email Quality Checker
 * 
 * Sistema de validação de qualidade para emails profissionais
 * Garante que todos os emails enviados atendam aos padrões de qualidade
 */

export interface EmailQualityReport {
  score: number // 0-100
  passed: boolean
  issues: EmailIssue[]
  warnings: EmailWarning[]
  recommendations: string[]
}

export interface EmailIssue {
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  message: string
  fix?: string
}

export interface EmailWarning {
  category: string
  message: string
  suggestion?: string
}

/**
 * Valida a qualidade de um email HTML
 */
export async function validateEmailQuality(
  html: string,
  options: {
    subject?: string
    from?: string
    to?: string
  } = {}
): Promise<EmailQualityReport> {
  const issues: EmailIssue[] = []
  const warnings: EmailWarning[] = []
  const recommendations: string[] = []

  // 1. Validações de Estrutura HTML
  validateHTMLStructure(html, issues, warnings)

  // 2. Validações de Imagens
  validateImages(html, issues, warnings, recommendations)

  // 3. Validações de Links
  validateLinks(html, issues, warnings)

  // 4. Validações de Texto
  validateText(html, issues, warnings, recommendations)

  // 5. Validações de Acessibilidade
  validateAccessibility(html, issues, warnings, recommendations)

  // 6. Validações de Compatibilidade
  validateCompatibility(html, issues, warnings, recommendations)

  // 7. Validações de Tamanho
  validateSize(html, issues, warnings)

  // 8. Validações de Subject e Headers
  if (options.subject) {
    validateSubject(options.subject, issues, warnings, recommendations)
  }

  // Calcular score
  const score = calculateQualityScore(issues, warnings)
  const passed = score >= 80 && issues.filter(i => i.severity === 'critical').length === 0

  return {
    score,
    passed,
    issues,
    warnings,
    recommendations
  }
}

/**
 * Validações de estrutura HTML
 */
function validateHTMLStructure(html: string, issues: EmailIssue[], warnings: EmailWarning[]) {
  // DOCTYPE
  if (!html.includes('<!DOCTYPE html>')) {
    issues.push({
      severity: 'high',
      category: 'HTML Structure',
      message: 'Email não possui DOCTYPE HTML5',
      fix: 'Adicione <!DOCTYPE html> no início do email'
    })
  }

  // Tag <html>
  if (!html.includes('<html')) {
    issues.push({
      severity: 'critical',
      category: 'HTML Structure',
      message: 'Email não possui tag <html>',
      fix: 'Envolva o conteúdo em tags <html> e </html>'
    })
  }

  // Tag <head>
  if (!html.includes('<head>')) {
    issues.push({
      severity: 'high',
      category: 'HTML Structure',
      message: 'Email não possui tag <head>',
      fix: 'Adicione seção <head> com meta tags'
    })
  }

  // Meta charset
  if (!html.includes('charset')) {
    issues.push({
      severity: 'high',
      category: 'HTML Structure',
      message: 'Email não possui charset definido',
      fix: 'Adicione <meta charset="UTF-8"> no <head>'
    })
  }

  // Viewport
  if (!html.includes('viewport')) {
    warnings.push({
      category: 'Mobile',
      message: 'Email não possui meta viewport',
      suggestion: 'Adicione <meta name="viewport" content="width=device-width, initial-scale=1.0"> para melhor suporte mobile'
    })
  }

  // Tables para layout
  if (!html.includes('<table')) {
    warnings.push({
      category: 'Layout',
      message: 'Email não usa tables para layout',
      suggestion: 'Considere usar tables com role="presentation" para melhor compatibilidade'
    })
  }
}

/**
 * Validações de imagens
 */
function validateImages(
  html: string,
  issues: EmailIssue[],
  warnings: EmailWarning[],
  recommendations: string[]
) {
  const imgRegex = /<img[^>]+>/gi
  const images = html.match(imgRegex) || []

  images.forEach((img, index) => {
    // Alt text
    if (!img.includes('alt=')) {
      issues.push({
        severity: 'high',
        category: 'Accessibility',
        message: `Imagem ${index + 1} não possui atributo alt`,
        fix: 'Adicione alt="descrição" em todas as imagens'
      })
    }

    // URLs absolutas
    const srcMatch = img.match(/src=["']([^"']+)["']/)
    if (srcMatch) {
      const src = srcMatch[1]
      if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('cid:')) {
        issues.push({
          severity: 'critical',
          category: 'Images',
          message: `Imagem ${index + 1} usa caminho relativo: ${src}`,
          fix: 'Use URLs absolutas (https://...) para todas as imagens'
        })
      }
    }

    // Display block
    if (!img.includes('display') || !img.includes('block')) {
      warnings.push({
        category: 'Images',
        message: `Imagem ${index + 1} pode não ter display: block`,
        suggestion: 'Adicione style="display: block" para evitar espaços indesejados'
      })
    }

    // Dimensões
    if (!img.includes('width') || !img.includes('height')) {
      warnings.push({
        category: 'Images',
        message: `Imagem ${index + 1} não possui dimensões definidas`,
        suggestion: 'Defina width e height para evitar layout quebrado durante carregamento'
      })
    }
  })

  // Recomendações gerais sobre imagens
  if (images.length > 10) {
    recommendations.push('Considere reduzir o número de imagens (atual: ' + images.length + '). Muitas imagens podem ser bloqueadas por filtros de spam.')
  }

  recommendations.push('Use imagens otimizadas (WebP ou PNG/JPEG comprimidos) para reduzir tamanho do email.')
}

/**
 * Validações de links
 */
function validateLinks(html: string, issues: EmailIssue[], warnings: EmailWarning[]) {
  const linkRegex = /<a[^>]+>/gi
  const links = html.match(linkRegex) || []

  links.forEach((link, index) => {
    // HTTPS
    const hrefMatch = link.match(/href=["']([^"']+)["']/)
    if (hrefMatch) {
      const href = hrefMatch[1]
      if (href.startsWith('http://') && !href.includes('localhost')) {
        warnings.push({
          category: 'Security',
          message: `Link ${index + 1} usa HTTP ao invés de HTTPS`,
          suggestion: 'Use HTTPS para todos os links externos'
        })
      }

      // Links vazios ou #
      if (href === '#' || href === '') {
        issues.push({
          severity: 'medium',
          category: 'Links',
          message: `Link ${index + 1} está vazio ou apontando para #`,
          fix: 'Remova links vazios ou adicione URLs válidas'
        })
      }
    } else {
      issues.push({
        severity: 'high',
        category: 'Links',
        message: `Link ${index + 1} não possui atributo href`,
        fix: 'Adicione href="url" em todos os links'
      })
    }

    // Texto do link
    const linkText = link.replace(/<[^>]+>/g, '')
    if (linkText.length === 0) {
      warnings.push({
        category: 'Accessibility',
        message: `Link ${index + 1} não possui texto visível`,
        suggestion: 'Adicione texto descritivo aos links para melhor acessibilidade'
      })
    }
  })
}

/**
 * Validações de texto
 */
function validateText(
  html: string,
  issues: EmailIssue[],
  warnings: EmailWarning[],
  recommendations: string[]
) {
  // Remover tags HTML para análise de texto
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  // Comprimento mínimo
  if (textContent.length < 100) {
    warnings.push({
      category: 'Content',
      message: 'Email possui muito pouco texto',
      suggestion: 'Emails muito curtos podem ser marcados como spam. Considere adicionar mais conteúdo.'
    })
  }

  // Ratio texto/HTML
  const textRatio = (textContent.length / html.length) * 100
  if (textRatio < 20) {
    warnings.push({
      category: 'Content',
      message: `Ratio texto/HTML muito baixo (${textRatio.toFixed(1)}%)`,
      suggestion: 'Mantenha um bom equilíbrio entre texto e HTML (ideal: 30-60%)'
    })
  }

  // Palavras spam
  const spamWords = ['free', 'grátis', 'ganhe', 'dinheiro fácil', 'clique aqui', 'urgente']
  spamWords.forEach(word => {
    if (textContent.toLowerCase().includes(word)) {
      warnings.push({
        category: 'Spam Filter',
        message: `Contém palavra suspeita de spam: "${word}"`,
        suggestion: 'Evite usar palavras que acionam filtros de spam'
      })
    }
  })

  recommendations.push('Mantenha o texto claro, conciso e relevante para o destinatário.')
  recommendations.push('Use CTA (Call to Action) direto e específico.')
}

/**
 * Validações de acessibilidade
 */
function validateAccessibility(
  html: string,
  issues: EmailIssue[],
  warnings: EmailWarning[],
  recommendations: string[]
) {
  // Lang attribute
  if (!html.includes('lang=')) {
    issues.push({
      severity: 'medium',
      category: 'Accessibility',
      message: 'Email não possui atributo lang na tag <html>',
      fix: 'Adicione lang="pt-BR" ou lang="en-US" na tag <html>'
    })
  }

  // Role attributes em tables
  const tables = html.match(/<table[^>]*>/gi) || []
  tables.forEach((table, index) => {
    if (!table.includes('role=')) {
      warnings.push({
        category: 'Accessibility',
        message: `Table ${index + 1} não possui atributo role`,
        suggestion: 'Adicione role="presentation" em tables usadas para layout'
      })
    }
  })

  // Contraste de cores (básico)
  if (html.includes('color: #fff') || html.includes('color: white')) {
    if (!html.includes('background') && !html.includes('bg-')) {
      warnings.push({
        category: 'Accessibility',
        message: 'Texto branco sem background escuro especificado',
        suggestion: 'Sempre defina cor de fundo quando usar texto claro'
      })
    }
  }

  recommendations.push('Use tamanhos de fonte adequados (mínimo 14px para corpo do texto).')
  recommendations.push('Garanta contraste adequado entre texto e fundo (WCAG AA: 4.5:1).')
}

/**
 * Validações de compatibilidade
 */
function validateCompatibility(
  html: string,
  issues: EmailIssue[],
  warnings: EmailWarning[],
  recommendations: string[]
) {
  // CSS inline vs classes
  const hasClasses = html.includes('class=')
  const hasInlineStyles = html.includes('style=')

  if (hasClasses && !hasInlineStyles) {
    warnings.push({
      category: 'Compatibility',
      message: 'Email usa classes CSS sem estilos inline',
      suggestion: 'Prefira estilos inline para melhor compatibilidade com clientes de email'
    })
  }

  // Fontes web
  if (html.includes('@font-face') || html.includes('fonts.googleapis.com')) {
    warnings.push({
      category: 'Compatibility',
      message: 'Email usa fontes web customizadas',
      suggestion: 'Nem todos os clientes de email suportam fontes web. Defina fallbacks adequados.'
    })
  }

  // Media queries
  if (!html.includes('@media')) {
    warnings.push({
      category: 'Mobile',
      message: 'Email não possui media queries',
      suggestion: 'Adicione media queries para otimizar visualização mobile'
    })
  }

  recommendations.push('Teste em múltiplos clientes: Gmail, Outlook, Apple Mail, etc.')
  recommendations.push('Use fallbacks para recursos não suportados universalmente.')
}

/**
 * Validações de tamanho
 */
function validateSize(html: string, issues: EmailIssue[], warnings: EmailWarning[]) {
  const sizeInKB = new Blob([html]).size / 1024

  if (sizeInKB > 102) {
    issues.push({
      severity: 'high',
      category: 'Size',
      message: `Email excede 102KB (atual: ${sizeInKB.toFixed(2)}KB)`,
      fix: 'Gmail trunca emails maiores que 102KB. Reduza o tamanho do HTML.'
    })
  } else if (sizeInKB > 75) {
    warnings.push({
      category: 'Size',
      message: `Email está próximo do limite (${sizeInKB.toFixed(2)}KB de 102KB)`,
      suggestion: 'Considere otimizar o HTML para reduzir tamanho'
    })
  }

  // Linhas muito longas
  const lines = html.split('\n')
  lines.forEach((line, index) => {
    if (line.length > 998) {
      warnings.push({
        category: 'Size',
        message: `Linha ${index + 1} excede 998 caracteres`,
        suggestion: 'RFC 2822 recomenda máximo de 998 caracteres por linha'
      })
    }
  })
}

/**
 * Validações de subject
 */
function validateSubject(
  subject: string,
  issues: EmailIssue[],
  warnings: EmailWarning[],
  recommendations: string[]
) {
  // Comprimento
  if (subject.length < 10) {
    warnings.push({
      category: 'Subject',
      message: 'Subject muito curto',
      suggestion: 'Use pelo menos 10 caracteres no subject'
    })
  }

  if (subject.length > 60) {
    warnings.push({
      category: 'Subject',
      message: `Subject muito longo (${subject.length} caracteres)`,
      suggestion: 'Mantenha subject entre 40-60 caracteres para melhor visualização'
    })
  }

  // CAPS LOCK
  const capsRatio = (subject.match(/[A-Z]/g) || []).length / subject.length
  if (capsRatio > 0.5) {
    warnings.push({
      category: 'Subject',
      message: 'Subject possui muitas letras maiúsculas',
      suggestion: 'Evite CAPS LOCK excessivo para não parecer spam'
    })
  }

  // Emojis
  const emojiCount = (subject.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length
  if (emojiCount > 2) {
    warnings.push({
      category: 'Subject',
      message: `Subject possui muitos emojis (${emojiCount})`,
      suggestion: 'Use no máximo 1-2 emojis no subject'
    })
  }

  recommendations.push('Subject deve ser claro, direto e relevante ao conteúdo.')
  recommendations.push('Personalize o subject quando possível (ex: use o nome do destinatário).')
}

/**
 * Calcula score de qualidade
 */
function calculateQualityScore(issues: EmailIssue[], warnings: EmailWarning[]): number {
  let score = 100

  // Penalidades por issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 20
        break
      case 'high':
        score -= 10
        break
      case 'medium':
        score -= 5
        break
      case 'low':
        score -= 2
        break
    }
  })

  // Penalidades por warnings
  warnings.forEach(() => {
    score -= 1
  })

  return Math.max(0, Math.min(100, score))
}

/**
 * Gera relatório formatado em texto
 */
export function formatQualityReport(report: EmailQualityReport): string {
  let output = '📧 EMAIL QUALITY REPORT\n'
  output += '='.repeat(50) + '\n\n'

  // Score
  const scoreEmoji = report.score >= 90 ? '🟢' : report.score >= 70 ? '🟡' : '🔴'
  output += `${scoreEmoji} SCORE: ${report.score}/100 - ${report.passed ? 'PASSED ✅' : 'FAILED ❌'}\n\n`

  // Issues críticos
  const criticalIssues = report.issues.filter(i => i.severity === 'critical')
  if (criticalIssues.length > 0) {
    output += `🚨 CRITICAL ISSUES (${criticalIssues.length}):\n`
    criticalIssues.forEach((issue, i) => {
      output += `  ${i + 1}. [${issue.category}] ${issue.message}\n`
      if (issue.fix) output += `     Fix: ${issue.fix}\n`
    })
    output += '\n'
  }

  // Outros issues
  const otherIssues = report.issues.filter(i => i.severity !== 'critical')
  if (otherIssues.length > 0) {
    output += `⚠️  OTHER ISSUES (${otherIssues.length}):\n`
    otherIssues.forEach((issue, i) => {
      output += `  ${i + 1}. [${issue.severity.toUpperCase()} - ${issue.category}] ${issue.message}\n`
    })
    output += '\n'
  }

  // Warnings
  if (report.warnings.length > 0) {
    output += `💡 WARNINGS (${report.warnings.length}):\n`
    report.warnings.slice(0, 5).forEach((warning, i) => {
      output += `  ${i + 1}. [${warning.category}] ${warning.message}\n`
    })
    if (report.warnings.length > 5) {
      output += `  ... and ${report.warnings.length - 5} more warnings\n`
    }
    output += '\n'
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    output += `✨ RECOMMENDATIONS:\n`
    report.recommendations.forEach((rec, i) => {
      output += `  ${i + 1}. ${rec}\n`
    })
  }

  return output
}
