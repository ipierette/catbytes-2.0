/**
 * Circuit Breaker Pattern
 * 
 * Detecta quando uma operação está falhando consistentemente e 
 * "abre o circuito" para evitar sobrecarga e economizar recursos.
 * 
 * Estados:
 * - CLOSED: Funcionando normalmente
 * - OPEN: Circuito aberto (muitas falhas), bloqueia requisições
 * - HALF_OPEN: Testando se serviço voltou (permite 1 requisição)
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerOptions {
  /**
   * Número de falhas consecutivas antes de abrir o circuito
   * @default 5
   */
  failureThreshold?: number

  /**
   * Janela de tempo (ms) para contar falhas
   * @default 60000 (1 minuto)
   */
  failureWindow?: number

  /**
   * Tempo (ms) que o circuito fica aberto antes de tentar novamente
   * @default 30000 (30 segundos)
   */
  cooldownPeriod?: number

  /**
   * Número de sucessos consecutivos necessários para fechar o circuito
   * @default 2
   */
  successThreshold?: number

  /**
   * Callback quando circuito muda de estado
   */
  onStateChange?: (from: CircuitState, to: CircuitState) => void

  /**
   * Nome do circuito (para logging)
   */
  name?: string
}

interface FailureRecord {
  timestamp: number
  error: Error
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failures: FailureRecord[] = []
  private consecutiveSuccesses = 0
  private lastOpenTime = 0
  private readonly options: Required<CircuitBreakerOptions>

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      failureWindow: options.failureWindow ?? 60000,
      cooldownPeriod: options.cooldownPeriod ?? 30000,
      successThreshold: options.successThreshold ?? 2,
      onStateChange: options.onStateChange ?? (() => {}),
      name: options.name ?? 'CircuitBreaker'
    }
  }

  /**
   * Executa uma operação através do circuit breaker
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Se circuito está aberto, verificar se pode tentar novamente
    if (this.state === 'OPEN') {
      const timeSinceOpen = Date.now() - this.lastOpenTime
      
      if (timeSinceOpen < this.options.cooldownPeriod) {
        throw new Error(
          `[${this.options.name}] Circuit is OPEN. ` +
          `Retry in ${Math.ceil((this.options.cooldownPeriod - timeSinceOpen) / 1000)}s`
        )
      }
      
      // Cooldown passou, tentar estado HALF_OPEN
      this.changeState('HALF_OPEN')
    }

    try {
      const result = await operation()
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Registra uma falha
   */
  private recordFailure(error: Error): void {
    const now = Date.now()
    
    // Adicionar falha
    this.failures.push({ timestamp: now, error })
    
    // Limpar falhas antigas (fora da janela)
    this.failures = this.failures.filter(
      f => now - f.timestamp < this.options.failureWindow
    )
    
    // Resetar sucessos consecutivos
    this.consecutiveSuccesses = 0
    
    console.error(`[${this.options.name}] Failure recorded: ${error.message}`)
    console.log(`[${this.options.name}] Failures in window: ${this.failures.length}/${this.options.failureThreshold}`)
    
    // Se HALF_OPEN e falhou, voltar para OPEN
    if (this.state === 'HALF_OPEN') {
      this.changeState('OPEN')
      this.lastOpenTime = now
      return
    }
    
    // Se atingiu threshold, abrir circuito
    if (this.state === 'CLOSED' && this.failures.length >= this.options.failureThreshold) {
      this.changeState('OPEN')
      this.lastOpenTime = now
    }
  }

  /**
   * Registra um sucesso
   */
  private recordSuccess(): void {
    // Limpar falhas antigas
    const now = Date.now()
    this.failures = this.failures.filter(
      f => now - f.timestamp < this.options.failureWindow
    )
    
    this.consecutiveSuccesses++
    
    console.log(`[${this.options.name}] Success recorded. Consecutive: ${this.consecutiveSuccesses}/${this.options.successThreshold}`)
    
    // Se estava HALF_OPEN e teve sucessos suficientes, fechar circuito
    if (
      this.state === 'HALF_OPEN' &&
      this.consecutiveSuccesses >= this.options.successThreshold
    ) {
      this.changeState('CLOSED')
      this.failures = []
      this.consecutiveSuccesses = 0
    }
  }

  /**
   * Muda o estado do circuito
   */
  private changeState(newState: CircuitState): void {
    const oldState = this.state
    
    if (oldState === newState) return
    
    this.state = newState
    console.log(`[${this.options.name}] State changed: ${oldState} → ${newState}`)
    
    this.options.onStateChange(oldState, newState)
  }

  /**
   * Retorna o estado atual do circuito
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Retorna estatísticas do circuito
   */
  getStats() {
    return {
      state: this.state,
      failures: this.failures.length,
      consecutiveSuccesses: this.consecutiveSuccesses,
      isOpen: this.state === 'OPEN',
      cooldownRemaining: this.state === 'OPEN'
        ? Math.max(0, this.options.cooldownPeriod - (Date.now() - this.lastOpenTime))
        : 0
    }
  }

  /**
   * Reseta o circuit breaker manualmente
   */
  reset(): void {
    this.changeState('CLOSED')
    this.failures = []
    this.consecutiveSuccesses = 0
    this.lastOpenTime = 0
    console.log(`[${this.options.name}] Circuit breaker reset`)
  }
}

