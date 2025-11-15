'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, CheckCircle2, ExternalLink, FileText } from 'lucide-react'
import type { LPRichContent } from '@/lib/lp-content-generator'
import type { NicheValue } from '@/lib/landing-pages-constants'

interface RichLPGeneratorProps {
  nicho: NicheValue
}

export function RichLPGenerator({ nicho }: RichLPGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [generatedLP, setGeneratedLP] = useState<LPRichContent | null>(null)
  const [selectedTipo, setSelectedTipo] = useState<string>('')

  // Busca sugestões de LPs
  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/landing-pages/generate-rich?nicho=${nicho}`)
      const data = await res.json()
      if (data.success) {
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
    }
  }

  // Gera LP rica
  const handleGenerate = async (tipo: string) => {
    setLoading(true)
    setSelectedTipo(tipo)
    setGeneratedLP(null)

    try {
      const res = await fetch('/api/landing-pages/generate-rich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, tipo })
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedLP(data.content)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Gerador de LPs Ricas (SEO + Backlinks)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Crie landing pages completas otimizadas para ranqueamento e link building
          </p>
        </div>
        
        {suggestions.length === 0 && (
          <Button onClick={fetchSuggestions} variant="outline">
            Ver Sugestões
          </Button>
        )}
      </div>

      {/* Sugestões de LPs */}
      {suggestions.length > 0 && !generatedLP && (
        <div className="grid md:grid-cols-2 gap-4">
          {suggestions.map((sug, idx) => (
            <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Badge 
                    variant={
                      sug.prioridade === 'alta' ? 'default' :
                      sug.prioridade === 'média' ? 'secondary' : 'outline'
                    }
                    className="mb-2"
                  >
                    {sug.prioridade === 'alta' ? '🔥 Alta Prioridade' :
                     sug.prioridade === 'média' ? '⭐ Média Prioridade' : '💡 Baixa Prioridade'}
                  </Badge>
                  <h4 className="font-semibold text-sm">{sug.titulo}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {sug.tipo === 'guia' && '📚 Conteúdo aprofundado ideal para ranquear'}
                    {sug.tipo === 'calculadora' && '🧮 Ferramenta interativa que gera backlinks'}
                    {sug.tipo === 'checklist' && '✅ Lista prática que outros vão compartilhar'}
                    {sug.tipo === 'comparativo' && '⚖️ Análise completa que vira referência'}
                    {sug.tipo === 'case-study' && '📊 Estudo real com dados concretos'}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleGenerate(sug.tipo)}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading && selectedTipo === sug.tipo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Esta LP
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* LP Gerada - Preview */}
      {generatedLP && (
        <div className="space-y-6">
          {/* Métricas */}
          <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="font-bold text-green-900 dark:text-green-100">LP Rica Gerada com Sucesso!</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {generatedLP.secoes.reduce((acc, s) => 
                    acc + s.conteudo.split(' ').length + (s.items?.join(' ').split(' ').length || 0), 
                    generatedLP.introducao.split(' ').length
                  )}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Palavras</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {generatedLP.secoes.length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Seções H2</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {generatedLP.linksInternos.length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Links Internos</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {generatedLP.faq.length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">FAQs</div>
              </div>
            </div>
          </Card>

          {/* SEO Info */}
          <Card className="p-6">
            <h4 className="font-bold mb-3">🎯 Otimização SEO</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">Title Tag:</span>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{generatedLP.title}</p>
                <Badge variant="outline" className="mt-1">
                  {generatedLP.title.length} caracteres
                </Badge>
              </div>
              
              <div>
                <span className="font-semibold">Meta Description:</span>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{generatedLP.metaDescription}</p>
                <Badge variant="outline" className="mt-1">
                  {generatedLP.metaDescription.length} caracteres
                </Badge>
              </div>
              
              <div>
                <span className="font-semibold">Slug:</span>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded ml-2">
                  /lp/{generatedLP.slug}
                </code>
              </div>
              
              <div>
                <span className="font-semibold">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {generatedLP.keywords.map((kw, idx) => (
                    <Badge key={idx} variant="secondary">{kw}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Estrutura de Conteúdo */}
          <Card className="p-6">
            <h4 className="font-bold mb-3">📝 Estrutura do Conteúdo</h4>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-semibold text-blue-700 dark:text-blue-300">H1: {generatedLP.h1}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {generatedLP.introducao.substring(0, 200)}...
                </p>
              </div>

              {generatedLP.secoes.slice(0, 3).map((secao, idx) => (
                <div key={idx} className="border-l-4 border-purple-500 pl-4">
                  <h6 className="font-semibold text-purple-700 dark:text-purple-300">
                    H2: {secao.h2}
                  </h6>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {secao.conteudo.substring(0, 150)}...
                  </p>
                  {secao.items && (
                    <div className="mt-2 text-xs text-gray-500">
                      • {secao.items.length} itens de lista
                    </div>
                  )}
                </div>
              ))}
              
              {generatedLP.secoes.length > 3 && (
                <p className="text-sm text-gray-500 italic">
                  + {generatedLP.secoes.length - 3} seções adicionais
                </p>
              )}
            </div>
          </Card>

          {/* Recurso Destaque */}
          <Card className="p-6 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
            <h4 className="font-bold mb-3 text-purple-900 dark:text-purple-100">
              ✨ Recurso Linkável Destaque
            </h4>
            <div className="space-y-2">
              <Badge variant="default">{generatedLP.recursoDestaque.tipo}</Badge>
              <h5 className="font-semibold text-purple-800 dark:text-purple-200">
                {generatedLP.recursoDestaque.titulo}
              </h5>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {generatedLP.recursoDestaque.descricao}
              </p>
            </div>
          </Card>

          {/* Links Internos */}
          <Card className="p-6">
            <h4 className="font-bold mb-3">🔗 Link Building Interno Automático</h4>
            <div className="space-y-2">
              {generatedLP.linksInternos.map((link, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <ExternalLink className="w-4 h-4 mt-1 text-blue-500" />
                  <div className="flex-1 text-sm">
                    <div className="font-semibold">{link.texto}</div>
                    <code className="text-xs text-gray-600 dark:text-gray-400">{link.url}</code>
                    <div className="text-xs text-gray-500 mt-1">
                      Inserir na: {link.contexto} | Tipo: {link.tipo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* FAQ */}
          <Card className="p-6">
            <h4 className="font-bold mb-3">❓ FAQ (Otimizado para Featured Snippets)</h4>
            <div className="space-y-3">
              {generatedLP.faq.map((item, idx) => (
                <div key={idx} className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                  <h6 className="font-semibold text-sm">{item.pergunta}</h6>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.resposta}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* CTAs */}
          <Card className="p-6">
            <h4 className="font-bold mb-3">🎯 CTAs Estratégicos</h4>
            <div className="space-y-2">
              {generatedLP.ctas.map((cta, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <Badge variant={cta.tipo === 'primario' ? 'default' : 'secondary'}>
                    {cta.tipo}
                  </Badge>
                  <span className="font-semibold">{cta.texto}</span>
                  <Badge variant="outline">{cta.localizacao}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Ações */}
          <div className="flex gap-3">
            <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(generatedLP, null, 2))}>
              <FileText className="w-4 h-4 mr-2" />
              Copiar JSON
            </Button>
            <Button variant="outline" onClick={() => setGeneratedLP(null)}>
              Gerar Nova LP
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
