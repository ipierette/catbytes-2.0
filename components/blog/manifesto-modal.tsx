'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles, Bot, Zap, Target, Code, TrendingUp } from 'lucide-react'

interface ManifestoModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ManifestoModal({ trigger, open: controlledOpen, onOpenChange }: ManifestoModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange : setInternalOpen

  const handleOpenChange = (newOpen: boolean) => {
    setOpen?.(newOpen)
  }

  return (
    <>
      {trigger && (
        <div onClick={() => handleOpenChange(true)}>
          {trigger}
        </div>
      )}
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Manifesto Oficial CATBytes IA
            </DialogTitle>
            <DialogDescription className="text-base mt-4">
              Sistema integrado de automação e inteligência digital desenvolvido por Izadora Cury Pierette
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Introdução */}
            <div className="bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-950/20 dark:to-cyan-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3 mb-4">
                <Bot className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-purple-900 dark:text-purple-200">
                    O que é a CatBytes IA?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A CatBytes IA é um sistema integrado de automação, geração de conteúdo e gerenciamento digital 
                    desenvolvido por Izadora Cury Pierette. Sua arquitetura combina módulos de escrita inteligente, 
                    análise contextual, criação de interfaces e orquestração de tarefas multiplataforma.
                  </p>
                </div>
              </div>
            </div>

            {/* Funcionalidades */}
            <div className="space-y-4">
              <h3 className="font-semibold text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-600" />
                Capacidades do Sistema
              </h3>

              <div className="grid gap-4">
                {/* Gestão do Ecossistema */}
                <div className="border rounded-lg p-4 hover:border-purple-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <Code className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Gestão Completa do Ecossistema</h4>
                      <p className="text-sm text-muted-foreground">
                        Administra todo o ecossistema do site, desde a publicação automatizada de artigos até a 
                        geração de temas estruturados para conteúdos manuais.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Landing Pages */}
                <div className="border rounded-lg p-4 hover:border-cyan-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Landing Pages Inteligentes</h4>
                      <p className="text-sm text-muted-foreground">
                        Cria landing pages orientadas a problemas reais de empresas, focadas em conversão, 
                        captura de leads e otimização de funis.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Distribuição Multiplataforma */}
                <div className="border rounded-lg p-4 hover:border-purple-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Distribuição Multiplataforma</h4>
                      <p className="text-sm text-muted-foreground">
                        Opera rotinas que produzem, adaptam e distribuem conteúdos automaticamente para Instagram, 
                        LinkedIn e blog, mantendo alinhamento técnico, semântico e visual entre as plataformas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Produção de Vídeos */}
                <div className="border rounded-lg p-4 hover:border-cyan-400 transition-colors">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Suporte à Produção Audiovisual</h4>
                      <p className="text-sm text-muted-foreground">
                        Apoia a produção de vídeos, sugerindo descrições, copy e metadata orientadas a SEO.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Propósito */}
            <div className="bg-gradient-to-br from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20 p-6 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <h3 className="font-semibold text-lg mb-3 text-cyan-900 dark:text-cyan-200">
                🎯 Propósito e Missão
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                A CatBytes IA existe para <strong>eliminar tarefas repetitivas</strong>, <strong>padronizar processos</strong> e 
                garantir uma <strong>presença digital inteligente, escalável e consistente</strong>.
              </p>
              <p className="text-muted-foreground leading-relaxed italic">
                Cada post, automação ou página emitida reflete a integração entre engenharia, criatividade e propósito.
              </p>
            </div>

            {/* Assinatura */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Desenvolvido por{' '}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  Izadora Cury Pierette
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Full Stack Developer & AI Automation Specialist
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Variante com botão padrão
export function ManifestoButton({ variant = 'default' }: { variant?: 'default' | 'outline' | 'ghost' }) {
  return (
    <ManifestoModal
      trigger={
        <Button variant={variant} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Manifesto Oficial CATBytes IA
        </Button>
      }
    />
  )
}

// Variante compacta para footer
export function ManifestoLinkFooter() {
  return (
    <ManifestoModal
      trigger={
        <button className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2 group">
          <Sparkles className="h-4 w-4 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
          <span className="hover:underline">Manifesto CATBytes IA</span>
        </button>
      }
    />
  )
}
