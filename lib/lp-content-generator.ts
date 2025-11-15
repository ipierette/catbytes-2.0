/**
 * Landing Page Content Generator - Sistema de geração de conteúdo SEO-friendly
 * Gera LPs completas com recursos valiosos e link building interno automatizado
 */

import OpenAI from 'openai'
import type { NicheValue } from './landing-pages-constants'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

// =====================================================
// TIPOS
// =====================================================

export interface LeadMagnetItem {
  titulo: string
  descricao: string
  icon?: string // emoji ou nome do ícone
}

export interface LPContentTemplate {
  tipo: 'guia' | 'calculadora' | 'checklist' | 'comparativo' | 'case-study'
  titulo: string
  descricao: string
  minPalavras: number
}

export interface LPRichContent {
  // SEO
  title: string // 50-60 chars
  metaDescription: string // 150-160 chars
  slug: string
  keywords: string[]
  
  // Estrutura
  h1: string
  introducao: string
  secoes: Array<{
    h2: string
    conteudo: string
    items?: string[] // Para listas
  }>
  
  // Recursos Linkáveis
  recursoDestaque: {
    tipo: 'calculadora' | 'checklist' | 'infografico' | 'quiz'
    titulo: string
    descricao: string
  }
  
  // Lead Magnet (Checklist/Guia/eBook)
  leadMagnet: {
    tipo: 'checklist' | 'guia' | 'ebook' | 'template' | 'kit' | 'planilha'
    titulo: string
    subtitulo: string
    estatistica?: string // Ex: "78% das implementações falham por pular estas etapas"
    items: LeadMagnetItem[]
    ctaTitulo: string
    ctaDescricao: string
  }
  
  // Link Building Interno
  linksInternos: Array<{
    texto: string
    url: string
    tipo: 'blog' | 'lp' | 'servico'
    contexto: string // Onde inserir o link
  }>
  
  // CTA
  ctas: Array<{
    texto: string
    tipo: 'primario' | 'secundario'
    localizacao: 'topo' | 'meio' | 'rodape'
  }>
  
  // Dados Estruturados
  faq: Array<{
    pergunta: string
    resposta: string
  }>
  
  // Páginas Legais (SEO + Compliance)
  termosDeUso: {
    conteudo: string
    ultimaAtualizacao: string
  }
  
  politicaPrivacidade: {
    conteudo: string
    ultimaAtualizacao: string
    dadosColetados: string[]
    finalidadeDados: string[]
  }
  
  // Schema.org JSON-LD
  structuredData: {
    organization: object
    webpage: object
    faqPage: object
  }
}

// =====================================================
// TEMPLATES DE CONTEÚDO POR TIPO
// =====================================================

export const LP_TEMPLATES: Record<LPContentTemplate['tipo'], LPContentTemplate> = {
  'guia': {
    tipo: 'guia',
    titulo: 'Guia Completo 2025',
    descricao: 'Conteúdo aprofundado passo a passo com estudos de caso',
    minPalavras: 1500
  },
  'calculadora': {
    tipo: 'calculadora',
    titulo: 'Calculadora de ROI',
    descricao: 'Ferramenta interativa + explicação detalhada',
    minPalavras: 1000
  },
  'checklist': {
    tipo: 'checklist',
    titulo: 'Checklist Definitivo',
    descricao: 'Lista prática com explicações detalhadas',
    minPalavras: 1200
  },
  'comparativo': {
    tipo: 'comparativo',
    titulo: 'Comparativo Completo',
    descricao: 'Análise detalhada de soluções com prós e contras',
    minPalavras: 1300
  },
  'case-study': {
    tipo: 'case-study',
    titulo: 'Caso de Sucesso',
    descricao: 'Estudo de caso real com métricas e resultados',
    minPalavras: 1400
  }
}

// =====================================================
// CONFIGURAÇÃO DE NICHOS EXPANDIDA
// =====================================================

