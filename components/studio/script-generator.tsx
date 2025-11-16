'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Copy, Check, Wand2, ArrowLeft } from 'lucide-react'
import { Platform, ScriptResponse } from '@/types/studio'

interface ScriptGeneratorProps {
  projectId: string
  locale: 'pt-BR' | 'en-US'
  onScriptGenerated: (script: ScriptResponse) => void
  onBack?: () => void
}

export function ScriptGenerator({ projectId, locale, onScriptGenerated, onBack }: ScriptGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<'educational' | 'casual' | 'professional' | 'humorous'>('educational')
  const [duration, setDuration] = useState(60)
  const [platform, setPlatform] = useState<Platform>('youtube')
  const [keywords, setKeywords] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  
  const [generating, setGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<ScriptResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) return

    setGenerating(true)
    try {
      const response = await fetch('/api/studio/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          tone,
          duration,
          platform,
          locale,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          targetAudience: targetAudience || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate script')

      const data = await response.json()
      setGeneratedScript(data.script)
      onScriptGenerated(data.script)
    } catch (error) {
      console.error('Script generation error:', error)
      alert('Erro ao gerar roteiro')
    } finally {
      setGenerating(false)
    }
  }

  const copyScript = () => {
    if (!generatedScript) return
    
    const fullScript = `${generatedScript.hook}\n\n${generatedScript.body.map(s => s.text).join('\n\n')}\n\n${generatedScript.cta}`
    navigator.clipboard.writeText(fullScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gerador de Roteiro AI</h2>
            <p className="text-sm text-gray-400">Crie roteiros profissionais automaticamente</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Form */}
          <div className="space-y-4">
            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tópico *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Como criar hooks customizados em React"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Grid: Tone & Platform */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tom
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="educational">Educacional</option>
                  <option value="casual">Casual</option>
                  <option value="professional">Profissional</option>
                  <option value="humorous">Humorístico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plataforma
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram Reels</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duração: {duration}s
              </label>
              <input
                type="range"
                min="15"
                max="300"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>15s</span>
                <span>5min</span>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Opcional</p>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Palavras-chave (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="react, hooks, tutorial"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Público-alvo
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Desenvolvedores iniciantes"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || generating}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando roteiro...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Roteiro
                </>
              )}
            </button>
          </div>

          {/* Generated Script */}
          <AnimatePresence>
            {generatedScript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Roteiro Gerado</h3>
                  <button
                    onClick={copyScript}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm flex items-center gap-2 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">TÍTULO</p>
                    <h4 className="text-xl font-bold text-white">{generatedScript.title}</h4>
                  </div>

                  {/* Hook */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">GANCHO (3 SEGUNDOS)</p>
                    <p className="text-orange-400 font-medium">{generatedScript.hook}</p>
                  </div>

                  {/* Body */}
                  <div>
                    <p className="text-xs text-gray-400 mb-3">CONTEÚDO PRINCIPAL</p>
                    <div className="space-y-4">
                      {generatedScript.body.map((segment, index) => (
                        <div key={index} className="pl-4 border-l-2 border-gray-700">
                          <p className="text-gray-300 leading-relaxed">{segment.text}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            💡 Visual: {segment.visualSuggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">CALL-TO-ACTION</p>
                    <p className="text-green-400 font-medium">{generatedScript.cta}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex gap-4 pt-4 border-t border-gray-700">
                    <div className="px-3 py-2 bg-gray-750 rounded">
                      <span className="text-xs text-gray-400">Palavras: </span>
                      <span className="text-sm font-medium text-white">{generatedScript.metadata.wordCount}</span>
                    </div>
                    <div className="px-3 py-2 bg-gray-750 rounded">
                      <span className="text-xs text-gray-400">Duração: </span>
                      <span className="text-sm font-medium text-white">{generatedScript.metadata.estimatedDuration}s</span>
                    </div>
                    <div className="px-3 py-2 bg-gray-750 rounded">
                      <span className="text-xs text-gray-400">SEO Score: </span>
                      <span className="text-sm font-medium text-white">{generatedScript.metadata.seoScore}/100</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
