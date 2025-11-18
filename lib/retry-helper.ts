/**
 * Retry Helper with Exponential Backoff
 * 
 * Utilitário para retry automático de operações que podem falhar temporariamente.
 * Ideal para chamadas de API externas, operações de rede, etc.
 */

/**
 * Aguarda um determinado tempo em milissegundos
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface RetryOptions {
  /**
   * Número máximo de tentativas (incluindo a primeira)
   * @default 3
   */
  maxRetries?: number

  /**
   * Delay inicial em milissegundos
   * @default 1000 (1 segundo)
   */
  initialDelay?: number

  /**
   * Multiplicador para exponential backoff
   * @default 2
   */
  backoffMultiplier?: number

  /**
   * Delay máximo em milissegundos
   * @default 30000 (30 segundos)
   */
  maxDelay?: number

  /**
   * Função para determinar se deve fazer retry baseado no erro
   * Se não fornecida, sempre tenta retry
   */
  shouldRetry?: (error: Error, attempt: number) => boolean

  /**
   * Callback executado antes de cada retry
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void
}

/**
 * Executa uma operação com retry automático e exponential backoff
 * 
 * @example
 * ```typescript
 * const result = await retryOperation(
 *   () => fetch('https://api.example.com/data'),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry ${attempt} after ${delay}ms due to:`, error.message)
 *     }
 *   }
 * )
 * ```
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 30000,
    shouldRetry,
    onRetry
  } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Última tentativa - não fazer retry
      if (attempt === maxRetries) {
        throw lastError
      }

      // Verificar se deve fazer retry
      if (shouldRetry && !shouldRetry(lastError, attempt)) {
        throw lastError
      }

      // Calcular delay com exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      )

      // Callback antes do retry
      if (onRetry) {
        onRetry(lastError, attempt, delay)
      }

      console.log(`[Retry Helper] Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }

  // Nunca deve chegar aqui, mas TypeScript requer
  throw lastError || new Error('Retry operation failed')
}

/**
 * Wrapper para retries específicos de fetch/HTTP
 * Apenas faz retry para erros de rede ou 5xx
 */
export async function retryFetch(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryOperation(
    async () => {
      const response = await fetch(url, options)
      
      // Se é 5xx, throw para trigger retry
      if (response.status >= 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      shouldRetry: (error, attempt) => {
        // Retry apenas para erros de rede ou 5xx
        const message = error.message.toLowerCase()
        const isNetworkError = message.includes('fetch') || 
                               message.includes('network') ||
                               message.includes('timeout') ||
                               message.includes('econnrefused')
        const isServerError = message.includes('http 5')
        
        return isNetworkError || isServerError
      },
      ...retryOptions
    }
  )
}

/**
 * Retry específico para operações de banco de dados
 * Retry apenas para deadlocks, timeouts, connection issues
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retryOperation(operation, {
    maxRetries: 3,
    initialDelay: 500,
    shouldRetry: (error) => {
      const message = error.message.toLowerCase()
      return message.includes('deadlock') ||
             message.includes('timeout') ||
             message.includes('connection') ||
             message.includes('too many connections')
    },
    onRetry: (error, attempt, delay) => {
      console.log(`[DB Retry] Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`)
    },
    ...retryOptions
  })
}

/**
 * Retry específico para APIs externas (Instagram, LinkedIn, OpenAI)
 */
export async function retryExternalAPI<T>(
  apiName: string,
  operation: () => Promise<T>,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retryOperation(operation, {
    maxRetries: 3,
    initialDelay: 2000,
    backoffMultiplier: 2,
    maxDelay: 10000,
    shouldRetry: (error, attempt) => {
      const message = error.message.toLowerCase()
      
      // Não fazer retry para erros de autenticação ou bad request
      if (message.includes('401') || 
          message.includes('403') ||
          message.includes('400') ||
          message.includes('unauthorized') ||
          message.includes('forbidden')) {
        return false
      }
      
      // Retry para rate limits, server errors, network issues
      return message.includes('429') ||
             message.includes('5') ||
             message.includes('timeout') ||
             message.includes('network')
    },
    onRetry: (error, attempt, delay) => {
      console.log(`[${apiName} Retry] Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`)
    },
    ...retryOptions
  })
}
