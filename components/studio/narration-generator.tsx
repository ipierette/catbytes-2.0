'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Loader2, Play, Pause, Download, Save, Volume2, ArrowLeft } from 'lucide-react'

interface Voice {
  id: string
  name: string
  category: string
  description: string
  previewUrl: string
  labels: Record<string, string>
}

interface VoiceSettings {
  stability: number
  similarityBoost: number
  style: number
  useSpeakerBoost: boolean
}

interface NarrationGeneratorProps {
  scriptText?: string
  onNarrationGenerated: (narration: {
    audioData: string
    audioUrl: string
    duration: number
    voiceId: string
    text: string
  }) => void
  onBack?: () => void
}

export function NarrationGenerator({ 
  scriptText = '', 
  onNarrationGenerated,
  onBack 
}: NarrationGeneratorProps) {
  const [text, setText] = useState(scriptText)
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.0,
    useSpeakerBoost: true,
  })
  
  const [generating, setGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<{
    audioData: string
    duration: number
    voiceId: string
  } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [loadingVoices, setLoadingVoices] = useState(true)

  // Load voices on mount
  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/studio/generate-narration')
      if (!response.ok) throw new Error('Failed to load voices')
      
      const data = await response.json()
      setVoices(data.voices || [])
      
      // Select first voice by default
      if (data.voices?.length > 0) {
        setSelectedVoice(data.voices[0].id)
      }
    } catch (error) {
      console.error('Load voices error:', error)
    } finally {
      setLoadingVoices(false)
    }
  }

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return

    setGenerating(true)
    try {
      const response = await fetch('/api/studio/generate-narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice,
          modelId: 'eleven_multilingual_v2',
          voiceSettings: {
            stability: voiceSettings.stability,
            similarity_boost: voiceSettings.similarityBoost,
            style: voiceSettings.style,
            use_speaker_boost: voiceSettings.useSpeakerBoost,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to generate narration')

      const data = await response.json()
      setGeneratedAudio({
        audioData: data.narration.audioData,
        duration: data.narration.duration,
        voiceId: data.narration.voiceId,
      })

      // Create audio element
      const audio = new Audio(`data:audio/mpeg;base64,${data.narration.audioData}`)
      audio.onended = () => setIsPlaying(false)
      setAudioElement(audio)

    } catch (error) {
      console.error('Generate narration error:', error)
      alert('Erro ao gerar narração')
    } finally {
      setGenerating(false)
    }
  }

  const togglePlayback = () => {
    if (!audioElement) return

    if (isPlaying) {
      audioElement.pause()
      setIsPlaying(false)
    } else {
      audioElement.play()
      setIsPlaying(true)
    }
  }

  const downloadAudio = () => {
    if (!generatedAudio) return

    const link = document.createElement('a')
    link.href = `data:audio/mpeg;base64,${generatedAudio.audioData}`
    link.download = 'narration.mp3'
    link.click()
  }

  const saveNarration = () => {
    if (!generatedAudio) return

    onNarrationGenerated({
      audioData: generatedAudio.audioData,
      audioUrl: '', // Will be uploaded to Supabase Storage
      duration: generatedAudio.duration,
      voiceId: generatedAudio.voiceId,
      text,
    })
  }

  const selectedVoiceData = voices.find(v => v.id === selectedVoice)
  const characterCount = text.length
  const estimatedDuration = (text.split(/\s+/).length / 150) * 60 // 150 words per minute

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
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gerador de Narração AI</h2>
            <p className="text-sm text-gray-400">Crie narrações profissionais com Eleven Labs</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Texto para Narração *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole ou escreva o roteiro aqui..."
              rows={8}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{characterCount} caracteres</span>
              <span>~{estimatedDuration.toFixed(0)}s de duração</span>
            </div>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voz
            </label>
            
            {loadingVoices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all
                      ${selectedVoice === voice.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{voice.name}</h4>
                      {voice.previewUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const audio = new Audio(voice.previewUrl)
                            audio.play()
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <Play className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{voice.description}</p>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(voice.labels || {}).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Settings */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Configurações de Voz</h3>
            
            <div>
              <label className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Estabilidade</span>
                <span>{voiceSettings.stability.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={voiceSettings.stability}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Similaridade</span>
                <span>{voiceSettings.similarityBoost.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={voiceSettings.similarityBoost}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, similarityBoost: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Estilo</span>
                <span>{voiceSettings.style.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={voiceSettings.style}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, style: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={voiceSettings.useSpeakerBoost}
                onChange={(e) => setVoiceSettings(prev => ({ ...prev, useSpeakerBoost: e.target.checked }))}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Usar Speaker Boost</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!text.trim() || !selectedVoice || generating}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando narração...
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                Gerar Narração
              </>
            )}
          </button>

          {/* Generated Audio */}
          <AnimatePresence>
            {generatedAudio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-gradient-to-br from-gray-800 to-gray-850 rounded-lg border border-gray-700"
              >
                <h3 className="text-lg font-bold text-white mb-4">Narração Gerada</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={togglePlayback}
                    className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </button>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">
                      {selectedVoiceData?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Duração: ~{generatedAudio.duration.toFixed(0)}s
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={downloadAudio}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Baixar MP3
                  </button>
                  <button
                    onClick={saveNarration}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Salvar no Projeto
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
