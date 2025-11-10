'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NICHES, COLOR_THEMES } from '@/app/api/landing-pages/generate/route'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

interface CreateLandingPageModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateLandingPageModal({ open, onClose, onSuccess }: CreateLandingPageModalProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form')
  const [formData, setFormData] = useState({
    niche: '',
    problem: '',
    solution: '',
    cta_text: '',
    theme_color: 'blue'
  })
  const [generatedPage, setGeneratedPage] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStep('generating')

    try {
      const response = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar landing page')
      }

      setGeneratedPage(data.landingPage)
      setStep('success')
      
      // Auto-fechar após 3 segundos
      setTimeout(() => {
        onSuccess()
        resetForm()
      }, 3000)

    } catch (err: any) {
      setError(err.message)
      setStep('form')
    }
  }

  function resetForm() {
    setFormData({
      niche: '',
      problem: '',
      solution: '',
      cta_text: '',
      theme_color: 'blue'
    })
    setStep('form')
    setError('')
    setGeneratedPage(null)
  }

  function handleClose() {
    if (step !== 'generating') {
      onClose()
      // Delay reset para não mostrar transição
      setTimeout(resetForm, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                <Sparkles className="inline-block mr-2 h-6 w-6 text-purple-500" />
                Criar Landing Page com IA
              </DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo e a IA criará uma landing page profissional em ~30 segundos
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nicho */}
              <div className="space-y-2">
                <Label htmlFor="niche">Nicho do Negócio *</Label>
                <Select
                  value={formData.niche}
                  onValueChange={(value) => setFormData({ ...formData, niche: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nicho..." />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((niche) => (
                      <SelectItem key={niche.value} value={niche.value}>
                        {niche.emoji} {niche.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Problema */}
              <div className="space-y-2">
                <Label htmlFor="problem">Qual problema seu cliente tem? *</Label>
                <Textarea
                  id="problem"
                  placeholder="Ex: Consultórios médicos perdem muitos pacientes por falta de sistema de agendamento online..."
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  required
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.problem.length}/500 caracteres
                </p>
              </div>

              {/* Solução */}
              <div className="space-y-2">
                <Label htmlFor="solution">Como sua automação resolve? *</Label>
                <Textarea
                  id="solution"
                  placeholder="Ex: Sistema de agendamento automático integrado com WhatsApp que confirma consultas..."
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  required
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.solution.length}/500 caracteres
                </p>
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <Label htmlFor="cta_text">Texto do Botão (CTA) *</Label>
                <Input
                  id="cta_text"
                  placeholder="Ex: Quero Automatizar Meu Consultório"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  required
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.cta_text.length}/50 caracteres
                </p>
              </div>

              {/* Tema de Cores */}
              <div className="space-y-2">
                <Label htmlFor="theme_color">Tema de Cores *</Label>
                <Select
                  value={formData.theme_color}
                  onValueChange={(value) => setFormData({ ...formData, theme_color: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_THEMES.map((theme) => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: theme.primary }}
                          />
                          {theme.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  disabled={!formData.niche || !formData.problem || !formData.solution || !formData.cta_text}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar com IA
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-purple-500" />
            <h3 className="text-xl font-semibold">Gerando sua landing page...</h3>
            <div className="text-center space-y-2 text-sm text-muted-foreground max-w-md">
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                GPT-4 escrevendo copy persuasivo...
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-100" />
                DALL-E 3 criando imagem do nicho...
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200" />
                Montando HTML responsivo...
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Isso leva cerca de 30 segundos
            </p>
          </div>
        )}

        {step === 'success' && generatedPage && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-purple-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-center">Landing Page Criada!</h3>
            <p className="text-center text-muted-foreground max-w-md">
              Sua landing page &quot;{generatedPage.title}&quot; foi gerada com sucesso!
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" asChild>
                <a href={generatedPage.previewUrl} target="_blank">
                  Ver Preview
                </a>
              </Button>
              <Button onClick={() => {
                onSuccess()
                resetForm()
              }}>
                Ir para Dashboard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
