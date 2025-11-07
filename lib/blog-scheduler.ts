/**
 * Blog Scheduler - Sistema de rotação de temas por dia
 * Segunda: Automação e Negócios | Quinta: Dicas de Programação Web | Sábado: Cuidados Felinos | Domingo: Novidades sobre IA
 */

import { BLOG_TOPICS } from '@/types/blog'
import type { BlogTheme } from '@/types/blog'

/**
 * Determina o tema do blog baseado no dia atual
 */
export function getCurrentBlogTheme(): BlogTheme {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=domingo, 1=segunda, ..., 6=sábado
  
  // Mapeia os dias de postagem para temas
  if (dayOfWeek === 1) return 'Automação e Negócios'     // Segunda
  if (dayOfWeek === 4) return 'Programação e IA'         // Quinta (Dicas de Programação Web)
  if (dayOfWeek === 6) return 'Cuidados Felinos'         // Sábado (Gatinhos)
  if (dayOfWeek === 0) return 'Novidades sobre IA'       // Domingo (Novidades sobre IA)
  
  // Para outros dias, determina baseado no próximo dia de postagem
  return getNextScheduledTheme()
}

/**
 * Determina o próximo tema agendado baseado no dia atual
 */
export function getNextScheduledTheme(): BlogTheme {
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  // Lógica para determinar próximo tema
  if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3) return 'Programação e IA'      // Seg/Ter/Qua -> Quinta
  if (dayOfWeek === 4 || dayOfWeek === 5) return 'Cuidados Felinos'      // Qui/Sex -> Sábado
  if (dayOfWeek === 6) return 'Novidades sobre IA' // Sábado -> Domingo
  return 'Automação e Negócios' // Domingo -> próxima Segunda
}

/**
 * Seleciona um tópico aleatório para o tema especificado
 */
export function getRandomTopicForTheme(theme: BlogTheme): string {
  const topics = BLOG_TOPICS[theme]
  const randomIndex = Math.floor(Math.random() * topics.length)
  return topics[randomIndex]
}

/**
 * Gera prompt de imagem personalizado para cada tema
 */
export function generateImagePromptForTheme(theme: BlogTheme, title: string): string {
  const basePrompts = {
    'Automação e Negócios': `Cena de escritório empresarial profissional mostrando transformação digital. Espaço de trabalho moderno com laptop exibindo painel de automação, mesa limpa e organizada, iluminação natural brilhante. Estética corporativa com elementos de tecnologia (gráficos, interfaces digitais). Cores: Azul, branco, tons profissionais. Estilo: Limpo, moderno, focado em negócios. Sem pessoas na imagem.`,
    
    'Programação e IA': `Cena amigável e acessível de programação perfeita para iniciantes. Laptop moderno mostrando editor de código colorido com HTML/CSS/JavaScript, ícones úteis e ilustrações ao redor (como lâmpadas, marcações, elementos amigáveis para iniciantes). Espaço de trabalho convidativo com plantas, caneca de café e materiais de aprendizado. Cores: Vibrantes mas não excessivas - acentos azul, verde, roxo. Estilo: Acolhedor, educacional, moderno, acessível. Sem pessoas na imagem.`,
    
    'Cuidados Felinos': `Cena aconchegante e calorosa com gatinhos adoráveis em ambiente seguro e confortável. Iluminação natural suave, plantas, móveis confortáveis para gatos, brinquedos. Atmosfera pacífica e reconfortante. Um ou dois gatinhos fofos (raças diferentes) em foco, mostrando-os felizes e saudáveis. Cores: Tons quentes, pastéis, iluminação natural. Estilo: Reconfortante, acolhedor, estética pet-friendly.`,
    
    'Novidades sobre IA': `Espaço de trabalho tech moderno com tema de IA. Múltiplos monitores exibindo modelos de IA, redes neurais, sites de notícias tech e interfaces futuristas. Setup elegante com iluminação LED ambiente (brilho azul/roxo). Gadgets tech, visualização de ferramentas de IA mais recentes, manchetes de notícias visíveis. Cores: Azul profundo, roxo, ciano, estética tech. Estilo: Vanguarda, focado em notícias, inovador, profissional. Sem pessoas na imagem.`
  }
  
  return `${basePrompts[theme]} Imagem de cabeçalho de blog profissional para artigo sobre "${title}". Alta qualidade, pronta para web. Proporção: 16:9.`
}

/**
 * Gera keywords SEO específicas para cada tema
 */
export function getThemeKeywords(theme: BlogTheme): string[] {
  const keywordsByTheme = {
    'Automação e Negócios': [
      'automação empresarial',
      'transformação digital',
      'chatbots para empresas',
      'aplicações web',
      'ROI digital',
      'inovação empresarial'
    ],
    'Programação e IA': [
      'programação para iniciantes',
      'desenvolvimento web para leigos',
      'HTML CSS JavaScript básico',
      'dicas de programação',
      'aprender a programar',
      'web development fácil',
      'tutorial programação simples'
    ],
    'Cuidados Felinos': [
      'cuidados com gatos',
      'saúde felina',
      'dicas para gatos',
      'bem-estar animal',
      'pets saudáveis',
      'amor felino'
    ],
    'Novidades sobre IA': [
      'novidades inteligência artificial',
      'notícias IA',
      'novos modelos IA',
      'ferramentas IA',
      'atualizações IA',
      'tecnologia IA',
      'tendências inteligência artificial'
    ]
  }
  
  return keywordsByTheme[theme]
}

/**
 * Verifica se o dia atual é um dia de publicação de blog
 */
export function isBlogPostDay(date: Date = new Date()): boolean {
  const dayOfWeek = date.getDay()
  // Segunda (1), Quinta (4), Sábado (6), Domingo (0)
  return dayOfWeek === 1 || dayOfWeek === 4 || dayOfWeek === 6 || dayOfWeek === 0
}

/**
 * Retorna informações completas sobre o agendamento de blog
 */
export function getBlogScheduleInfo() {
  const currentTheme = getCurrentBlogTheme()
  const isPostDay = isBlogPostDay()
  const nextTheme = getNextScheduledTheme()
  
  return {
    currentTheme,
    isPostDay,
    nextTheme,
    schedule: {
      monday: 'Automação e Negócios',
      thursday: 'Programação e IA (Dicas para Leigos)',
      saturday: 'Cuidados Felinos (Gatinhos)',
      sunday: 'Novidades sobre IA'
    }
  }
}