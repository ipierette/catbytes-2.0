/**
 * Batch Topic Generator
 * Interface para geração de múltiplos tópicos com validação de similaridade
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Loader2, AlertCircle, CheckCircle, XCircle, Sparkles } from 'lucide-react'

const CATEGORIES = [
  'Automação e Negócios',
  'Programação e IA',
  'Cuidados Felinos',
  'Tech Aleatório',
] as const

type Category = typeof CATEGORIES[number]

interface GeneratedResult {
  success: boolean
  category: string
  validated: number
  duplicates: number
  similar: number
  topics: string[]
  details?: {
    duplicates: string[]
    similar: Array<{ new: string; existing: string; similarity: number }>
  }
  message?: string
}

export default function BatchTopicGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Automação e Negócios')
  const [count, setCount] = useState(30)
  const [customPrompt, setCustomPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/topics/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          count,
          prompt: customPrompt.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar tópicos')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setGenerating(false)
    }
  }

  const copyTopicsToClipboard = () => {
    if (!result?.topics) return

    const formatted = result.topics.map(t => `  '${t}',`).join('\n')
    navigator.clipboard.writeText(formatted)
    alert('✅ Tópicos copiados! Cole em types/blog.ts na array BLOG_TOPICS')
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold">Geração em Lote de Tópicos</h3>
          <p className="text-sm text-gray-500">Gere múltiplos tópicos únicos com validação de similaridade</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-4 mb-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            disabled={generating}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade de Tópicos
          </label>
          <input
            type="number"
            min={10}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(10, Math.min(100, parseInt(e.target.value) || 30)))}
            disabled={generating}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Entre 10 e 100 tópicos</p>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contexto Adicional (Opcional)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={generating}
            placeholder="Ex: Foque em startups de tecnologia, evite tópicos muito técnicos..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Direcione a IA com instruções específicas sobre o tipo de tópico desejado
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando {count} tópicos...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Gerar {count} Tópicos Únicos
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-red-900">Erro ao gerar tópicos</div>
            <div className="text-sm text-red-700 mt-1">{error}</div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Validados</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{result.validated}</div>
            </Card>

            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Similares</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">{result.similar}</div>
            </Card>

            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Duplicatas</span>
              </div>
              <div className="text-2xl font-bold text-red-900">{result.duplicates}</div>
            </Card>
          </div>

          {/* Message */}
          {result.message && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{result.message}</p>
            </div>
          )}

          {/* Topics List */}
          {result.topics.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  Tópicos Validados ({result.topics.length})
                </h4>
                <button
                  onClick={copyTopicsToClipboard}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  📋 Copiar para types/blog.ts
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {result.topics.map((topic, index) => (
                    <div key={index} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-gray-500 font-mono mt-1">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <p className="text-sm text-gray-900 flex-1">{topic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filtered Topics */}
          {result.details && (result.details.duplicates.length > 0 || result.details.similar.length > 0) && (
            <details className="border border-gray-200 rounded-lg">
              <summary className="p-4 cursor-pointer hover:bg-gray-50 font-medium text-gray-900">
                Ver Tópicos Filtrados ({result.details.duplicates.length + result.details.similar.length})
              </summary>
              <div className="p-4 border-t border-gray-200 space-y-4">
                {/* Duplicates */}
                {result.details.duplicates.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-red-900 mb-2">
                      Duplicatas Exatas ({result.details.duplicates.length})
                    </h5>
                    <div className="space-y-2">
                      {result.details.duplicates.map((dup, i) => (
                        <div key={i} className="p-2 bg-red-50 rounded text-sm text-red-900">
                          {dup}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar */}
                {result.details.similar.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-yellow-900 mb-2">
                      Muito Similares (primeiros 5)
                    </h5>
                    <div className="space-y-3">
                      {result.details.similar.map((sim, i) => (
                        <div key={i} className="p-3 bg-yellow-50 rounded">
                          <div className="text-sm text-yellow-900 mb-1">
                            <strong>Novo:</strong> {sim.new}
                          </div>
                          <div className="text-sm text-yellow-700">
                            <strong>Existente:</strong> {sim.existing}
                          </div>
                          <div className="text-xs text-yellow-600 mt-1">
                            Similaridade: {Math.round(sim.similarity * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Instructions */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h5 className="font-semibold text-purple-900 mb-2">📝 Próximos Passos</h5>
            <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
              <li>Clique em "Copiar para types/blog.ts"</li>
              <li>Abra o arquivo <code className="px-1 py-0.5 bg-purple-100 rounded">types/blog.ts</code></li>
              <li>Localize a array <code className="px-1 py-0.5 bg-purple-100 rounded">BLOG_TOPICS['{result.category}']</code></li>
              <li>Cole os novos tópicos dentro da array</li>
              <li>Salve o arquivo e faça commit das alterações</li>
            </ol>
          </div>
        </div>
      )}
    </Card>
  )
}