/**
 * Circuit breakers globais para serviços externos
 */
export const circuitBreakers = {
  instagram: new CircuitBreaker({
    name: 'Instagram API',
    failureThreshold: 5,
    failureWindow: 60000,
    cooldownPeriod: 30000,
    successThreshold: 2,
    onStateChange: (from, to) => {
      if (to === 'OPEN') {
        console.error('⚠️ Instagram API circuit breaker OPENED - too many failures')
      } else if (to === 'CLOSED') {
        console.log('✅ Instagram API circuit breaker CLOSED - service recovered')
      }
    }
  }),

  linkedin: new CircuitBreaker({
    name: 'LinkedIn API',
    failureThreshold: 5,
    failureWindow: 60000,
    cooldownPeriod: 30000,
    successThreshold: 2,
    onStateChange: (from, to) => {
      if (to === 'OPEN') {
        console.error('⚠️ LinkedIn API circuit breaker OPENED - too many failures')
      } else if (to === 'CLOSED') {
        console.log('✅ LinkedIn API circuit breaker CLOSED - service recovered')
      }
    }
  }),

  openai: new CircuitBreaker({
    name: 'OpenAI API',
    failureThreshold: 3, // Mais sensível para OpenAI (caro)
    failureWindow: 60000,
    cooldownPeriod: 60000, // Cooldown maior (1 min)
    successThreshold: 3,
    onStateChange: (from, to) => {
      if (to === 'OPEN') {
        console.error('⚠️ OpenAI API circuit breaker OPENED - too many failures')
      } else if (to === 'CLOSED') {
        console.log('✅ OpenAI API circuit breaker CLOSED - service recovered')
      }
    }
  }),

  database: new CircuitBreaker({
    name: 'Database',
    failureThreshold: 10, // Menos sensível para DB local
    failureWindow: 30000,
    cooldownPeriod: 10000, // Cooldown curto (10s)
    successThreshold: 2,
    onStateChange: (from, to) => {
      if (to === 'OPEN') {
        console.error('🔴 Database circuit breaker OPENED - critical issue!')
      } else if (to === 'CLOSED') {
        console.log('✅ Database circuit breaker CLOSED - connection recovered')
      }
    }
  })
}

/**
 * Helper para executar operação com circuit breaker específico
 */
export async function withCircuitBreaker<T>(
  service: keyof typeof circuitBreakers,
  operation: () => Promise<T>
): Promise<T> {
  return circuitBreakers[service].execute(operation)
}
