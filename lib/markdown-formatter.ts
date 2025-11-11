/**
 * Conversor de Markdown para HTML
 * Suporta FAQ, tabelas, imagens, links e formatação básica
 */

export function formatMarkdown(markdown: string): string {
  // ========== DETECT FAQ SECTION FIRST (before converting to HTML) ==========
  const faqPatternsMd = [
    /^## Perguntas Frequentes$/im,
    /^## FAQ$/im, 
    /^## Frequently Asked Questions$/im,
    /^## Dúvidas Frequentes$/im
  ]
  
  let hasFaqSection = false
  let faqStartIndex = -1
  
  for (const pattern of faqPatternsMd) {
    const match = markdown.match(pattern)
    if (match && match.index !== undefined) {
      hasFaqSection = true
      faqStartIndex = match.index
      break
    }
  }

  // Primeiro, processar tabelas markdown complexas
  let html = markdown.replace(/(\|[^\n]+\|\n)+/g, (match) => {
    const lines = match.trim().split('\n')
    if (lines.length < 2) return match
    
    let table = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border-2 border-gray-300 dark:border-gray-600">'
    let isHeaderProcessed = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line.startsWith('|') || !line.endsWith('|')) continue
      
      const cells = line.split('|').slice(1, -1) // Remove primeiro e último vazio
      
      // Skip separator row (com --- )
      if (line.includes('---')) continue
      
      if (!isHeaderProcessed) {
        // Header row
        table += '<thead class="bg-gray-100 dark:bg-gray-700"><tr>'
        cells.forEach(cell => {
          table += `<th class="border border-gray-300 dark:border-gray-600 px-4 py-3 font-bold text-left text-gray-900 dark:text-gray-100">${cell.trim()}</th>`
        })
        table += '</tr></thead><tbody class="divide-y divide-gray-200 dark:divide-gray-600">'
        isHeaderProcessed = true
      } else {
        // Data row
        table += '<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">'
        cells.forEach(cell => {
          table += `<td class="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-700 dark:text-gray-300">${cell.trim()}</td>`
        })
        table += '</tr>'
      }
    }
    
    table += '</tbody></table></div>'
    return table
  })

  html = html
    // Code blocks (blocos de código com triple backticks)
    .replace(/```([a-z]*)\n?([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || 'text'
      const escapedCode = code
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;')
      
      return `<div class="code-block-wrapper my-6">
        <div class="code-block-header bg-gray-800 dark:bg-gray-900 px-4 py-2 text-xs font-mono text-gray-300 border-b border-gray-700">
          <span>${lang}</span>
        </div>
        <div class="code-block bg-gray-900 dark:bg-black p-4 overflow-x-auto">
          <code class="text-sm text-gray-100 whitespace-pre font-mono leading-relaxed">${escapedCode}</code>
        </div>
      </div>`
    })
    
    // Inline code (código inline com single backticks)
    .replace(/`([^`]+)`/g, '<code class="inline-code bg-gray-200 dark:bg-gray-700 text-catbytes-purple dark:text-catbytes-pink px-2 py-1 rounded text-sm font-mono">$1</code>')
    
    // Imagens markdown para HTML responsivo
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      // Verificar se é uma URL do Supabase ou externa válida
      const isValidImage = src.startsWith('http') || src.startsWith('/') || src.includes('supabase.co')
      if (!isValidImage) return match
      
      return `<div class="my-8 text-center"><img src="${src}" alt="${alt}" class="w-full max-w-3xl mx-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700" loading="lazy" /></div>`
    })
    
    // Headers com estilos aprimorados
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-6">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-8">$1</h1>')
    
    // Formatação de texto
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>')
    
    // Links aprimorados
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-catbytes-purple dark:text-catbytes-pink hover:text-catbytes-blue dark:hover:text-catbytes-purple underline font-medium">$1</a>')
    
    // Lists com melhor estilo
    .replace(/^\* (.*$)/gim, '<li class="text-gray-700 dark:text-gray-300 mb-2">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="text-gray-700 dark:text-gray-300 mb-2">$1</li>')
    
    // Quebras de parágrafo
    .replace(/\n\n/g, '</p><p class="text-gray-700 dark:text-gray-300 mb-6">')
    
    // Line breaks
    .replace(/\n/g, '<br>')

  // Wrap lists with styled containers
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-6 mb-6 space-y-2">$1</ul>')

  // Wrap em parágrafos se não começar com header ou lista
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<div')) {
    html = `<p class="text-gray-700 dark:text-gray-300 mb-6">${html}</p>`
  }

  // ========== WRAP FAQ SECTION IF DETECTED ==========
  if (hasFaqSection) {
    const faqPatterns = [
      /<h2[^>]*>Perguntas Frequentes<\/h2>/i,
      /<h2[^>]*>FAQ<\/h2>/i,
      /<h2[^>]*>Frequently Asked Questions<\/h2>/i,
      /<h2[^>]*>Dúvidas Frequentes<\/h2>/i
    ]
    
    for (const pattern of faqPatterns) {
      const match = html.match(pattern)
      if (match && match.index !== undefined) {
        const beforeFaq = html.substring(0, match.index)
        const fromFaq = html.substring(match.index)
        
        // Encontra o próximo h2 (se houver) ou vai até o final
        const nextH2Match = fromFaq.substring(match[0].length).match(/<h2[^>]*>/i)
        
        let faqContent
        let afterFaq = ''
        
        if (nextH2Match && nextH2Match.index !== undefined) {
          const endIndex = match[0].length + nextH2Match.index
          faqContent = fromFaq.substring(0, endIndex)
          afterFaq = fromFaq.substring(endIndex)
        } else {
          faqContent = fromFaq
        }
        
        html = beforeFaq + `<div class="blog-faq-section">${faqContent}</div>` + afterFaq
        break
      }
    }
  }

  return html
}

/**
 * Extrai itens de FAQ do markdown para estruturação de dados
 */
export function extractFaqItems(markdown: string): Array<{ question: string; answer: string }> {
  const faqItems: Array<{ question: string; answer: string }> = []
  
  // Encontrar seção FAQ
  const faqPatterns = [
    /## Perguntas Frequentes\s*([\s\S]*?)(?=##|$)/i,
    /## FAQ\s*([\s\S]*?)(?=##|$)/i,
    /## Frequently Asked Questions\s*([\s\S]*?)(?=##|$)/i,
    /## Dúvidas Frequentes\s*([\s\S]*?)(?=##|$)/i
  ]
  
  let faqSection = ''
  for (const pattern of faqPatterns) {
    const match = markdown.match(pattern)
    if (match) {
      faqSection = match[1]
      break
    }
  }
  
  if (faqSection) {
    // Extrair perguntas numeradas (formato: 1. Pergunta?)
    const questionMatches = faqSection.match(/(\d+\.\s*[^?]+\?)\s*([\s\S]*?)(?=\d+\.|$)/g)
    
    if (questionMatches) {
      questionMatches.forEach(match => {
        const [, question, answer] = match.match(/(\d+\.\s*[^?]+\?)\s*([\s\S]*)/) || []
        if (question && answer) {
          faqItems.push({
            question: question.replace(/^\d+\.\s*/, '').trim(),
            answer: answer.trim()
          })
        }
      })
    }
  }
  
  return faqItems
}