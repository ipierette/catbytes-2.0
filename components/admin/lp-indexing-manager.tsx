'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface IndexingResult {
  lpUrl: string
  googleIndexing: {
    success: boolean
    message: string
  }
  sitemap: {
    included: boolean
    message: string
  }
  seoScore: {
    score: number
    issues: string[]
    recommendations: string[]
  }
}

export function LPIndexingManager() {
  const [slug, setSlug] = useState('')
  const [result, setResult] = useState<IndexingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReindex() {
    if (!slug.trim()) {
      setError('Digite o slug da LP')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/landing-pages/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao re-indexar')
      }

      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckStatus() {
    if (!slug.trim()) {
      setError('Digite o slug da LP')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/landing-pages/reindex?slug=${slug.trim()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao verificar status')
      }

      setResult(data.lastStatus)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function getSeoScoreBadge(score: number) {
    if (score >= 90) return <Badge className="bg-green-500">Excelente ({score})</Badge>
    if (score >= 70) return <Badge className="bg-yellow-500">Bom ({score})</Badge>
    if (score >= 50) return <Badge className="bg-orange-500">Regular ({score})</Badge>
    return <Badge className="bg-red-500">Precisa Melhorar ({score})</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Indexação de LPs</CardTitle>
          <CardDescription>
            Re-indexe LPs existentes ou verifique status de indexação no Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Slug da LP (ex: guia-automacao-consultorio)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
              disabled={loading}
            />
            <Button
              onClick={handleCheckStatus}
              disabled={loading}
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              Status
            </Button>
            <Button
              onClick={handleReindex}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Re-indexar
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4 mt-6">
              {/* URL da LP */}
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">URL da LP</p>
                <a 
                  href={result.lpUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-mono text-sm"
                >
                  {result.lpUrl}
                </a>
              </div>

              {/* Google Indexing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {result.googleIndexing.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    Google Indexing API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{result.googleIndexing.message}</p>
                </CardContent>
              </Card>

              {/* Sitemap */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {result.sitemap.included ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    Sitemap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{result.sitemap.message}</p>
                </CardContent>
              </Card>

              {/* SEO Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    SEO Score
                    {getSeoScoreBadge(result.seoScore.score)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Issues */}
                  {result.seoScore.issues.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Problemas Detectados ({result.seoScore.issues.length})
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.seoScore.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.seoScore.recommendations.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        Recomendações ({result.seoScore.recommendations.length})
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {result.seoScore.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.seoScore.issues.length === 0 && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Sem problemas detectados! LP otimizada para SEO.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Indexing */}
      <Card>
        <CardHeader>
          <CardTitle>Indexação em Lote</CardTitle>
          <CardDescription>
            Re-indexe múltiplas LPs de uma vez (útil após atualizações globais)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Em desenvolvimento. Em breve você poderá re-indexar todas as LPs de um nicho ou todas as LPs do site.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
