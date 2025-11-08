'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { BlogPost } from '@/types/blog'
import { TemplateType } from './blog-template-selector'

interface AIAutoFillProps {
  theme: string
  onAutoFill: (data: {
    title: string
    excerpt: string
    content: string
    tags: string[]
    suggestedTemplate: TemplateType
    templateJustification: string
  }) => void
}

export function AIAutoFill({ theme, onAutoFill }: AIAutoFillProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateContent = async () => {
    setIsGenerating(true)
    toast.loading('🤖 IA gerando conteúdo completo...', { id: 'ai-autofill' })

    try {
      const response = await fetch('/api/admin/blog/ai-autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ theme })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar conteúdo')
      }

      // Passar dados gerados para o componente pai
      onAutoFill({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        tags: data.tags,
        suggestedTemplate: data.suggestedTemplate,
        templateJustification: data.templateJustification
      })

      toast.success('✅ Conteúdo gerado com sucesso!', { id: 'ai-autofill' })
    } catch (error: any) {
      console.error('Erro ao gerar conteúdo:', error)
      toast.error(`❌ ${error.message}`, { id: 'ai-autofill' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-purple-950/30 to-pink-950/30 rounded-xl border-2 border-purple-700/50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-purple-900/50 rounded-lg">
          <Sparkles className="w-8 h-8 text-purple-300" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-purple-200 mb-2">
            🤖 Preenchimento Automático com IA
          </h3>
          
          <p className="text-sm text-slate-300 mb-4">
            A IA irá analisar o tema <strong className="text-purple-300">"{theme}"</strong> e gerar automaticamente:
          </p>

          <ul className="text-sm text-slate-400 space-y-1 mb-4 ml-4">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Título otimizado para SEO
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Resumo atrativo (excerpt)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Conteúdo completo do artigo
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Tags/categorias relevantes
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Template mais indicado (com justificativa)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Prompts para geração de imagens
            </li>
          </ul>

          <Button
            onClick={generateContent}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando conteúdo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Sugerir Preenchimento com IA
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
