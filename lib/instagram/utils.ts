/**
 * Utilitários para o sistema de Instagram
 * Funções de formatação, cálculos de datas, etc
 */

import { NICHE_CONFIG, DEFAULT_NICHE_CONFIG, PUBLICATION_DAYS, PUBLICATION_HOUR, type NicheConfig } from './constants'

/**
 * Retorna a configuração de exibição para um nicho
 */
export function getNicheDisplay(nicho: string): NicheConfig {
  return NICHE_CONFIG[nicho] || { 
    ...DEFAULT_NICHE_CONFIG,
    name: nicho 
  }
}

/**
 * Calcula a próxima data de publicação automática
 * Dias: Segunda (1), Quarta (3), Sexta (5), Domingo (0)
 * Horário: 9:00 BRT
 */
export function calculateNextPublicationDate(fromDate: Date = new Date()): Date {
  const result = new Date(fromDate)
  result.setHours(PUBLICATION_HOUR, 0, 0, 0)
  
  // Se já passou das 9:00 hoje, começar do próximo dia
  if (fromDate.getHours() >= PUBLICATION_HOUR) {
    result.setDate(result.getDate() + 1)
  }
  
  // Encontrar o próximo dia de publicação
  let daysChecked = 0
  while (daysChecked < 7) {
    if (PUBLICATION_DAYS.has(result.getDay())) {
      return result
    }
    result.setDate(result.getDate() + 1)
    daysChecked++
  }
  
  return result
}

/**
 * Formata uma data para exibição (pt-BR)
 */
export function formatDate(
  date: string | Date, 
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', options)
}

/**
 * Formata data de forma compacta (para cards)
 */
export function formatDateCompact(date: string | Date): string {
  return formatDate(date, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Valida se uma URL de imagem é válida
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Trunca texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Valida se uma data está no futuro
 */
export function isDateInFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj > new Date()
}

/**
 * Retorna o emoji de status
 */
export function getStatusEmoji(status: string): string {
  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    approved: '📅',
    published: '✅',
    failed: '❌',
    rejected: '🚫'
  }
  return statusEmojis[status] || '❓'
}

/**
 * Retorna a cor do status para badges
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500 text-white',
    approved: 'bg-blue-500 text-white',
    published: 'bg-green-500 text-white',
    failed: 'bg-red-500 text-white',
    rejected: 'bg-gray-500 text-white'
  }
  return statusColors[status] || 'bg-gray-400 text-white'
}

/**
 * Debounce function para otimizar inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Agrupa posts por nicho
 */
export function groupPostsByNiche<T extends { nicho: string }>(
  posts: T[]
): Record<string, T[]> {
  return posts.reduce((acc, post) => {
    if (!acc[post.nicho]) {
      acc[post.nicho] = []
    }
    acc[post.nicho].push(post)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Ordena posts por data (mais recentes primeiro)
 */
export function sortPostsByDate<T extends { created_at: string }>(
  posts: T[],
  ascending = false
): T[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}
