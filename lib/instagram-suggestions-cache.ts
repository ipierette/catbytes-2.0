/**
 * Cache de Sugestões de Posts do Instagram
 * Economiza tokens fazendo UMA chamada à API e reutilizando em todos os modais
 */

export interface InstagramSuggestion {
  nicho: string
  tema: string
  estilo: string
  coresPrincipais: string[]
  palavrasChave: string[]
  pontosVisuais: string[]
  timestamp: number
}

interface CacheEntry {
  suggestion: InstagramSuggestion
  expiresAt: number
}

// Cache em memória (persiste durante a sessão)
let cache: CacheEntry | null = null

// Tempo de expiração: 10 minutos
const CACHE_TTL = 10 * 60 * 1000

/**
 * Gera sugestões usando IA
 */
async function generateSuggestions(): Promise<InstagramSuggestion> {
  console.log('🎯 [SUGGESTIONS] Gerando novas sugestões...')

  const response = await fetch('/api/instagram/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw new Error('Falha ao gerar sugestões')
  }

  const data = await response.json()
  console.log('✅ [SUGGESTIONS] Sugestões geradas:', data)

  return {
    ...data,
    timestamp: Date.now()
  }
}

/**
 * Obtém sugestões (do cache ou gerando novas)
 */
export async function getSuggestions(forceRefresh = false): Promise<InstagramSuggestion> {
  const now = Date.now()

  // Se cache válido e não forçar refresh, retorna do cache
  if (!forceRefresh && cache && cache.expiresAt > now) {
    console.log('♻️ [SUGGESTIONS] Usando cache (expira em ' + 
      Math.round((cache.expiresAt - now) / 1000) + 's)')
    return cache.suggestion
  }

  // Gera novas sugestões
  const suggestion = await generateSuggestions()

  // Salva no cache
  cache = {
    suggestion,
    expiresAt: now + CACHE_TTL
  }

  return suggestion
}

/**
 * Limpa o cache manualmente
 */
export function clearSuggestionsCache() {
  console.log('🗑️ [SUGGESTIONS] Cache limpo')
  cache = null
}

/**
 * Verifica se existe cache válido
 */
export function hasCachedSuggestions(): boolean {
  return cache !== null && cache.expiresAt > Date.now()
}

/**
 * Hook React para usar sugestões
 */
export function useSuggestionsCache() {
  return {
    getSuggestions,
    clearCache: clearSuggestionsCache,
    hasCached: hasCachedSuggestions
  }
}