export const NICHE_CONTENT_CONFIG: Record<NicheValue, {
  keywords: string[]
  dolorPrincipal: string
  solucaoIA: string
  metricas: string[]
  concorrentes: string[]
}> = {
  'consultorio': {
    keywords: ['automação consultório médico', 'chatbot médico', 'agendamento automático pacientes'],
    dolorPrincipal: 'Perda de consultas por falha na confirmação e agenda desorganizada',
    solucaoIA: 'Sistema de confirmação automática via WhatsApp com IA que reduz faltas em 70%',
    metricas: ['70% redução de faltas', '3h/dia economizadas', '40% aumento ocupação agenda'],
    concorrentes: ['secretária tradicional', 'agenda manual', 'sistemas complexos']
  },
  'advocacia': {
    keywords: ['automação escritório advocacia', 'chatbot jurídico', 'gestão processos IA'],
    dolorPrincipal: 'Perda de prazos processuais e dificuldade em acompanhar múltiplos casos',
    solucaoIA: 'IA que monitora prazos processuais 24/7 e envia alertas automáticos',
    metricas: ['100% prazos cumpridos', '60% redução tempo administrativo', '5x mais produtividade'],
    concorrentes: ['planilhas Excel', 'software jurídico tradicional', 'assistente manual']
  },
  'contabilidade': {
    keywords: ['automação contabilidade', 'chatbot contador', 'IA fiscal'],
    dolorPrincipal: 'Clientes perdidos por demora no atendimento e falta de comunicação',
    solucaoIA: 'Atendimento 24/7 via IA que responde dúvidas fiscais instantaneamente',
    metricas: ['24/7 atendimento', '80% dúvidas resolvidas automaticamente', '50% mais clientes'],
    concorrentes: ['atendimento telefônico', 'email lento', 'WhatsApp manual']
  },
  'imobiliaria': {
    keywords: ['automação imobiliária', 'chatbot imóveis', 'leads automático'],
    dolorPrincipal: 'Perda de leads quentes por demora no primeiro contato',
    solucaoIA: 'IA que qualifica leads e agenda visitas automaticamente em menos de 1 minuto',
    metricas: ['90% leads respondidos em 1min', '3x mais visitas agendadas', '40% aumento vendas'],
    concorrentes: ['corretores manuais', 'formulários tradicionais', 'telefone fixo']
  },
  'restaurante': {
    keywords: ['automação delivery', 'chatbot restaurante', 'pedidos automático'],
    dolorPrincipal: 'Pedidos perdidos em horário de pico por telefone ocupado',
    solucaoIA: 'Cardápio digital com pedidos via WhatsApp processados automaticamente pela IA',
    metricas: ['100% pedidos recebidos', '45% redução erros', '30% aumento ticket médio'],
    concorrentes: ['telefone tradicional', 'apps delivery caros', 'atendimento manual']
  },
  'academia': {
    keywords: ['automação academia', 'chatbot fitness', 'retenção alunos IA'],
    dolorPrincipal: 'Alta taxa de cancelamento por falta de engajamento',
    solucaoIA: 'IA que envia treinos personalizados e motivação diária automaticamente',
    metricas: ['60% redução cancelamentos', '5x mais engajamento', '25% aumento renovações'],
    concorrentes: ['professor manual', 'app genérico', 'planilha Excel']
  },
  'beleza': {
    keywords: ['automação salão beleza', 'chatbot estética', 'agendamento automático'],
    dolorPrincipal: 'Agenda bagunçada com muitos no-shows e remarcações',
    solucaoIA: 'Sistema de confirmação e lembrete automático que reduz faltas em 80%',
    metricas: ['80% redução no-shows', '100% agenda organizada', '35% mais faturamento'],
    concorrentes: ['agenda de papel', 'WhatsApp manual', 'planilha']
  },
  'oficina': {
    keywords: ['automação oficina mecânica', 'chatbot automotivo', 'gestão veículos'],
    dolorPrincipal: 'Dificuldade em acompanhar status dos veículos e comunicar com clientes',
    solucaoIA: 'IA que atualiza clientes automaticamente sobre status do serviço em tempo real',
    metricas: ['95% satisfação cliente', '70% redução ligações', '40% mais orçamentos fechados'],
    concorrentes: ['telefone manual', 'WhatsApp confuso', 'sem comunicação']
  },
  'marketing': {
    keywords: ['automação agência marketing', 'IA para agências', 'gestão clientes automática'],
    dolorPrincipal: 'Tempo excessivo em tarefas repetitivas que não geram receita',
    solucaoIA: 'IA que automatiza relatórios, aprovações e comunicação com clientes',
    metricas: ['10h/semana economizadas', '50% mais clientes atendidos', '2x produtividade'],
    concorrentes: ['processos manuais', 'software caro', 'planilhas complexas']
  },
  'escola': {
    keywords: ['automação escola', 'chatbot educacional', 'comunicação pais automática'],
    dolorPrincipal: 'Dificuldade em manter pais informados e engajados',
    solucaoIA: 'IA que envia atualizações automáticas sobre desempenho dos alunos aos pais',
    metricas: ['90% pais engajados', '65% redução trabalho administrativo', '100% comunicação clara'],
    concorrentes: ['agenda de papel', 'email que ninguém lê', 'telefone manual']
  },
  'petshop': {
    keywords: ['automação petshop', 'chatbot veterinária', 'lembretes vacina automático'],
    dolorPrincipal: 'Vacinas e consultas atrasadas por falta de lembrete aos tutores',
    solucaoIA: 'IA que envia lembretes automáticos de vacinas, banho e consultas',
    metricas: ['85% aumento retorno', '70% vacinas em dia', '40% mais agendamentos'],
    concorrentes: ['agenda manual', 'ligação telefônica', 'sem follow-up']
  },
  'outros': {
    keywords: ['automação empresarial', 'chatbot negócios', 'IA atendimento'],
    dolorPrincipal: 'Perda de oportunidades por atendimento lento e desorganizado',
    solucaoIA: 'IA que automatiza atendimento, qualifica leads e agenda reuniões',
    metricas: ['24/7 disponibilidade', '80% processos automatizados', '50% redução custos'],
    concorrentes: ['processos manuais', 'atendimento limitado', 'sistemas caros']
  }
}

