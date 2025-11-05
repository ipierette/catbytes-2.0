/**
 * Sistema de Automação de Instagram - CatBytes
 * Postagens estratégicas para venda de automações com IA
 */

export type Niche = 'advogados' | 'medicos' | 'terapeutas' | 'nutricionistas'

export interface PostContent {
  nicho: Niche
  titulo: string
  textoImagem: string // Máximo 6 palavras para overlay
  caption: string
  hashtags: string[]
  imagePrompt: string // Prompt para DALL-E
}

export interface InstagramPost {
  id?: string
  created_at?: string
  nicho: Niche
  titulo: string
  texto_imagem: string
  caption: string
  image_url: string
  instagram_post_id?: string
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'failed'
  error_message?: string
  scheduled_for?: string
  approved_at?: string
  approved_by?: string
  published_at?: string
}


// Configuração dos nichos
export const NICHES: Record<Niche, {
  nome: string
  dores: string[]
  beneficios: string[]
  hashtags: string[]
  contextoImagem: string
}> = {
  advogados: {
    nome: 'Advogados',
    dores: [
      'Pilhas de processos para revisar',
      'Agendamentos manuais que consomem tempo',
      'Contratos repetitivos para redigir',
      'Gestão de prazos e documentos'
    ],
    beneficios: [
      'Automatize revisão de contratos em segundos',
      'IA que agenda e organiza seus clientes',
      'Ganhe 12h por semana com automação jurídica',
      'Reduza 60% do tempo em tarefas administrativas'
    ],
    hashtags: [
      '#AutomaçãoJurídica',
      '#IAparaAdvogados',
      '#TechJurídico',
      '#AdvocaciaDigital',
      '#ProdutividadeJurídica',
      '#InovaçãoJurídica',
      '#LegalTech',
      '#AdvocaciaEficiente'
    ],
    contextoImagem: 'Modern law office with sleek laptop showing automated legal dashboard, organized desk with minimal documents, bright natural lighting, professional and efficient workspace. Clean, sophisticated environment showcasing digital transformation and productivity. No people in frame, focus on technology and organization.'
  },
  medicos: {
    nome: 'Médicos',
    dores: [
      'Agendamentos telefônicos intermináveis',
      'Prontuários manuais que geram atrasos',
      'Falta de tempo para mais consultas',
      'Secretária sobrecarregada'
    ],
    beneficios: [
      'Automatize agendamentos 24/7 com IA',
      'Libere 3h diárias para mais atendimentos',
      'Aumente sua receita em 47% com automação',
      'IA que gerencia toda sua agenda médica'
    ],
    hashtags: [
      '#IAparaMédicos',
      '#AutomaçãoMédica',
      '#HealthTech',
      '#MedicinaDigital',
      '#ConsultórioDigital',
      '#InovaçãoMédica',
      '#ProdutividadeMédica',
      '#TecnologiaNaSaúde'
    ],
    contextoImagem: 'Modern medical office with digital tablet showing appointment scheduling system, clean organized desk with stethoscope, bright professional healthcare environment. Efficient digital medical workspace with technology integration. No people in frame, focus on medical technology and organization.'
  },
  terapeutas: {
    nome: 'Terapeutas',
    dores: [
      'Confirmações de sessão uma por uma',
      'Perda de pacientes por desorganização',
      'Horas no WhatsApp agendando',
      'Falta de sistema de lembretes'
    ],
    beneficios: [
      'IA confirma suas sessões automaticamente',
      'Reduza 80% das faltas com lembretes inteligentes',
      'Ganhe 2h por dia sem agendamentos manuais',
      'Escale seu consultório sem contratar assistente'
    ],
    hashtags: [
      '#IAparaTerapeutas',
      '#TerapiaDigital',
      '#PsicologiaDigital',
      '#AutomaçãoTerapêutica',
      '#ConsultórioOnline',
      '#TechNaPsicologia',
      '#ProdutividadeTerapêutica',
      '#InovaçãoNaSaúdeMental'
    ],
    contextoImagem: 'Peaceful therapy office with modern laptop showing digital calendar system, comfortable seating area, plants, soft natural lighting, organized and serene environment. Professional therapeutic workspace showcasing digital organization tools. No people in frame, focus on calm productivity and technology.'
  },
  nutricionistas: {
    nome: 'Nutricionistas',
    dores: [
      'Planos alimentares repetitivos',
      'Mensagens de pacientes o dia todo',
      'Acompanhamento manual de dietas',
      'Escala limitada de atendimentos'
    ],
    beneficios: [
      'IA gera planos personalizados em minutos',
      'Automatize acompanhamento de pacientes 24/7',
      'Dobre sua capacidade de atendimentos',
      'Aumente ROI em 55% com automação nutricional'
    ],
    hashtags: [
      '#IAparaNutricionistas',
      '#NutriçãoDigital',
      '#AutomaçãoNutricional',
      '#NutriTech',
      '#ConsultórioNutricional',
      '#InovaçãoNutricional',
      '#ProdutividadeNutri',
      '#TecnologiaNaNutrição'
    ],
    contextoImagem: 'Modern nutrition office with digital tablet displaying meal planning app, fresh fruits and vegetables artfully arranged, bright clean workspace with natural lighting. Professional nutrition consultation room showcasing digital tools and healthy lifestyle. No people in frame, focus on nutrition technology and wellness.'
  }
}

// Horários de postagem (BRT - UTC-3)
export const POST_SCHEDULE = {
  days: [1, 3, 5, 0], // Segunda, Quarta, Sexta, Domingo
  hour: 10,
  minute: 0,
  timezone: 'America/Sao_Paulo'
}

// Textos curtos para overlay na imagem (máximo 6 palavras)
export const IMAGE_OVERLAY_TEXTS = {
  advogados: [
    '+12h LIVRES POR SEMANA',
    'CONTRATOS EM 30 SEGUNDOS',
    '60% MENOS BUROCRACIA',
    'IA JURÍDICA REVOLUCIONÁRIA',
    'AUTOMATIZAÇÃO TOTAL ESCRITÓRIO',
    'GANHE TEMPO, GANHE MAIS'
  ],
  medicos: [
    '+47% DE RECEITA GARANTIDO',
    '3H EXTRAS PARA CONSULTAS',
    'AGENDAMENTO 100% AUTOMÁTICO',
    'ZERO LIGAÇÕES PERDIDAS',
    'CONSULTÓRIO DO FUTURO',
    'MAIS PACIENTES, ZERO STRESS'
  ],
  terapeutas: [
    '80% MENOS FALTAS',
    '+2H LIVRES DIARIAMENTE',
    'IA CONFIRMA TUDO SOZINHA',
    'ESCALE SEM FUNCIONÁRIOS',
    'TERAPIA DIGITAL AVANÇADA',
    'ORGANIZE-SE AUTOMATICAMENTE'
  ],
  nutricionistas: [
    '+55% DE ROI COMPROVADO',
    'DOBRE SEUS ATENDIMENTOS',
    'PLANOS EM 2 MINUTOS',
    'ACOMPANHAMENTO INTELIGENTE',
    'NUTRIÇÃO AUTOMATIZADA',
    'MAIS RESULTADOS, MENOS TEMPO'
  ]
}
