/**
 * Rate Limiter
 * 
 * Sistema para respeitar limites de taxa das APIs externas
 * Previne erros 429 (Too Many Requests) e suspensões de conta
 */

interface RateLimitConfig {
  /**
   * Máximo de requisições permitidas
   */
  max: number

  /**
   * Janela de tempo em milissegundos
   */
  window: number

  /**
   * Nome do serviço (para logging)
   */
  name: string
}

interface RequestRecord {
  timestamp: number
}

export class RateLimiter {
  private requests: RequestRecord[] = []
  private readonly config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Verifica se pode fazer uma requisição agora
   */
  canMakeRequest(): boolean {
    this.cleanOldRequests()
    return this.requests.length < this.config.max
  }

  /**
   * Retorna quanto tempo (ms) deve esperar antes da próxima requisição
   */
  getWaitTime(): number {
    this.cleanOldRequests()
    
    if (this.requests.length < this.config.max) {
      return 0
    }
    
    // Pegar a requisição mais antiga
    const oldestRequest = this.requests[0]
    if (!oldestRequest) return 0
    
    const timeUntilExpire = this.config.window - (Date.now() - oldestRequest.timestamp)
    return Math.max(0, timeUntilExpire)
  }

  /**
   * Registra uma nova requisição
   */
  recordRequest(): void {
    this.cleanOldRequests()
    this.requests.push({ timestamp: Date.now() })
  }

  /**
   * Aguarda até que seja possível fazer uma requisição
   */
  async waitForSlot(): Promise<void> {
    const waitTime = this.getWaitTime()
    
    if (waitTime > 0) {
      console.log(`[${this.config.name}] Rate limit reached. Waiting ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Executa uma operação respeitando o rate limit
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    await this.waitForSlot()
    this.recordRequest()
    return operation()
  }

  /**
   * Remove requisições antigas (fora da janela)
   */
  private cleanOldRequests(): void {
    const now = Date.now()
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.config.window
    )
  }

  /**
   * Retorna estatísticas do rate limiter
   */
  getStats() {
    this.cleanOldRequests()
    return {
      current: this.requests.length,
      max: this.config.max,
      remaining: this.config.max - this.requests.length,
      window: this.config.window,
      percentUsed: (this.requests.length / this.config.max) * 100,
      canMakeRequest: this.canMakeRequest(),
      waitTime: this.getWaitTime()
    }
  }

  /**
   * Reseta o rate limiter
   */
  reset(): void {
    this.requests = []
    console.log(`[${this.config.name}] Rate limiter reset`)
  }
}

/**
 * Rate limiters globais para cada serviço
 */
export const rateLimiters = {
  /**
   * Instagram Graph API
   * Limite: 200 chamadas por hora por usuário
   * Ref: https://developers.facebook.com/docs/graph-api/overview/rate-limiting
   */
  instagram: new RateLimiter({
    name: 'Instagram API',
    max: 200,
    window: 60 * 60 * 1000 // 1 hora
  }),

  /**
   * OpenAI API
   * Limite: Varia por tier, usando 500/min como padrão conservador
   * Ref: https://platform.openai.com/docs/guides/rate-limits
   */
  openai: new RateLimiter({
    name: 'OpenAI API',
    max: 500,
    window: 60 * 1000 // 1 minuto
  }),

  /**
   * LinkedIn API
   * Limite: 100 posts por dia (Community Management API)
   * Ref: https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api
   */
  linkedin: new RateLimiter({
    name: 'LinkedIn API',
    max: 100,
    window: 24 * 60 * 60 * 1000 // 1 dia
  }),

  /**
   * DALL-E API (OpenAI)
   * Limite separado para gerenciamento de custos
   * Limite: 50 imagens por minuto (tier 1)
   */
  dalle: new RateLimiter({
    name: 'DALL-E API',
    max: 50,
    window: 60 * 1000 // 1 minuto
  }),

  /**
   * Resend Email API
   * Limite: 100 emails por dia (free tier)
   */
  resend: new RateLimiter({
    name: 'Resend API',
    max: 100,
    window: 24 * 60 * 60 * 1000 // 1 dia
  })
}

/**
 * Helper para executar operação com rate limiting específico
 */
export async function withRateLimit<T>(
  service: keyof typeof rateLimiters,
  operation: () => Promise<T>
): Promise<T> {
  return rateLimiters[service].execute(operation)
}

/**
 * Retorna estatísticas de todos os rate limiters
 */
export function getAllRateLimitStats() {
  return {
    instagram: rateLimiters.instagram.getStats(),
    openai: rateLimiters.openai.getStats(),
    linkedin: rateLimiters.linkedin.getStats(),
    dalle: rateLimiters.dalle.getStats(),
    resend: rateLimiters.resend.getStats()
  }
}