// =====================================================
// GERADOR DE CONTEÚDO RICO
// =====================================================

export async function generateRichLPContent(
  nicho: NicheValue,
  tipoTemplate: LPContentTemplate['tipo']
): Promise<LPRichContent> {
  
  const config = NICHE_CONTENT_CONFIG[nicho]
  const template = LP_TEMPLATES[tipoTemplate]
  
  const prompt = `Você é um especialista em SEO e copywriting para landing pages de alta conversão.

NICHO: ${nicho}
TIPO DE CONTEÚDO: ${template.titulo}
PALAVRAS-CHAVE PRINCIPAIS: ${config.keywords.join(', ')}

DOR PRINCIPAL DO PÚBLICO: ${config.dolorPrincipal}
SOLUÇÃO COM IA: ${config.solucaoIA}
MÉTRICAS DE RESULTADO: ${config.metricas.join(' | ')}

MISSÃO: Gerar uma landing page COMPLETA e LINKÁVEL que outros sites vão querer referenciar.

GERE UM JSON com a seguinte estrutura:

{
  "title": "Título SEO otimizado (50-60 caracteres, incluindo ano 2025)",
  "metaDescription": "Meta description persuasiva (150-160 chars) com CTA",
  "slug": "slug-url-amigavel-com-palavras-chave",
  "keywords": ["palavra1", "palavra2", "palavra3", "palavra4", "palavra5"],
  "h1": "Título principal H1 (diferente do title, mais conversacional)",
  "introducao": "Parágrafo introdutório de 150-200 palavras que estabelece credibilidade e apresenta o problema",
  "secoes": [
    {
      "h2": "Título da seção com keyword",
      "conteudo": "Conteúdo detalhado de 200-300 palavras com dados, estatísticas e exemplos práticos",
      "items": ["Item 1", "Item 2", "Item 3"] // Opcional: lista de pontos
    }
    // Mínimo 5 seções
  ],
  "recursoDestaque": {
    "tipo": "calculadora" ou "checklist" ou "quiz",
    "titulo": "Título do recurso",
    "descricao": "Descrição do valor que o recurso oferece"
  },
  "leadMagnet": {
    "tipo": "checklist" ou "guia" ou "ebook" ou "template" ou "kit" ou "planilha",
    "titulo": "Título do lead magnet (ex: 'Checklist Rápido de Preparação')",
    "subtitulo": "Subtítulo persuasivo que cria urgência (ex: 'Os 6 pontos essenciais que separam empresas que FALHAM das que LUCRAM')",
    "estatistica": "Estatística de medo/urgência (ex: '⚠️ 78% das implementações falham por pular estas etapas')",
    "items": [
      {
        "titulo": "📊 Nome do item (use emoji relevante)",
        "descricao": "Descrição que gera curiosidade SEM entregar a solução completa (mencione 'método específico', 'matriz decisória', etc)"
      }
      // 5-7 items que mencionam ferramentas/métodos secretos sem revelar
    ],
    "ctaTitulo": "🎁 Quer o [Tipo] Completo?",
    "ctaDescricao": "Promessa de valor adicional (ex: 'templates, planilhas e scripts prontos')"
  },
  "linksInternos": [
    {
      "texto": "texto âncora natural",
      "url": "/blog/artigo-relacionado",
      "tipo": "blog",
      "contexto": "Em qual seção inserir (usar número da seção)"
    }
    // Mínimo 3 links internos estratégicos
  ],
  "ctas": [
    {
      "texto": "CTA persuasivo",
      "tipo": "primario",
      "localizacao": "topo"
    }
    // 3 CTAs em localizações diferentes
  ],
  "faq": [
    {
      "pergunta": "Pergunta comum do público",
      "resposta": "Resposta completa e otimizada para featured snippets (50-100 palavras)"
    }
    // Mínimo 5 perguntas
  ]
}

DIRETRIZES CRÍTICAS:
1. Conteúdo mínimo: ${template.minPalavras} palavras
2. Use dados numéricos e percentuais (${config.metricas.join(', ')})
3. Inclua comparação com alternativas (${config.concorrentes.join(', ')})
4. Tom: profissional mas acessível, autoritativo mas empático
5. Cada seção deve ser linkável (conteúdo único e valioso)
6. Links internos devem ser NATURAIS no contexto
7. FAQ otimizado para aparecer em featured snippets do Google
8. Use storytelling quando possível (caso de sucesso real ou hipotético)
9. Termos de Uso e Política de Privacidade devem ser COMPLETOS e específicos para automação com IA
10. Structured Data (JSON-LD) deve seguir schema.org perfeitamente

**LEAD MAGNET - REGRAS DE OURO:**
- NUNCA entregue a solução completa - apenas mencione que existe
- Use verbos como: "Descubra", "Aprenda o método", "Receba o framework"
- Mencione ferramentas proprietárias: "nossa matriz de ROI", "checklist de compatibilidade", "template validado"
- Crie FOMO: estatísticas de falha, urgência, escassez implícita
- Gatilhos: Curiosidade + Autoridade + Promessa de Atalho
- Tipo do leadMagnet deve variar: checklist para processos, guia para conceitos, ebook para estratégias, planilha para cálculos

ADICIONE TAMBÉM:

{
  "termosDeUso": {
    "conteudo": "HTML completo dos termos de uso específicos para serviços de automação com IA (mínimo 800 palavras, incluindo: escopo do serviço, responsabilidades, limitações de responsabilidade, propriedade intelectual, rescisão, lei aplicável)",
    "ultimaAtualizacao": "2025-11-14"
  },
  "politicaPrivacidade": {
    "conteudo": "HTML completo da política de privacidade conforme LGPD (mínimo 1000 palavras, incluindo: tipos de dados coletados, base legal, finalidade, compartilhamento, direitos do titular, cookies, retenção de dados)",
    "ultimaAtualizacao": "2025-11-14",
    "dadosColetados": ["Nome", "Email", "Telefone", "Empresa", "Dados de uso do chatbot"],
    "finalidadeDados": ["Prestação de serviço", "Comunicação", "Melhorias no sistema", "Marketing (com consentimento)"]
  },
  "structuredData": {
    "organization": {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "CatBytes",
      "url": "https://catbytes.site",
      "logo": "https://catbytes.site/images/logo.png",
      "description": "Automação empresarial com IA",
      "sameAs": ["https://linkedin.com/company/catbytes", "https://github.com/catbytes"]
    },
    "webpage": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "[USAR O H1]",
      "description": "[USAR META DESCRIPTION]",
      "url": "https://catbytes.site/lp/[SLUG]"
    },
    "faqPage": {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "[PERGUNTA DO FAQ]",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[RESPOSTA DO FAQ]"
          }
        }
      ]
    }
  }
}

Retorne APENAS o JSON, sem markdown ou explicações.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  })

  const content = JSON.parse(response.choices[0].message.content || '{}')
  
  return content as LPRichContent
}

// =====================================================
// SUGESTÕES DE LPs POR NICHO
// =====================================================

export function getSuggestedLPs(nicho: NicheValue): Array<{
  tipo: LPContentTemplate['tipo']
  titulo: string
  prioridade: 'alta' | 'média' | 'baixa'
}> {
  const base = [
    {
      tipo: 'guia' as const,
      titulo: `Guia Completo: Automação com IA para ${nicho} em 2025`,
      prioridade: 'alta' as const
    },
    {
      tipo: 'calculadora' as const,
      titulo: `Calculadora de ROI: Quanto Você Economiza com Automação`,
      prioridade: 'alta' as const
    },
    {
      tipo: 'checklist' as const,
      titulo: `Checklist: 10 Sinais que Seu Negócio Precisa de IA Agora`,
      prioridade: 'média' as const
    },
    {
      tipo: 'comparativo' as const,
      titulo: `Comparativo: IA vs Processos Manuais - Qual Compensa?`,
      prioridade: 'média' as const
    },
    {
      tipo: 'case-study' as const,
      titulo: `Caso Real: Como [Empresa] Aumentou Vendas em 40% com IA`,
      prioridade: 'baixa' as const
    }
  ]
  
  return base
}
