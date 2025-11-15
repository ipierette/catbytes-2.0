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
  const [generatingImage, setGeneratingImage] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [generatedLP, setGeneratedLP] = useState<LPRichContent | null>(null)
  const [savedLPId, setSavedLPId] = useState<string | null>(null)
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [selectedTipo, setSelectedTipo] = useState<string>('')

  // Converte conteúdo rico para HTML
  const convertToHTML = (content: LPRichContent, heroImage?: string | null): string => {
    // Determina tema baseado no nicho
    const nichoLowerCase = nicho?.toLowerCase() || 'automacao'
    
    // Mapeamento de temas por nicho
    const themes: Record<string, any> = {
      automacao: {
        gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        heroGradient: 'linear-gradient(135deg, #581C87 0%, #9333EA 100%)',
        demoGradient: 'linear-gradient(135deg, #6B21A8 0%, #BE185D 100%)',
        checklistGradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        primaryColor: '#8B5CF6',
        iconColor: '#8B5CF6',
      },
      ecommerce: {
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        heroGradient: 'linear-gradient(135deg, #1E3A8A 0%, #0C4A6E 100%)',
        demoGradient: 'linear-gradient(135deg, #1E40AF 0%, #075985 100%)',
        checklistGradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
        primaryColor: '#3B82F6',
        iconColor: '#3B82F6',
      },
      saude: {
        gradient: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
        heroGradient: 'linear-gradient(135deg, #115E59 0%, #0C4A6E 100%)',
        demoGradient: 'linear-gradient(135deg, #0F766E 0%, #075985 100%)',
        checklistGradient: 'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)',
        primaryColor: '#14B8A6',
        iconColor: '#14B8A6',
      },
      educacao: {
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
        heroGradient: 'linear-gradient(135deg, #92400E 0%, #9A3412 100%)',
        demoGradient: 'linear-gradient(135deg, #B45309 0%, #C2410C 100%)',
        checklistGradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
        primaryColor: '#F59E0B',
        iconColor: '#F59E0B',
      },
      financas: {
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        heroGradient: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
        demoGradient: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
        checklistGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        primaryColor: '#10B981',
        iconColor: '#10B981',
      },
      marketing: {
        gradient: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
        heroGradient: 'linear-gradient(135deg, #9F1239 0%, #881337 100%)',
        demoGradient: 'linear-gradient(135deg, #BE123C 0%, #9F1239 100%)',
        checklistGradient: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
        primaryColor: '#EC4899',
        iconColor: '#EC4899',
      },
      logistica: {
        gradient: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
        heroGradient: 'linear-gradient(135deg, #3730A3 0%, #1E3A8A 100%)',
        demoGradient: 'linear-gradient(135deg, #4338CA 0%, #1E40AF 100%)',
        checklistGradient: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
        primaryColor: '#6366F1',
        iconColor: '#6366F1',
      },
      tecnologia: {
        gradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        heroGradient: 'linear-gradient(135deg, #0E7490 0%, #1E40AF 100%)',
        demoGradient: 'linear-gradient(135deg, #0891B2 0%, #2563EB 100%)',
        checklistGradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
        primaryColor: '#06B6D4',
        iconColor: '#06B6D4',
      },
      energia: {
        gradient: 'linear-gradient(135deg, #84CC16 0%, #10B981 100%)',
        heroGradient: 'linear-gradient(135deg, #4D7C0F 0%, #047857 100%)',
        demoGradient: 'linear-gradient(135deg, #65A30D 0%, #059669 100%)',
        checklistGradient: 'linear-gradient(135deg, #84CC16 0%, #10B981 100%)',
        primaryColor: '#84CC16',
        iconColor: '#84CC16',
      },
      manufatura: {
        gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
        heroGradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        demoGradient: 'linear-gradient(135deg, #334155 0%, #1E293B 100%)',
        checklistGradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
        primaryColor: '#64748B',
        iconColor: '#64748B',
      },
      construcao: {
        gradient: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
        heroGradient: 'linear-gradient(135deg, #9A3412 0%, #92400E 100%)',
        demoGradient: 'linear-gradient(135deg, #C2410C 0%, #B45309 100%)',
        checklistGradient: 'linear-gradient(135deg, #F97316 0%, #F59E0B 100%)',
        primaryColor: '#F97316',
        iconColor: '#F97316',
      },
      agricultura: {
        gradient: 'linear-gradient(135deg, #22C55E 0%, #84CC16 100%)',
        heroGradient: 'linear-gradient(135deg, #166534 0%, #4D7C0F 100%)',
        demoGradient: 'linear-gradient(135deg, #15803D 0%, #65A30D 100%)',
        checklistGradient: 'linear-gradient(135deg, #22C55E 0%, #84CC16 100%)',
        primaryColor: '#22C55E',
        iconColor: '#22C55E',
      },
    }
    
    const theme = themes[nichoLowerCase] || themes.automacao
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    :root {
      --theme-primary: ${theme.primaryColor};
      --theme-icon: ${theme.iconColor};
    }
    
    * { font-family: 'Inter', sans-serif; }
    
    .gradient-bg {
      background: ${theme.gradient};
    }
    
    .hero-with-image {
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%), 
                  url('${heroImage}') center/cover no-repeat;
    }
    
    .glass-effect {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Checklist hover effects */
    .checklist-item:hover .checkbox {
      background: white;
      border-color: var(--theme-primary);
    }
    
    .checklist-item:hover .checkbox svg {
      color: var(--theme-primary);
    }
    
    /* Form input focus */
    input:focus, textarea:focus {
      border-color: var(--theme-primary) !important;
      outline: 2px solid var(--theme-primary);
      outline-offset: -1px;
    }
    
    .fade-in {
      animation: fadeIn 0.6s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
      opacity: 0;
      animation: fadeIn 0.5s ease-in forwards;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  </style>
</head>
<body class="bg-gray-50">
  <!-- Hero Section -->
  <section class="${heroImage ? 'hero-with-image' : 'gradient-bg'} relative min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-black opacity-20"></div>
    <div class="container mx-auto px-4 py-20 relative z-10">
      <div class="max-w-4xl mx-auto text-center text-white fade-in">
        <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          ${content.title}
        </h1>
        <p class="text-xl md:text-2xl mb-8 opacity-90">
          ${content.metaDescription}
        </p>
        <a href="#contato" class="inline-block bg-white font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl" style="color: ${theme.primaryColor}">
          ${content.ctas[0]?.texto || 'Fale Conosco'}
        </a>
      </div>
    </div>
    
    <!-- Wave divider -->
    <div class="absolute bottom-0 w-full">
      <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
      </svg>
    </div>
  </section>

  <!-- Introdução -->
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-10 fade-in">
          <div class="prose prose-lg max-w-none text-gray-800">
            ${content.introducao}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Seções de Conteúdo -->
  ${content.secoes.map((secao, idx) => `
  <section class="py-16 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto fade-in">
        <h2 class="text-4xl font-bold mb-6 text-gray-900">${secao.h2}</h2>
        <div class="prose prose-lg max-w-none text-gray-700">
          <p>${secao.conteudo}</p>
          ${secao.items ? `
            <ul class="mt-6 space-y-3">
              ${secao.items.map(item => `
                <li class="flex items-start">
                  <svg class="w-6 h-6 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style="color: ${theme.iconColor}">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>${item}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    </div>
  </section>
  `).join('')}

  <!-- CTA Meio -->
  ${content.ctas.length > 1 ? `
  <section class="py-20 gradient-bg relative">
    <div class="absolute inset-0 bg-black opacity-10"></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-3xl mx-auto text-center text-white fade-in">
        <h2 class="text-4xl font-bold mb-6">${content.ctas[1].texto}</h2>
        <a href="#contato" class="inline-block bg-white font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl" style="color: ${theme.primaryColor}">
          Solicitar Demonstração
        </a>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- FAQ -->
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold mb-12 text-center text-gray-900 flex items-center justify-center gap-3">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${theme.iconColor};">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Perguntas Frequentes
        </h2>
        <div class="space-y-4">
          ${content.faq.map((item, idx) => `
            <details class="bg-white rounded-xl shadow-lg overflow-hidden group">
              <summary class="cursor-pointer px-8 py-6 font-semibold text-lg text-gray-900 hover:bg-purple-50 transition-colors flex justify-between items-center">
                ${item.pergunta}
                <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${theme.iconColor};">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </summary>
              <div class="px-8 py-6 text-gray-700 bg-gray-50">
                <p>${item.resposta}</p>
              </div>
            </details>
          `).join('')}
        </div>
      </div>
    </div>
  </section>

  <!-- Veja em Ação - Demo Unificada -->
  <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
    <div class="container mx-auto px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Veja em Ação</h2>
          <p class="text-xl text-gray-600">Demonstração completa do sistema funcionando na prática</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Card 1: Comparação Manual vs Automação -->
          <div class="bg-white rounded-2xl shadow-2xl p-8">
            <!-- Processo Manual -->
            <div class="space-y-4">
              <h3 class="text-2xl font-bold text-red-600 mb-4">Processo Manual</h3>
              <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p class="font-semibold text-red-800">Tempo médio: 2-3 horas/dia</p>
              </div>
              
              <div class="space-y-3">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex justify-between mb-2">
                    <span class="font-medium">Tarefa manual repetitiva</span>
                    <span class="text-gray-600">30 min</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" style="width: 100%; animation: pulse 2s infinite;"></div>
                  </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg opacity-75">
                  <div class="flex justify-between mb-2">
                    <span class="font-medium">Processamento lento</span>
                    <span class="text-gray-600">45 min</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full" style="width: 70%;"></div>
                  </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg opacity-50">
                  <div class="flex justify-between mb-2">
                    <span class="font-medium">Erros humanos frequentes</span>
                    <span class="text-gray-600">20 min retrabalho</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Processo Automatizado -->
            <div class="space-y-4">
              <h3 class="text-2xl font-bold text-green-600 mb-4">Com Automação + IA</h3>
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p class="font-semibold text-green-800">Tempo médio: 2 minutos</p>
                <p class="text-green-600 text-sm mt-1">Redução de 98.3% no tempo</p>
              </div>
              
              <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-lg">Sistema Processando...</p>
                    <p class="text-sm text-gray-600">IA executando todas as tarefas</p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm animate-fade-in">
                    <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Processamento automático completo</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm animate-fade-in" style="animation-delay: 0.2s;">
                    <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Notificações enviadas automaticamente</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm animate-fade-in" style="animation-delay: 0.4s;">
                    <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Dados sincronizados em tempo real</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm animate-fade-in" style="animation-delay: 0.6s;">
                    <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Zero erros, 100% de precisão</span>
                  </div>
                </div>
              </div>

              <a href="#contato" class="block w-full text-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                Quero Automatizar Meu Processo!
              </a>
            </div>
          </div>

          <!-- Card 2: Demo Interativa com Cliques -->
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <!-- Demo Header -->
            <div class="px-6 py-4 flex items-center gap-3" style="background: ${theme.gradient}">
              <div class="flex gap-2">
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div class="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <p class="text-white font-semibold ml-4">Demonstração Interativa - Clique nos botões</p>
            </div>
            
            <!-- Demo Content -->
            <div class="p-8">
              <div id="demoSteps" class="space-y-6">
                <!-- Step 1 -->
                <div class="demo-step" data-step="1">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${theme.primaryColor}">1</div>
                    <h3 class="text-xl font-bold text-gray-900">Processo Manual Atual</h3>
                  </div>
                  <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p class="text-gray-700 mb-3">⏳ <strong>Situação Atual:</strong> Atendimento manual demora 15-20 minutos por cliente</p>
                    <button onclick="showDemoStep(2)" class="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:scale-105" style="background: ${theme.primaryColor}">
                      Ativar Automação →
                    </button>
                  </div>
                </div>

                <!-- Step 2 -->
                <div class="demo-step hidden" data-step="2">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${theme.primaryColor}">2</div>
                    <h3 class="text-xl font-bold text-gray-900">IA em Ação</h3>
                  </div>
                  <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div class="flex items-center gap-3">
                      <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <p class="text-gray-700"><strong>Processando...</strong> IA analisando solicitação do cliente</p>
                    </div>
                    <p class="text-sm text-gray-500 mt-2 ml-8">⏱️ Aguarde alguns segundos...</p>
                  </div>
                </div>

                <!-- Step 3 -->
                <div class="demo-step hidden" data-step="3">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${theme.primaryColor}">3</div>
                    <h3 class="text-xl font-bold text-gray-900">Resultado</h3>
                  </div>
                  <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p class="text-gray-700 mb-3">✅ <strong>Concluído!</strong> Atendimento automatizado em 30 segundos</p>
                    <div class="grid grid-cols-3 gap-4 mt-4">
                      <div class="text-center p-3 bg-white rounded-lg shadow">
                        <div class="text-2xl font-bold text-green-600">95%</div>
                        <div class="text-sm text-gray-600">Mais Rápido</div>
                      </div>
                      <div class="text-center p-3 bg-white rounded-lg shadow">
                        <div class="text-2xl font-bold text-green-600">24/7</div>
                        <div class="text-sm text-gray-600">Disponível</div>
                      </div>
                      <div class="text-center p-3 bg-white rounded-lg shadow">
                        <div class="text-2xl font-bold text-green-600">0%</div>
                        <div class="text-sm text-gray-600">Erros</div>
                      </div>
                    </div>
                    <button onclick="showDemoStep(1)" class="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold transition-all hover:scale-105">
                      ↺ Reiniciar Demonstração
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- CTA da Demo -->
              <div class="mt-8 text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <p class="text-lg font-semibold text-gray-800 mb-3">
                  🚀 Resultados esperados em 30 dias:
                </p>
                <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div>
                    <div class="text-3xl font-bold" style="color: ${theme.iconColor}">80%</div>
                    <div class="text-sm text-gray-600">Redução de Tempo</div>
                  </div>
                  <div>
                    <div class="text-3xl font-bold" style="color: ${theme.iconColor}">95%</div>
                    <div class="text-sm text-gray-600">Menos Erros</div>
                  </div>
                  <div>
                    <div class="text-3xl font-bold" style="color: ${theme.iconColor}">3x</div>
                    <div class="text-sm text-gray-600">ROI Médio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Checklist de Implementação -->
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="rounded-2xl shadow-2xl p-8 md:p-12 text-white" style="background: ${theme.checklistGradient};">
          <div class="flex items-center gap-3 mb-4">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
            </svg>
            <h2 class="text-3xl md:text-4xl font-bold">${content.leadMagnet?.titulo || 'Checklist Rápido de Preparação'}</h2>
          </div>
          <p class="text-lg opacity-90 mb-2">${content.leadMagnet?.subtitulo || 'Os pontos essenciais que separam empresas que falham das que lucram'}</p>
          ${content.leadMagnet?.estatistica ? `<p class="text-sm opacity-75 mb-8">${content.leadMagnet.estatistica}</p>` : '<p class="text-sm opacity-75 mb-8">⚠️ A maioria das implementações falha por pular estas etapas</p>'}
          
          <div class="bg-white/10 backdrop-blur rounded-xl p-6 space-y-4">
            ${content.leadMagnet?.items ? content.leadMagnet.items.map(item => `
            <div class="flex items-start gap-4 checklist-item cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all">
              <div class="checkbox w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-1 transition-colors">
                <svg class="w-4 h-4 text-transparent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">${item.titulo}</h3>
                <p class="text-white/80 text-sm">${item.descricao}</p>
              </div>
            </div>
            `).join('') : `
            <div class="flex items-start gap-4 checklist-item cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all">
              <div class="checkbox w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-1 transition-colors">
                <svg class="w-4 h-4 text-transparent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">📊 Mapeamento de Gargalos</h3>
                <p class="text-white/80 text-sm">Identifique onde sua equipe perde mais tempo (há um método específico para isso)</p>
              </div>
            </div>

            <div class="flex items-start gap-4 checklist-item cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all">
              <div class="checkbox w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-1 transition-colors">
                <svg class="w-4 h-4 text-transparent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">💰 Cálculo de ROI por Processo</h3>
                <p class="text-white/80 text-sm">Descubra qual automação traz retorno mais rápido (usamos uma matriz decisória)</p>
              </div>
            </div>

            <div class="flex items-start gap-4 checklist-item cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all">
              <div class="checkbox w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-1 transition-colors">
                <svg class="w-4 h-4 text-transparent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">🔧 Preparação Técnica</h3>
                <p class="text-white/80 text-sm">Checklist de compatibilidade de sistemas (evite erros custosos)</p>
              </div>
            </div>

            <div class="flex items-start gap-4 checklist-item cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all">
              <div class="checkbox w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-1 transition-colors">
                <svg class="w-4 h-4 text-transparent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">👥 Estratégia de Adoção</h3>
                <p class="text-white/80 text-sm">Como garantir que a equipe use as ferramentas (fator crítico de sucesso)</p>
              </div>
            </div>

            <div class="flex items-start gap-4 checklist-item cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all">
              <div class="checkbox w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-1 transition-colors">
                <svg class="w-4 h-4 text-transparent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">🚀 Roadmap de Rollout</h3>
                <p class="text-white/80 text-sm">Sequência correta de implementação (o timing faz toda diferença)</p>
              </div>
            </div>

            <div class="flex items-start gap-4 checklist-item cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-all">
              <div class="checkbox w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-1 transition-colors">
                <svg class="w-4 h-4 text-transparent transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg">📈 KPIs de Monitoramento</h3>
                <p class="text-white/80 text-sm">Métricas que realmente importam para medir sucesso (e ajustar rápido)</p>
              </div>
            </div>
            `}
          </div>

          <div class="mt-8 bg-white/20 backdrop-blur rounded-xl p-6 text-center border-2 border-white/30">
            <p class="text-xl font-bold mb-2">${content.leadMagnet?.ctaTitulo || '🎁 Quer o Material Completo + Bônus?'}</p>
            <p class="text-white/90 mb-4">${content.leadMagnet?.ctaDescricao || 'Receba gratuitamente nosso guia detalhado + eBook "100 Dicas de Presença Online" (PDF)'}</p>
            <a href="#contato" class="inline-block bg-white font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl" style="color: ${theme.primaryColor}">
              Quero Receber o Material Completo
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Demo Interativa -->
  <section class="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="container mx-auto px-4">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4 text-gray-900">Veja em Ação</h2>
          <p class="text-xl text-gray-600">Demonstração interativa do sistema funcionando</p>
        </div>
        
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <!-- Demo Header -->
          <div class="px-6 py-4 flex items-center gap-3" style="background: ${theme.gradient}">
            <div class="flex gap-2">
              <div class="w-3 h-3 rounded-full bg-red-400"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div class="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <p class="text-white font-semibold ml-4">Demonstração Interativa - Clique nos botões</p>
          </div>
          
          <!-- Demo Content -->
          <div class="p-8">
            <div id="demoSteps" class="space-y-6">
              <!-- Step 1 -->
              <div class="demo-step" data-step="1">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${theme.primaryColor}">1</div>
                  <h3 class="text-xl font-bold">Processo Manual Atual</h3>
                </div>
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p class="text-gray-700 mb-3">⏳ <strong>Situação Atual:</strong> Atendimento manual demora 15-20 minutos por cliente</p>
                  <button onclick="showDemoStep(2)" class="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:scale-105" style="background: ${theme.primaryColor}">
                    Ativar Automação →
                  </button>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="demo-step hidden" data-step="2">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${theme.primaryColor}">2</div>
                  <h3 class="text-xl font-bold">IA em Ação</h3>
                </div>
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <p class="text-gray-700"><strong>Processando...</strong> IA analisando solicitação do cliente</p>
                  </div>
                  <button onclick="showDemoStep(3)" class="px-6 py-2 rounded-lg text-white font-semibold transition-all hover:scale-105" style="background: ${theme.primaryColor}">
                    Ver Resultado →
                  </button>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="demo-step hidden" data-step="3">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${theme.primaryColor}">3</div>
                  <h3 class="text-xl font-bold">Resultado</h3>
                </div>
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p class="text-gray-700 mb-3">✅ <strong>Concluído!</strong> Atendimento automatizado em 30 segundos</p>
                  <div class="grid grid-cols-3 gap-4 mt-4">
                    <div class="text-center p-3 bg-white rounded-lg shadow">
                      <div class="text-2xl font-bold text-green-600">95%</div>
                      <div class="text-sm text-gray-600">Mais Rápido</div>
                    </div>
                    <div class="text-center p-3 bg-white rounded-lg shadow">
                      <div class="text-2xl font-bold text-green-600">24/7</div>
                      <div class="text-sm text-gray-600">Disponível</div>
                    </div>
                    <div class="text-center p-3 bg-white rounded-lg shadow">
                      <div class="text-2xl font-bold text-green-600">0%</div>
                      <div class="text-sm text-gray-600">Erros</div>
                    </div>
                  </div>
                  <button onclick="showDemoStep(1)" class="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold transition-all hover:scale-105">
                    ↺ Reiniciar Demonstração
                  </button>
                </div>
              </div>
            </div>
            
            <!-- CTA da Demo -->
            <div class="mt-8 text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <p class="text-lg font-semibold text-gray-800 mb-3">
                🚀 Resultados esperados em 30 dias:
              </p>
              <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div>
                  <div class="text-3xl font-bold" style="color: ${theme.iconColor}">80%</div>
                  <div class="text-sm text-gray-600">Redução de Tempo</div>
                </div>
                <div>
                  <div class="text-3xl font-bold" style="color: ${theme.iconColor}">95%</div>
                  <div class="text-sm text-gray-600">Menos Erros</div>
                </div>
                <div>
                  <div class="text-3xl font-bold" style="color: ${theme.iconColor}">3x</div>
                  <div class="text-sm text-gray-600">ROI Médio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Final -->
  <section id="contato" class="py-20 gradient-bg relative">
    <div class="absolute inset-0 bg-black opacity-10"></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-2xl mx-auto text-center text-white fade-in">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">
          ${content.ctas[content.ctas.length - 1]?.texto || 'Comece Agora'}
        </h2>
        <p class="text-xl mb-10 opacity-90">
          Transforme sua operação com automação inteligente
        </p>
        
        <!-- Formulário de Contato -->
        <form class="bg-white rounded-2xl shadow-2xl p-8 text-left" onsubmit="handleFormSubmit(event)">
          <div class="mb-4">
            <label class="block text-gray-700 font-semibold mb-2">Nome Completo *</label>
            <input type="text" name="name" placeholder="Seu nome" required
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 outline-none text-gray-900 placeholder-gray-500 bg-white focus:border-purple-500 transition-colors">
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 font-semibold mb-2">E-mail *</label>
            <input type="email" name="email" placeholder="seu@email.com" required
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 outline-none text-gray-900 placeholder-gray-500 bg-white focus:border-purple-500 transition-colors">
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 font-semibold mb-2">Telefone/WhatsApp</label>
            <input type="tel" name="phone" placeholder="(11) 99999-9999"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 outline-none text-gray-900 placeholder-gray-500 bg-white focus:border-purple-500 transition-colors">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 font-semibold mb-2">Mensagem</label>
            <textarea name="message" rows="4" placeholder="Como podemos ajudar?"
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 outline-none text-gray-900 placeholder-gray-500 bg-white focus:border-purple-500 transition-colors"></textarea>
          </div>
          <button type="submit"
            class="w-full text-white font-bold px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg" style="background: ${theme.primaryColor}">
            🎁 Enviar e Receber Material Gratuito
          </button>
          <p class="text-xs text-gray-500 text-center mt-3">
            📧 Após enviar, você receberá nosso eBook "100 Dicas de Presença Online" por email
          </p>
        </form>
      </div>
    </div>
  </section>
  
  <!-- WhatsApp Button Fixo -->
  <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer"
    class="fixed bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 z-50 flex items-center justify-center">
    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </a>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-300 py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 class="font-bold text-white mb-4">Sobre</h4>
            <p class="text-sm">Soluções de automação com IA para empresas modernas.</p>
          </div>
          <div>
            <h4 class="font-bold text-white mb-4">Links Úteis</h4>
            <ul class="text-sm space-y-2">
              ${content.linksInternos.slice(0, 3).map(link => `
                <li><a href="${link.url}" class="hover:text-purple-400 transition-colors">${link.texto}</a></li>
              `).join('')}
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-white mb-4">Legal</h4>
            <ul class="text-sm space-y-2">
              <li><a href="#termos" class="hover:text-purple-400 transition-colors">Termos de Uso</a></li>
              <li><a href="#privacidade" class="hover:text-purple-400 transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-sm text-center md:text-left">
              &copy; ${new Date().getFullYear()} Todos os direitos reservados.
            </p>
            <a href="https://catbytes.site" target="_blank" rel="noopener noreferrer" 
               class="flex items-center gap-2 text-sm transition-all group hover:scale-105">
              <span class="text-gray-500 group-hover:text-gray-400">Powered by</span>
              <svg class="w-5 h-5" style="color: ${theme.iconColor}" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <span class="font-bold" style="color: ${theme.iconColor}">CATBytes IA</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>

  <script>
    // Demo Interativa
    function showDemoStep(stepNumber) {
      const steps = document.querySelectorAll('.demo-step');
      steps.forEach(step => {
        if (parseInt(step.dataset.step) === stepNumber) {
          step.classList.remove('hidden');
          step.classList.add('animate-fade-in');
          
          // Se for step 2, simular processamento e avançar automaticamente para step 3
          if (stepNumber === 2) {
            setTimeout(() => {
              showDemoStep(3);
            }, 2000); // 2 segundos de "processamento"
          }
        } else {
          step.classList.add('hidden');
          step.classList.remove('animate-fade-in');
        }
      });
    }

    // Download do PDF
    function downloadPDF() {
      const link = document.createElement('a');
      link.href = '/100-dicas-presenca-online-catbytes.pdf';
      link.download = '100-dicas-presenca-online-catbytes.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Form Submit
    function handleFormSubmit(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      // Adicionar slug da LP
      data.landing_page_slug = window.location.pathname.split('/').pop();
      data.source = 'landing_page';
      
      // Desabilitar botão durante envio
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg class="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
      
      // Enviar para API
      fetch('/api/landing-pages/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            // Download automático do PDF
            downloadPDF();
            
            // Mostrar mensagem de sucesso
            alert('✅ Sucesso!\\n\\nSeu material está sendo baixado!\\n\\nVocê também receberá um email com:\\n- eBook "100 Dicas de Presença Online"\\n- Acesso aos materiais exclusivos\\n\\nVerifique sua caixa de entrada (e spam).');
            
            // Resetar formulário
            e.target.reset();
            
            // Scroll suave para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            alert('❌ Erro: ' + (result.error || 'Não foi possível enviar. Tente novamente.'));
          }
        })
        .catch(error => {
          console.error('Erro:', error);
          alert('❌ Erro de conexão. Verifique sua internet e tente novamente.');
        })
        .finally(() => {
          // Reabilitar botão
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        });
    }
  </script>
</body>
</html>
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
    setHeroImageUrl(null)

    try {
      // 1. Gerar conteúdo da LP
      const res = await fetch('/api/landing-pages/generate-rich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, tipo })
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      setGeneratedLP(data.content)

      // 2. Gerar imagem hero em paralelo
      setGeneratingImage(true)
      try {
        console.log('🎨 Iniciando geração de imagem hero...')
        const imageRes = await fetch('/api/landing-pages/generate-hero-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nicho, 
            titulo: data.content.title 
          })
        })

        const imageData = await imageRes.json()
        
        if (imageData.success && imageData.imageUrl) {
          setHeroImageUrl(imageData.imageUrl)
          console.log('✅ Imagem hero gerada:', imageData.imageUrl)
        } else {
          console.error('⚠️ Erro ao gerar imagem:', imageData.error)
          alert('⚠️ Não foi possível gerar a imagem hero. A LP será criada com gradiente.')
        }
      } catch (imageError: any) {
        console.error('⚠️ Erro ao gerar imagem hero:', imageError)
        alert('⚠️ Erro na geração da imagem hero: ' + imageError.message)
      } finally {
        setGeneratingImage(false)
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
      const htmlContent = convertToHTML(generatedLP, heroImageUrl)

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
          hero_image_url: heroImageUrl, // Adiciona URL da imagem hero gerada
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
          {/* Status da Imagem Hero */}
          {generatingImage && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Gerando imagem hero profissional...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Criando fotografia corporativa de alta qualidade com IA
                  </p>
                </div>
              </div>
            </Card>
          )}

          {heroImageUrl && !generatingImage && (
            <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Imagem hero gerada com sucesso!
                </p>
              </div>
              <img 
                src={heroImageUrl} 
                alt="Preview Hero" 
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
            </Card>
          )}

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

          {/* Estrutura do Conteúdo */}
          <Card className="p-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Estrutura do Conteúdo
            </h4>
            
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
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  LP ainda não foi salva. Salve primeiro para poder visualizar e fazer deploy.
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
                  LP salva com sucesso! Agora você pode visualizar e fazer deploy.
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
