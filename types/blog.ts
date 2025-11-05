// =====================================================
// Blog Types - Type-safe blog system
// =====================================================

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  keywords: string[]
  seo_title: string | null
  seo_description: string | null
  published: boolean
  created_at: string
  updated_at: string
  views: number
  author: string
  category: string
  tags: string[]
  ai_model: string
  generation_prompt: string | null
  locale?: string // 'pt-BR' or 'en-US'
  translated_from?: string | null // ID of the original post if this is a translation
}

export interface BlogPostInsert {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  keywords: string[]
  seo_title?: string
  seo_description?: string
  published?: boolean
  author?: string
  category?: string
  tags?: string[]
  ai_model?: string
  generation_prompt?: string
  locale?: string // 'pt-BR' or 'en-US'
  translated_from?: string | null // ID of the original post if this is a translation
}

export interface BlogPostUpdate {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  cover_image_url?: string
  keywords?: string[]
  seo_title?: string
  seo_description?: string
  published?: boolean
  category?: string
  tags?: string[]
}

export interface BlogGenerationLog {
  id: string
  post_id: string | null
  status: 'success' | 'error' | 'pending'
  error_message: string | null
  generation_time_ms: number | null
  created_at: string
}

export interface PaginatedBlogPosts {
  posts: BlogPost[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// AI Generation Types
export interface AIGeneratedPost {
  title: string
  excerpt: string
  content: string
  keywords: string[]
  seo_title: string
  seo_description: string
  category: string
  tags: string[]
}

export interface BlogGenerationRequest {
  topic?: string
  keywords?: string[]
  category?: string
}

export interface BlogGenerationResponse {
  success: boolean
  post?: BlogPost
  error?: string
  generationTime?: number
}

// SEO Keywords for blog automation
export const SEO_KEYWORDS = [
  'automação com IA',
  'chatbots personalizados',
  'aplicações web inteligentes',
  'serviços digitais',
  'desenvolvimento web',
  'inteligência artificial',
  'automação empresarial',
  'transformação digital',
  'soluções tecnológicas',
  'inovação digital',
  'chatbot para empresas',
  'assistentes virtuais',
  'API de IA',
  'integração de IA',
  'desenvolvimento de software',
] as const

// Blog Theme Categories (rotating by day)
export const BLOG_CATEGORIES = [
  'Automação e Negócios', // Terça-feira - Para clientes e recrutadores
  'Programação e IA',     // Quinta-feira - Dicas técnicas acessíveis  
  'Cuidados Felinos',     // Sábado - Gatinhos e cuidados
] as const

export type BlogTheme = typeof BLOG_CATEGORIES[number]

// Schedule: Tuesday (Automação), Thursday (Programação), Saturday (Gatinhos)
export const BLOG_SCHEDULE = {
  2: 'Automação e Negócios', // Terça
  4: 'Programação e IA',     // Quinta  
  6: 'Cuidados Felinos',     // Sábado
} as const

// Topic ideas for each theme
export const BLOG_TOPICS = {
  'Automação e Negócios': [
    'Por que toda empresa precisa de automação em 2024',
    'Como um site profissional aumenta sua credibilidade',
    'Chatbots: o segredo para atendimento 24/7',
    'ROI de aplicações web: vale a pena investir?',
    'Transformação digital para pequenas empresas',
    'Como a IA pode revolucionar seu negócio',
    'Sites responsivos: por que são essenciais hoje',
    'Automação de vendas: ganhe mais vendendo menos',
    'Portfolio online: sua vitrine digital profissional',
    'Como escolher a tecnologia certa para sua empresa',
  ],
  'Programação e IA': [
    'JavaScript moderno: recursos que todo dev deveria conhecer',
    'Como começar com Inteligência Artificial em 2024',
    'React vs Vue: qual framework escolher?',
    'APIs REST: guia completo para iniciantes',
    'Machine Learning explicado de forma simples',
    'Git: comandos essenciais que todo programador deve saber',
    'TypeScript: por que você deveria usar',
    'Algoritmos básicos explicados com exemplos práticos',
    'Como estruturar um projeto web profissional',
    'Tendências em desenvolvimento web para 2024',
  ],
  'Cuidados Felinos': [
    'Primeiros cuidados com filhotes de gato',
    'Como criar um ambiente seguro para gatos',
    'Alimentação felina: guia completo por idade',
    'Sinais de que seu gato precisa de veterinário',
    'Como socializar gatos com outros pets',
    'Brincadeiras essenciais para o bem-estar felino',
    'Cuidados com gatos idosos: amor na terceira idade',
    'Como identificar o stress em felinos',
    'Vacinação felina: cronograma essencial',
    'Plantas tóxicas para gatos: lista de cuidados',
  ]
} as const
