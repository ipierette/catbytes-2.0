/**
 * Conversor de Markdown para HTML
 * Suporta FAQ, tabelas, imagens, links e formatação básica
 */

export function formatMarkdown(markdown: string): string {
  // ========== PROCESS SHORTCODES FIRST ==========
  // [MANIFESTO:Texto customizado] -> Botão inline customizado
  markdown = markdown.replace(/\[MANIFESTO:([^\]]+)\]/gi, (match, text) => {
    return `<a href="/pt-BR/manifesto-ia" class="inline-flex items-center gap-1.5 mx-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm" target="_blank">🤖 ${text.trim()}</a>`
  })

  // [NEWSLETTER:Texto customizado] -> Botão inline customizado
  markdown = markdown.replace(/\[NEWSLETTER:([^\]]+)\]/gi, (match, text) => {
    return `<a href="/pt-BR/newsletter-inscricao" class="inline-flex items-center gap-1.5 mx-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm" target="_blank">📧 ${text.trim()}</a>`
  })

  // [MANIFESTO] -> Card bonito com link para o manifesto (versão sem texto customizado)
  markdown = markdown.replace(/\[MANIFESTO\]/gi, `
<div class="my-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl">
  <div class="flex items-start gap-4">
    <div class="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-2xl">
      🤖
    </div>
    <div class="flex-1">
      <h3 class="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">Manifesto da CatBytes IA</h3>
      <p class="text-gray-700 dark:text-gray-300 mb-4">Conheça nossa visão sobre inteligência artificial ética, acessível e focada em resultados reais para pequenas empresas.</p>
      <a href="/pt-BR/manifesto-ia" class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
        📜 Ler o Manifesto Completo
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </a>
    </div>
  </div>
</div>
`)

  // [NEWSLETTER] -> Card bonito com link para newsletter (versão sem texto customizado)
  markdown = markdown.replace(/\[NEWSLETTER\]/gi, `
<div class="my-8 p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-xl">
  <div class="flex items-start gap-4">
    <div class="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl">
      📧
    </div>
    <div class="flex-1">
      <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Newsletter CatBytes</h3>
      <p class="text-gray-700 dark:text-gray-300 mb-4">Receba dicas exclusivas sobre IA, automação e tecnologia direto no seu email. Conteúdo semanal sem spam!</p>
      <a href="/pt-BR/newsletter-inscricao" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
        ✉️ Inscrever-se Grátis
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </a>
    </div>
  </div>
</div>
`)

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
    .replace(/^\* (.*$)/gim, '<li class="text-gray-700 dark:text-gray-300 mb-1">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="text-gray-700 dark:text-gray-300 mb-1">$1</li>')
    
    // Quebras de parágrafo
    .replace(/\n\n/g, '</p><p class="text-gray-700 dark:text-gray-300 mb-6">')
    
    // Line breaks
    .replace(/\n/g, '<br>')

  // Wrap lists with styled containers
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)/g, '<ul class="list-disc pl-6 mb-6 space-y-1">$1</ul>')

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
  
  // Encontrar seção FAQ (mais flexível)
  const faqPatterns = [
    /##\s*Perguntas?\s*Frequentes?\s*([\s\S]*?)(?=##|$)/i,
    /##\s*FAQ\s*([\s\S]*?)(?=##|$)/i,
    /##\s*Frequently Asked Questions\s*([\s\S]*?)(?=##|$)/i,
    /##\s*Dúvidas?\s*Frequentes?\s*([\s\S]*?)(?=##|$)/i,
  ]
  
  let faqSection = ''
  for (const pattern of faqPatterns) {
    const match = markdown.match(pattern)
    if (match) {
      faqSection = match[1]
      break
    }
  }
  
  if (!faqSection) return []
  
  // Pattern 1: Perguntas com ### (H3)
  const h3Pattern = /###\s*([^\n]+\?)\s*\n+([\s\S]*?)(?=###|$)/g
  let matches = [...faqSection.matchAll(h3Pattern)]
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const question = match[1].trim()
      const answer = match[2].trim().split('\n\n')[0].trim() // Pega primeiro parágrafo
      if (question && answer) {
        faqItems.push({ question, answer })
      }
    })
    return faqItems
  }
  
  // Pattern 2: Perguntas numeradas (1. Pergunta?)
  const numberedPattern = /(\d+\.\s*[^\n?]+\?)\s*\n+([\s\S]*?)(?=\d+\.|$)/g
  matches = [...faqSection.matchAll(numberedPattern)]
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const question = match[1].replace(/^\d+\.\s*/, '').trim()
      const answer = match[2].trim().split('\n\n')[0].trim()
      if (question && answer) {
        faqItems.push({ question, answer })
      }
    })
    return faqItems
  }
  
  // Pattern 3: Perguntas em negrito (**Pergunta?**)
  const boldPattern = /\*\*([^\*]+\?)\*\*\s*\n+([\s\S]*?)(?=\*\*|$)/g
  matches = [...faqSection.matchAll(boldPattern)]
  
  if (matches.length > 0) {
    matches.forEach(match => {
      const question = match[1].trim()
      const answer = match[2].trim().split('\n\n')[0].trim()
      if (question && answer) {
        faqItems.push({ question, answer })
      }
    })
  }
  
  return faqItems
}