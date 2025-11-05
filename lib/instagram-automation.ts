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
    contextoImagem: 'Professional lawyer in modern office with stacks of legal documents on desk, looking stressed, warm office lighting, realistic photography style'
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
    contextoImagem: 'Doctor in white coat sitting at clinic desk with computer and medical charts, overwhelmed with paperwork, bright medical office, realistic photography'
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
    contextoImagem: 'Therapist in calm office with notebook and laptop, surrounded by appointment books, peaceful therapy room setting, natural lighting, realistic photography'
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
    contextoImagem: 'Nutritionist at desk with meal plans and food charts spread out, working on laptop, bright professional office, realistic photography style'
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
    'Ganhe 12h por semana',
    'Automatize contratos em segundos',
    'Reduza 60% tarefas administrativas',
    'IA jurídica que escala'
  ],
  medicos: [
    'Aumente receita em 47%',
    'Libere 3h diárias de trabalho',
    'Agendamentos 24/7 com IA',
    'Mais consultas, menos burocracia'
  ],
  terapeutas: [
    'Reduza 80% das faltas',
    'Ganhe 2h por dia',
    'IA confirma sessões automaticamente',
    'Escale sem contratar assistente'
  ],
  nutricionistas: [
    'Aumente ROI em 55%',
    'Dobre sua capacidade atendimento',
    'Planos personalizados em minutos',
    'Acompanhamento 24/7 automático'
  ]
}
