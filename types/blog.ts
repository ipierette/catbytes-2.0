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
  meta_description: string | null // SEO meta description (50-160 chars)
  canonical_url: string | null // Canonical URL for SEO
  published: boolean
  status: 'draft' | 'published' | 'scheduled' | 'archived' // Post status
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
  deleted_at?: string | null // Soft delete timestamp
  scheduled_at?: string | null // Scheduled publication date
  image_prompt?: string | null // AI prompt for cover image generation
  content_image_prompts?: string[] | null // AI prompts for content images
  highlight?: string | null // Custom highlight text for sidebar (max 300 chars)
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
  meta_description?: string
  canonical_url?: string
  published?: boolean
  status?: 'draft' | 'published' | 'scheduled' | 'archived'
  author?: string
  category?: string
  tags?: string[]
  ai_model?: string
  generation_prompt?: string
  locale?: string // 'pt-BR' or 'en-US'
  translated_from?: string | null // ID of the original post if this is a translation
  scheduled_at?: string | null
  image_prompt?: string | null // AI prompt for cover image generation
  content_image_prompts?: string[] | null // AI prompts for content images
  highlight?: string | null // Custom highlight text for sidebar (max 300 chars)
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
  meta_description?: string
  canonical_url?: string
  published?: boolean
  status?: 'draft' | 'published' | 'scheduled' | 'archived'
  category?: string
  tags?: string[]
  scheduled_at?: string | null
  highlight?: string | null // Custom highlight text for sidebar (max 300 chars)
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
  sources?: Array<{
    name: string
    url: string
  }>
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

// Image Text Overlay Types
export interface ImageTextSettings {
  fontSize: number
  fontFamily: string
  color: string
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  isBold?: boolean
  isItalic?: boolean
}

export interface CustomBlogPostRequest {
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  cover_image_url: string
  imageText?: string
  imageSettings?: ImageTextSettings
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
  'Automação e Negócios', // Segunda-feira - Para clientes e recrutadores
  'Programação e IA',     // Quinta-feira - Dicas de programação web fullstack para leigos
  'Cuidados Felinos',     // Sábado - Gatinhos com fotos acolhedoras
  'Tech Aleatório',       // Domingo - Tutoriais, SEO, marketing digital, tendências tech
] as const

export type BlogTheme = typeof BLOG_CATEGORIES[number]

// Schedule: Monday, Thursday, Saturday, Sunday
export const BLOG_SCHEDULE = {
  1: 'Automação e Negócios', // Segunda
  4: 'Programação e IA',     // Quinta
  6: 'Cuidados Felinos',     // Sábado
  0: 'Tech Aleatório',       // Domingo
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
    'O que é HTML? Guia para quem nunca programou',
    'CSS para iniciantes: deixando seu site bonito',
    'JavaScript explicado: o que ele faz no seu navegador?',
    'React para iniciantes: criando interfaces modernas',
    'Angular vs React vs Vue: qual escolher?',
    'Node.js: JavaScript no back-end explicado',
    'SQL básico: entendendo bancos de dados',
    'MongoDB: quando usar banco de dados NoSQL',
    'APIs REST: conectando front-end e back-end',
    'Git e GitHub: salvando seu código na nuvem',
    'TypeScript: JavaScript com superpoderes',
    'Next.js: framework React para produção',
    'Express.js: criando servidores com Node',
    'Tailwind CSS: estilização rápida e moderna',
    'Docker: empacotando aplicações explicado simples',
    'N8N: automação visual sem código',
    'Zapier vs N8N: qual ferramenta de automação usar',
    'Webhooks: o que são e como funcionam',
    'JWT: autenticação em APIs explicada',
    'Deploy: colocando sua aplicação online (Vercel, Netlify)',
    'Firebase: back-end pronto para seu app',
    'GraphQL: alternativa moderna ao REST',
    'Redux: gerenciamento de estado em React',
    'Python para web: Flask e Django para iniciantes',
    'Responsividade: design para todos os dispositivos',
    'SEO para desenvolvedores: seu site no Google',
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
  ],
  'Tech Aleatório': [
    'SEO para iniciantes: rankeie seu site no Google',
    'Marketing digital: estratégias essenciais para 2024',
    'Next.js vs Remix: qual framework escolher?',
    'Tailwind CSS: guia completo de utilitários',
    'Google Analytics 4: configuração passo a passo',
    'TypeScript: melhores práticas e padrões',
    'Docker para desenvolvedores: tutorial prático',
    'Vercel vs Netlify: qual plataforma de deploy usar?',
    'Git avançado: rebase, cherry-pick e workflows',
    'Progressive Web Apps: transforme seu site em app',
    'Web Vitals: otimize performance para SEO',
    'Accessibilidade web: WCAG e melhores práticas',
    'Ferramentas de produtividade para devs em 2024',
    'React Server Components: o futuro do React',
    'Database design: SQL vs NoSQL na prática',
    'CI/CD com GitHub Actions: automatize deploys',
    'Content Marketing: crie conteúdo que converte',
    'Email marketing: ferramentas e estratégias',
    'Headless CMS: Strapi, Sanity e Contentful',
    'API Security: proteja suas aplicações',
  ]
} as const
