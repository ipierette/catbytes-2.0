/**
 * Constantes compartilhadas do sistema de Instagram
 * Centraliza configurações, nichos, status e outras constantes
 */

// Status disponíveis para posts
export const POST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  FAILED: 'failed',
  REJECTED: 'rejected'
} as const

export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS]

// Dias da semana para publicação automática
export const PUBLICATION_DAYS = new Set([1, 3, 5, 0]) // Segunda, Quarta, Sexta, Domingo

// Horário de publicação (13:00 BRT)
export const PUBLICATION_HOUR = 13

// Dias da semana para geração automática
export const GENERATION_DAYS = new Set([1, 2, 4, 6]) // Segunda, Terça, Quinta, Sábado

// Horário de geração (13:00 BRT)
export const GENERATION_HOUR = 13

// Configurações de nichos
export interface NicheConfig {
  name: string
  color: string
  icon: string
}

export const NICHE_CONFIG: Record<string, NicheConfig> = {
  'Escritórios de Advocacia': { 
    name: 'Advocacia', 
    color: 'bg-blue-500 text-white', 
    icon: '⚖️' 
  },
  'Clínicas Médicas': { 
    name: 'Medicina', 
    color: 'bg-red-500 text-white', 
    icon: '🏥' 
  },
  'E-commerce': { 
    name: 'E-commerce', 
    color: 'bg-purple-500 text-white', 
    icon: '🛒' 
  },
  'Restaurantes': { 
    name: 'Gastronomia', 
    color: 'bg-orange-500 text-white', 
    icon: '🍽️' 
  },
  'Academias': { 
    name: 'Fitness', 
    color: 'bg-green-500 text-white', 
    icon: '💪' 
  },
  'Salões de Beleza': { 
    name: 'Beleza', 
    color: 'bg-pink-500 text-white', 
    icon: '💇' 
  },
  'Consultórios Odontológicos': { 
    name: 'Odontologia', 
    color: 'bg-cyan-500 text-white', 
    icon: '🦷' 
  },
  'Contabilidade': { 
    name: 'Contábil', 
    color: 'bg-yellow-600 text-white', 
    icon: '💰' 
  },
  'Imobiliárias': { 
    name: 'Imóveis', 
    color: 'bg-indigo-500 text-white', 
    icon: '🏠' 
  },
  'Oficinas Mecânicas': { 
    name: 'Automotivo', 
    color: 'bg-gray-700 text-white', 
    icon: '🔧' 
  },
  'advogados': { 
    name: 'Advocacia', 
    color: 'bg-blue-500 text-white', 
    icon: '⚖️' 
  },
  'medicos': { 
    name: 'Medicina', 
    color: 'bg-red-500 text-white', 
    icon: '🏥' 
  },
  'terapeutas': { 
    name: 'Terapia', 
    color: 'bg-purple-500 text-white', 
    icon: '🧘' 
  },
  'nutricionistas': { 
    name: 'Nutrição', 
    color: 'bg-green-500 text-white', 
    icon: '🥗' 
  }
}

// Configuração padrão para nichos não mapeados
export const DEFAULT_NICHE_CONFIG: NicheConfig = {
  name: 'Geral',
  color: 'bg-slate-500 text-white',
  icon: '💼'
}

// Intervalos de refresh
export const REFRESH_INTERVALS = {
  POSTS: 60000,      // 1 minuto
  STATS: 60000,      // 1 minuto
  SETTINGS: 300000   // 5 minutos
} as const

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const

// Métodos de geração
export const GENERATION_METHODS = {
  DALLE3: 'dalle3',
  TEXT_ONLY_MANUAL: 'text-only-manual',
  BATCH_AUTO: 'batch-auto'
} as const

export type GenerationMethod = typeof GENERATION_METHODS[keyof typeof GENERATION_METHODS]
