'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, CheckCircle2, ExternalLink, FileText, Eye, Rocket } from 'lucide-react'
import type { LPRichContent } from '@/lib/lp-content-generator'
import type { NicheValue } from '@/lib/landing-pages-constants'
import { NICHES } from '@/lib/landing-pages-constants'

interface RichLPGeneratorProps {
  nicho?: NicheValue
  onSuccess?: () => void
}

export function RichLPGenerator({ nicho: initialNicho, onSuccess }: RichLPGeneratorProps = {}) {
  const [nicho, setNicho] = useState<NicheValue | null>(initialNicho || null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [generatedLP, setGeneratedLP] = useState<LPRichContent | null>(null)
  const [savedLPId, setSavedLPId] = useState<string | null>(null)
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [selectedTipo, setSelectedTipo] = useState<string>('')

  // Converte conteúdo rico para HTML
  const convertToHTML = (content: LPRichContent): string => {
    return `
      <div class="lp-rich-content">
        <section class="hero">
          <h1>${content.title}</h1>
          <p>${content.metaDescription}</p>
        </section>
        
        <section class="intro">
          ${content.introducao}
        </section>
        
        ${content.secoes.map(secao => `
          <section class="content-section">
            <h2>${secao.h2}</h2>
            <div>${secao.conteudo}</div>
            ${secao.items ? `<ul>${secao.items.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
          </section>
        `).join('')}
        
        <section class="faq">
          <h2>Perguntas Frequentes</h2>
          ${content.faq.map(item => `
            <div class="faq-item">
              <h3>${item.pergunta}</h3>
              <p>${item.resposta}</p>
            </div>
          `).join('')}
        </section>
        
        ${content.ctas.map(cta => `
          <div class="cta">
            <h3>${cta.texto}</h3>
            <p>Posição: ${cta.localizacao}</p>
          </div>
        `).join('')}
        
        ${content.termosDeUso ? `
          <section class="termos">
            <h2>Termos de Uso</h2>
            <div>${content.termosDeUso.conteudo}</div>
          </section>
        ` : ''}
        
        ${content.politicaPrivacidade ? `
          <section class="privacidade">
            <h2>Política de Privacidade</h2>
            <div>${content.politicaPrivacidade.conteudo}</div>
          </section>
        ` : ''}
      </div>
    `
  }

  // Busca sugestões de LPs
  const fetchSuggestions = async (selectedNicho: NicheValue) => {
    try {
      const res = await fetch(`/api/landing-pages/generate-rich?nicho=${selectedNicho}`)
      const data = await res.json()
      if (data.success) {
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error)
    }
  }

  const handleNichoSelect = (selectedNicho: NicheValue) => {
    setNicho(selectedNicho)
    setSuggestions([])
    setGeneratedLP(null)
    setSavedLPId(null)
    setSavedSlug(null)
  }

  // Gera LP rica
  const handleGenerate = async (tipo: string) => {
    if (!nicho) return
    
    setLoading(true)
    setSelectedTipo(tipo)
    setGeneratedLP(null)
    setSavedLPId(null)
    setSavedSlug(null)

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

  // Salva LP no banco de dados
  const handleSaveLP = async () => {
    if (!generatedLP || !nicho) return

    setSaving(true)
    try {
      const htmlContent = convertToHTML(generatedLP)

      const response = await fetch('/api/landing-pages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedLP.title,
          slug: generatedLP.slug,
          niche: nicho,
          problem: generatedLP.introducao.substring(0, 200),
          solution: generatedLP.secoes[0]?.conteudo.substring(0, 200) || '',
          cta_text: generatedLP.ctas[0]?.texto || 'Fale Conosco',
          theme_color: 'purple',
          headline: generatedLP.title,
          subheadline: generatedLP.metaDescription,
          benefits: JSON.stringify(generatedLP.secoes.map(s => ({
            title: s.h2,
            description: s.conteudo.substring(0, 100)
          }))),
          html_content: htmlContent,
          status: 'published'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar LP')
      }

      setSavedLPId(data.landingPage?.id || data.id)
      setSavedSlug(generatedLP.slug)
      
      alert('✅ LP salva com sucesso! Agora você pode fazer o deploy.')
      
      // Chama callback se fornecido
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      alert(`❌ Erro ao salvar: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Deploy da LP
  const handleDeploy = async () => {
    if (!savedLPId) {
      alert('⚠️ Salve a LP primeiro antes de fazer deploy')
      return
    }

    setDeploying(true)
    try {
      const response = await fetch('/api/landing-pages/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landingPageId: savedLPId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer deploy')
      }

      alert(`✅ Deploy realizado com sucesso!\n\nURL: ${data.deployUrl}`)
    } catch (error: any) {
      alert(`❌ Erro no deploy: ${error.message}`)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Nicho */}
      {!nicho && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Selecione o Nicho da Landing Page
            </CardTitle>
            <CardDescription>
              Escolha o segmento para gerar LPs personalizadas e otimizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {NICHES.map((nicheOption) => (
                <Button
                  key={nicheOption.value}
                  onClick={() => handleNichoSelect(nicheOption.value as NicheValue)}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
                >
                  <span className="text-3xl">{nicheOption.emoji}</span>
                  <span className="text-sm font-medium text-center">{nicheOption.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header com botão de voltar */}
      {nicho && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Gerador de LPs Ricas - {NICHES.find(n => n.value === nicho)?.emoji} {NICHES.find(n => n.value === nicho)?.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Crie landing pages completas otimizadas para ranqueamento e link building
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleNichoSelect(nicho)} variant="outline" size="sm">
                Trocar Nicho
              </Button>
              {suggestions.length === 0 && (
                <Button onClick={() => fetchSuggestions(nicho)} variant="outline">
                  Ver Sugestões
                </Button>
              )}
            </div>
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
          <div className="space-y-3">
            {!savedLPId ? (
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  ⚠️ LP ainda não foi salva. Salve primeiro para poder visualizar e fazer deploy.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveLP}
                    disabled={saving}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando LP...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Salvar LP no Banco
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(generatedLP, null, 2))}
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  ✅ LP salva com sucesso! Agora você pode visualizar e fazer deploy.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    size="lg"
                    variant="outline"
                    asChild
                  >
                    <a href={`/pt-BR/lp/${savedSlug}`} target="_blank">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Preview
                    </a>
                  </Button>
                  <Button 
                    onClick={handleDeploy}
                    disabled={deploying}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    {deploying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deployando...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Deploy Vercel
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setGeneratedLP(null)
                  setSavedLPId(null)
                  setSavedSlug(null)
                }}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Nova LP
              </Button>
              
              {savedLPId && onSuccess && (
                <Button 
                  onClick={() => {
                    onSuccess()
                    // Reset estado
                    setGeneratedLP(null)
                    setSavedLPId(null)
                    setSavedSlug(null)
                    setNicho(null)
                    setSuggestions([])
                  }}
                  variant="outline"
                >
                  Ver Todas as LPs
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}
