/**
 * Blog Scheduler - Sistema de rotação de temas por dia
 * Terça: Automação e Negócios | Quinta: Programação e IA | Sábado: Cuidados Felinos
 */

import { BLOG_CATEGORIES, BLOG_TOPICS, BLOG_SCHEDULE } from '@/types/blog'
import type { BlogTheme } from '@/types/blog'

/**
 * Determina o tema do blog baseado no dia atual
 */
export function getCurrentBlogTheme(): BlogTheme {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=domingo, 1=segunda, ..., 6=sábado
  
  // Mapeia os dias de postagem para temas
  if (dayOfWeek === 2) return 'Automação e Negócios'  // Terça
  if (dayOfWeek === 4) return 'Programação e IA'      // Quinta
  if (dayOfWeek === 6) return 'Cuidados Felinos'      // Sábado
  
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
  if (dayOfWeek === 0 || dayOfWeek === 1) return 'Automação e Negócios'  // Dom/Seg -> Terça
  if (dayOfWeek === 2 || dayOfWeek === 3) return 'Programação e IA'      // Ter/Qua -> Quinta
  if (dayOfWeek === 4 || dayOfWeek === 5) return 'Cuidados Felinos'      // Qui/Sex -> Sábado
  return 'Automação e Negócios' // Sábado -> próxima Terça
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
    'Automação e Negócios': `Professional business office scene showcasing digital transformation. Modern workspace with laptop displaying automation dashboard, clean organized desk, bright natural lighting. Corporate aesthetic with technology elements (charts, graphs, digital interfaces). Colors: Blue, white, professional tones. Style: Clean, modern, business-focused. No people in frame.`,
    
    'Programação e IA': `Modern developer workspace with multiple monitors showing code, AI interfaces, and programming environments. Sleek desk setup with mechanical keyboard, tech gadgets, soft RGB lighting. Futuristic but approachable tech aesthetic. Colors: Purple, blue, green accent lights. Style: Tech-focused, innovative, clean. No people in frame.`,
    
    'Cuidados Felinos': `Cozy, warm scene with adorable kittens in a safe, comfortable environment. Soft natural lighting, plants, comfortable cat furniture, toys. Peaceful and heartwarming atmosphere. One or two cute kittens (different breeds) in focus, showing them happy and healthy. Colors: Warm tones, pastels, natural lighting. Style: Heartwarming, cozy, pet-friendly aesthetic.`
  }
  
  return `${basePrompts[theme]} Professional blog header image for article about "${title}". High quality, web-ready. Aspect ratio: 16:9.`
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
      'desenvolvimento web',
      'inteligência artificial',
      'dicas de programação',
      'tecnologia acessível',
      'IA explicada'
    ],
    'Cuidados Felinos': [
      'cuidados com gatos',
      'saúde felina',
      'dicas para gatos',
      'bem-estar animal',
      'pets saudáveis',
      'amor felino'
    ]
  }
  
  return keywordsByTheme[theme]
}

/**
 * Verifica se hoje é um dia de postagem de blog
 */
export function isBlogPostDay(): boolean {
  const dayOfWeek = new Date().getDay()
  return dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6 // Ter, Qui, Sab
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
      tuesday: 'Automação e Negócios',
      thursday: 'Programação e IA', 
      saturday: 'Cuidados Felinos'
    }
  }
}