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
    'Automação e Negócios': `Professional business office scene showcasing digital transformation. Modern workspace with laptop displaying automation dashboard, clean organized desk, bright natural lighting. Corporate aesthetic with technology elements (charts, graphs, digital interfaces). Colors: Blue, white, professional tones. Style: Clean, modern, business-focused. No people in frame.`,
    
    'Programação e IA': `Friendly and approachable coding scene perfect for beginners. Modern laptop showing colorful code editor with HTML/CSS/JavaScript, helpful icons and illustrations around (like lightbulbs, checkmarks, beginner-friendly elements). Bright, inviting workspace with plants, coffee mug, and learning materials. Colors: Vibrant but not overwhelming - blue, green, purple accents. Style: Welcoming, educational, modern, accessible. No people in frame.`,
    
    'Cuidados Felinos': `Cozy, warm scene with adorable kittens in a safe, comfortable environment. Soft natural lighting, plants, comfortable cat furniture, toys. Peaceful and heartwarming atmosphere. One or two cute kittens (different breeds) in focus, showing them happy and healthy. Colors: Warm tones, pastels, natural lighting. Style: Heartwarming, cozy, pet-friendly aesthetic.`,
    
    'Novidades sobre IA': `Modern tech workspace with AI theme. Multiple monitors displaying AI models, neural networks, tech news websites, and futuristic interfaces. Sleek setup with ambient LED lighting (blue/purple glow). Tech gadgets, latest AI tools visualization, news headlines visible. Colors: Deep blue, purple, cyan, tech aesthetic. Style: Cutting-edge, news-focused, innovative, professional. No people in frame.`
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