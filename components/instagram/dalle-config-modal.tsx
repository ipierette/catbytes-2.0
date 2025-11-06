'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DALLEConfigModalProps {
  open: boolean
  onClose: () => void
  onGenerate: (config: {
    nicho: string
    tema: string
    quantidade: number
    estilo: string
    palavrasChave?: string[]
  }) => void
  mode?: 'dalle' | 'stability' // Novo: tipo de geração
}

const NICHOS = [
  { value: 'tech', label: '💻 Tecnologia' },
  { value: 'business', label: '💼 Negócios' },
  { value: 'lifestyle', label: '🌟 Lifestyle' },
  { value: 'education', label: '📚 Educação' },
  { value: 'fitness', label: '💪 Fitness' },
]

const ESTILOS = [
  { value: 'moderno', label: 'Moderno' },
  { value: 'minimalista', label: 'Minimalista' },
  { value: 'vibrante', label: 'Vibrante' },
  { value: 'elegante', label: 'Elegante' },
  { value: 'corporativo', label: 'Corporativo' },
]

export function DALLEConfigModal({ open, onClose, onGenerate, mode = 'dalle' }: DALLEConfigModalProps) {
  const [nicho, setNicho] = useState<string>('')
  const [tema, setTema] = useState<string>('')
  const [quantidade, setQuantidade] = useState<number>(1)
  const [estilo, setEstilo] = useState<string>('moderno')
  const [palavrasChave, setPalavrasChave] = useState<string>('')
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  const isDALLE = mode === 'dalle'
  const title = isDALLE ? '✨ Gerar com DALL-E 3 (Debug)' : '⚡ Gerar com Stability AI (Debug)'
  const description = isDALLE 
    ? 'Configure os parâmetros para gerar posts com DALL-E 3. Logs detalhados no console.' 
    : 'Configure os parâmetros para gerar posts com Stability AI. 10x mais barato que DALL-E. Logs detalhados no console.'

  const handleGetSuggestion = async () => {
    setLoadingSuggestion(true)
    try {
      const response = await fetch('/api/instagram/suggest-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNicho: nicho || undefined })
      })

      if (!response.ok) {
        throw new Error('Falha ao buscar sugestão')
      }

      const data = await response.json()
      
      // Preenche automaticamente os campos
      if (data.nicho) setNicho(data.nicho)
      if (data.tema) setTema(data.tema)
      if (data.estilo) setEstilo(data.estilo)
      if (data.palavrasChave) setPalavrasChave(data.palavrasChave)
      
      alert('✨ Sugestão aplicada! Você pode editar os campos antes de gerar.')
    } catch (error) {
      console.error('Erro ao buscar sugestão:', error)
      alert('❌ Erro ao buscar sugestão da IA')
    } finally {
      setLoadingSuggestion(false)
    }
  }

  const handleGenerate = () => {
    if (!nicho || !tema) {
      alert('Nicho e tema são obrigatórios!')
      return
    }

    const palavras = palavrasChave
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    onGenerate({
      nicho,
      tema,
      quantidade,
      estilo,
      palavrasChave: palavras.length > 0 ? palavras : undefined
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Botão de Sugestão da IA */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGetSuggestion}
            disabled={loadingSuggestion}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            {loadingSuggestion ? '🤔 Pensando...' : '✨ Sugestão da IA (Auto-preencher)'}
          </Button>

          {/* Nicho */}
          <div className="grid gap-2">
            <Label htmlFor="nicho">Nicho *</Label>
            <Select value={nicho} onValueChange={setNicho}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nicho" />
              </SelectTrigger>
              <SelectContent>
                {NICHOS.map(n => (
                  <SelectItem key={n.value} value={n.value}>
                    {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tema */}
          <div className="grid gap-2">
            <Label htmlFor="tema">Tema do Post *</Label>
            <Input
              id="tema"
              placeholder="Ex: Python para Iniciantes"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
          </div>

          {/* Quantidade */}
          <div className="grid gap-2">
            <Label htmlFor="quantidade">Quantidade de Posts</Label>
            <Select value={String(quantidade)} onValueChange={(v) => setQuantidade(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map(n => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? 'post' : 'posts'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estilo */}
          <div className="grid gap-2">
            <Label htmlFor="estilo">Estilo Visual</Label>
            <Select value={estilo} onValueChange={setEstilo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTILOS.map(e => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Palavras-chave */}
          <div className="grid gap-2">
            <Label htmlFor="palavras">Palavras-chave (opcional)</Label>
            <Input
              id="palavras"
              placeholder="Ex: python, código, programação"
              value={palavrasChave}
              onChange={(e) => setPalavrasChave(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separe por vírgula. Ajuda a direcionar o conteúdo gerado.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            ✨ Gerar Posts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
