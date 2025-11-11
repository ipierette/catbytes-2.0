'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface TokenGeneratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: 'instagram' | 'linkedin'
  onTokenGenerated: (token: string, expiryDate: string) => void
}

interface Instructions {
  step1: {
    title: string
    description: string
    url: string
    note: string
  }
  step2: {
    title: string
    description: string
    endpoint: string
    method: string
    parameters: Record<string, string>
    headers?: Record<string, string>
    note?: string
  }
  step3?: {
    title: string
    description: string
    endpoint: string
    method: string
    parameters: Record<string, string>
  }
}

export function TokenGeneratorModal({ 
  open, 
  onOpenChange, 
  platform, 
  onTokenGenerated 
}: TokenGeneratorModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [instructions, setInstructions] = useState<Instructions | null>(null)
  const [authCode, setAuthCode] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const platformName = platform === 'instagram' ? 'Instagram' : 'LinkedIn'
  const platformIcon = platform === 'instagram' ? '📷' : '💼'

  const loadInstructions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/token-generator?platform=${platform}`)
      const data = await response.json()

      if (data.success) {
        setInstructions(data.instructions)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao carregar instruções' })
    } finally {
      setLoading(false)
    }
  }

  const handleStartProcess = () => {
    setStep(1)
    setAuthCode('')
    setGeneratedToken('')
    setMessage(null)
    loadInstructions()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setMessage({ type: 'success', text: 'Copiado para área de transferência!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao copiar' })
    }
  }

  const openAuthUrl = () => {
    if (instructions?.step1.url) {
      window.open(instructions.step1.url, '_blank')
      setStep(2)
    }
  }

  const validateAndSaveToken = async () => {
    if (!generatedToken.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira o token' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/token-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          token: generatedToken.trim(),
          autoSetExpiry: true
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        onTokenGenerated(generatedToken.trim(), data.expiryDate)
        
        setTimeout(() => {
          onOpenChange(false)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao validar token' })
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-2">{platformIcon}</div>
        <h3 className="text-xl font-semibold">Gerar Token {platformName}</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Vamos gerar um novo token de acesso de 60 dias
        </p>
      </div>

      {!instructions && (
        <Button
          onClick={handleStartProcess}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? 'Carregando...' : `🚀 Começar Processo ${platformName}`}
        </Button>
      )}

      {instructions && (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{instructions.step1.title}</strong><br />
              {instructions.step1.description}
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <Label className="text-sm font-medium">URL de Autorização:</Label>
            <div className="flex gap-2">
              <Input
                value={instructions.step1.url}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(instructions.step1.url)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={openAuthUrl}
            className="w-full gap-2"
            size="lg"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir {platformName} para Autorização
          </Button>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {instructions.step1.note}
          </p>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl mb-2">🔑</div>
        <h3 className="text-xl font-semibold">Código de Autorização</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Cole aqui o código que você recebeu após autorizar
        </p>
      </div>

      <div>
        <Label>Código de Autorização:</Label>
        <Input
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          placeholder="Cole o código aqui..."
          className="mt-2"
        />
      </div>

      {instructions?.step2 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Próximo passo:</strong> Use este código para fazer uma requisição para:
            <br />
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
              {instructions.step2.endpoint}
            </code>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1"
        >
          ← Voltar
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={!authCode.trim()}
          className="flex-1"
        >
          Continuar →
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl mb-2">🎯</div>
        <h3 className="text-xl font-semibold">Token Final</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Cole aqui o token final que você recebeu
        </p>
      </div>

      <div>
        <Label>Token de Acesso {platformName}:</Label>
        <Textarea
          value={generatedToken}
          onChange={(e) => setGeneratedToken(e.target.value)}
          placeholder={`Cole seu token ${platform} aqui...`}
          className="mt-2 font-mono text-xs"
          rows={4}
        />
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Quase lá!</strong> Cole o token e clique em "Validar e Salvar" para:
          <ul className="list-disc list-inside mt-2 text-sm">
            <li>Validar o formato do token</li>
            <li>Configurar expiração em 60 dias</li>
            <li>Criar lembretes automáticos</li>
            <li>Atualizar as configurações</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep(2)}
          className="flex-1"
        >
          ← Voltar
        </Button>
        <Button
          onClick={validateAndSaveToken}
          disabled={!generatedToken.trim() || loading}
          className="flex-1"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {loading ? 'Validando...' : '✅ Validar e Salvar'}
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {platformIcon}
            Gerador de Token {platformName}
          </DialogTitle>
        </DialogHeader>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="min-h-[300px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 pt-4 border-t">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                s <= step 
                  ? 'bg-primary' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}