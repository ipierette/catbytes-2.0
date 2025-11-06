'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TranslateButtonProps {
  postId: number
  postTitle: string
  locale: string
  onTranslationComplete?: () => void
}

export default function TranslateButton({ 
  postId, 
  postTitle, 
  locale,
  onTranslationComplete 
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false)

  // Só mostrar botão para posts em português
  if (locale !== 'pt-BR') {
    return null
  }

  const handleTranslate = async () => {
    if (isTranslating) return

    const confirmed = window.confirm(
      `🌍 Traduzir "${postTitle}" para inglês?\n\n` +
      `⚠️ Isso irá:\n` +
      `• Usar tokens da OpenAI (~500-2000 tokens)\n` +
      `• Criar um post em /en-US/blog\n` +
      `• Enviar newsletter para assinantes em inglês\n\n` +
      `Continuar?`
    )

    if (!confirmed) return

    setIsTranslating(true)
    const toastId = toast.loading('🌍 Traduzindo post...')

    try {
      const response = await fetch('/api/blog/translate-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId,
          targetLanguage: 'en',
          sendNewsletter: true
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao traduzir post')
      }

      toast.success(
        `✅ Post traduzido com sucesso!\n\n` +
        `📊 Tokens usados: ${result.tokensUsed}\n` +
        `📧 Newsletter enviada para assinantes em inglês\n\n` +
        `Ver em: /en-US/blog/${result.post.slug}`,
        { id: toastId, duration: 10000 }
      )

      // Callback opcional
      if (onTranslationComplete) {
        onTranslationComplete()
      }

      // Abrir post traduzido em nova aba
      window.open(`/en-US/blog/${result.post.slug}`, '_blank')
    } catch (error) {
      console.error('Translation error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao traduzir post',
        { id: toastId }
      )
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Button
      onClick={handleTranslate}
      disabled={isTranslating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isTranslating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Traduzindo...
        </>
      ) : (
        <>
          <Languages className="h-4 w-4" />
          Traduzir para Inglês
        </>
      )}
    </Button>
  )
}
