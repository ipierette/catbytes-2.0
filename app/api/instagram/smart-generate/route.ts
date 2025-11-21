/**
 * API de Geração Inteligente de Conteúdo para Instagram
 * 
 * Sistema avançado que:
 * - Gera temas únicos e variados automaticamente
 * - Analisa posts recentes para evitar repetição
 * - Cria prompts de imagem corporativos otimizados
 * - Gera legendas persuasivas focadas em vendas
 * - Suporta geração em lote (1-10 posts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Categorias estratégicas para diversificação
const CONTENT_STRATEGIES = [
  'Problema → Solução',
  'Antes vs Depois',
  'Case de Sucesso',
  'Dica Rápida',
  'Erro Comum',
  'Checklist',
  'Tutorial Simples',
  'Curiosidade / Fato',
  'Transformação Digital',
  'ROI e Números'
]

const BUSINESS_AREAS = [
  'Saúde (clínicas, consultórios)',
  'Jurídico (advocacia, cartórios)',
  'Financeiro (contabilidade, consultorias)',
  'Varejo (lojas físicas, e-commerce)',
  'Alimentação (restaurantes, cafés)',
  'Beleza (salões, estética)',
  'Fitness (academias, personal trainers)',
  'Educação (escolas, cursos)',
  'Imóveis (imobiliárias, construtoras)',
  'Automotivo (oficinas, concessionárias)',
  'Pet (clínicas vet, pet shops)',
  'Tecnologia (agências, startups)'
]

const PAIN_POINTS = [
  'perda de clientes por atendimento lento',
  'tempo gasto em tarefas manuais repetitivas',
  'desorganização de agendamentos',
  'falta de controle financeiro',
  'dificuldade em acompanhar leads',
  'processos internos ineficientes',
  'falta de dados para tomar decisões',
  'comunicação desorganizada com clientes',
  'estoque mal controlado',
  'relatórios manuais demorados'
]

const AUTOMATION_SOLUTIONS = [
  'sistema de agendamento inteligente',
  'chatbot de atendimento 24/7',
  'dashboard de métricas em tempo real',
  'automação de email marketing',
  'CRM personalizado',
  'integração WhatsApp + CRM',
  'geração automática de relatórios',
  'controle de estoque automatizado',
  'pipeline de vendas visual',
  'automação de cobrança e lembretes'
]

export async function POST(request: NextRequest) {
  console.log('🧠 [SMART-GEN] === INICIANDO GERAÇÃO INTELIGENTE ===')
  
  try {
    const body = await request.json()
    const { quantidade = 1, focusArea, customTheme } = body

    console.log('🧠 [SMART-GEN] Config:', { quantidade, focusArea, customTheme })

    // Validações
    if (quantidade < 1 || quantidade > 10) {
      return NextResponse.json(
        { error: 'Quantidade deve ser entre 1 e 10' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada' },
        { status: 500 }
      )
    }

    // 1. Buscar posts recentes para análise de variedade
    console.log('🧠 [SMART-GEN] Buscando posts recentes...')
    
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client não configurado')
    }
    
    const { data: recentPosts } = await supabaseAdmin
      .from('instagram_posts')
      .select('titulo, caption, nicho, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    const recentThemes = recentPosts?.map(p => p.titulo).join(', ') || 'Nenhum post recente'
    console.log('🧠 [SMART-GEN] Temas recentes:', recentThemes.substring(0, 200))

    // 2. Gerar temas únicos e variados com GPT-4
    console.log('🧠 [SMART-GEN] Gerando temas únicos...')
    
    const themePrompt = `Você é um estrategista de conteúdo especializado em marketing B2B para empresas.

CONTEXTO:
- Empresa: CatBytes (desenvolvedora especializada em automação empresarial)
- Site: catbytes.site
- Serviços: Desenvolvimento web, automação de processos, chatbots, sistemas personalizados
- Público: Pequenas e médias empresas que precisam de automação

POSTS RECENTES (EVITE REPETIR):
${recentThemes}

TAREFA:
Gere ${quantidade} tema(s) ÚNICO(S) e VARIADO(S) para posts do Instagram.

DIRETRIZES:
✅ Cada tema deve ser DIFERENTE dos posts recentes
✅ Focar em PROBLEMAS REAIS de negócios
✅ Variar entre: cases, dicas, tutoriais, transformações, curiosidades
✅ Mesclar diferentes áreas: saúde, jurídico, varejo, alimentação, etc
✅ Ser específico: "Sistema de agendamento para clínicas" > "Automação"
${focusArea ? `✅ Dar prioridade a: ${focusArea}` : ''}
${customTheme ? `✅ Incluir tema customizado: ${customTheme}` : ''}

ESTRUTURA DE CADA TEMA:
- strategy: escolha 1 das estratégias ${CONTENT_STRATEGIES.join(', ')}
- businessArea: escolha 1 área ${BUSINESS_AREAS.join(', ')}
- painPoint: dor específica que o negócio sente
- solution: automação/sistema que resolve
- hook: frase de impacto (15-30 palavras)

EXEMPLOS DE TEMAS BONS:
{
  "strategy": "Problema → Solução",
  "businessArea": "Saúde (clínicas, consultórios)",
  "painPoint": "perda de 30% dos pacientes por demora em responder WhatsApp",
  "solution": "chatbot inteligente que agenda consultas 24/7",
  "hook": "Sua clínica está perdendo pacientes por demora no WhatsApp? Veja como resolver."
}

{
  "strategy": "Antes vs Depois",
  "businessArea": "Varejo (lojas físicas, e-commerce)",
  "painPoint": "6 horas por dia controlando estoque em planilhas",
  "solution": "dashboard automatizado que atualiza estoque em tempo real",
  "hook": "De 6 horas por dia em planilhas para controle automático de estoque."
}

Retorne um objeto JSON com array de themes:
{
  "themes": [
    {
      "strategy": "...",
      "businessArea": "...",
      "painPoint": "...",
      "solution": "...",
      "hook": "..."
    }
  ]
}`

    const themeCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um estrategista de marketing B2B. Sempre retorna JSON válido. Seja extremamente criativo e varie MUITO entre: saúde, jurídico, varejo, alimentação, fitness, beleza, tecnologia, pet, imóveis, automotivo. NUNCA repita o mesmo nicho consecutivamente.'
        },
        {
          role: 'user',
          content: themePrompt
        }
      ],
      temperature: 1.2, // Máxima criatividade para garantir variedade
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      seed: Math.floor(Math.random() * 1000000) // Seed aleatória para cada geração
    })

    let themes: any[]
    try {
      const themeResponse = JSON.parse(themeCompletion.choices[0].message.content || '{}')
      console.log('🧠 [SMART-GEN] Resposta parseada:', themeResponse)
      themes = Array.isArray(themeResponse) ? themeResponse : themeResponse.themes || []
      
      if (!themes || themes.length === 0) {
        console.error('🧠 [SMART-GEN] Resposta do GPT:', themeCompletion.choices[0].message.content)
        throw new Error('Nenhum tema gerado pela IA')
      }
    } catch (e: any) {
      console.error('🧠 [SMART-GEN] Erro ao parsear temas:', e)
      console.error('🧠 [SMART-GEN] Conteúdo recebido:', themeCompletion.choices[0].message.content)
      throw new Error(`Erro ao processar resposta da IA: ${e.message}`)
    }

    console.log(`🧠 [SMART-GEN] ✓ ${themes.length} temas únicos gerados`)

    // 3. Para cada tema, gerar conteúdo completo
    const generatedPosts = []

    for (const theme of themes) {
      console.log(`🧠 [SMART-GEN] Gerando conteúdo para: ${theme.hook}`)

      const contentPrompt = `Você é um copywriter especializado em vendas B2B e automação empresarial.

EMPRESA: CatBytes
Site: catbytes.site
Especialidade: Automação de processos empresariais, desenvolvimento web, chatbots, sistemas personalizados

TEMA DO POST:
Estratégia: ${theme.strategy}
Área de Negócio: ${theme.businessArea}
Dor: ${theme.painPoint}
Solução: ${theme.solution}
Hook: ${theme.hook}

GERE CONTEÚDO COMPLETO:

1. **titulo**: Título impactante e específico (máx 60 caracteres)
   Exemplos: "Clínica automatizou agenda: +40% pacientes" | "Dashboard que economiza 6h/dia"

2. **imagePrompt**: Prompt DETALHADO para imagem CORPORATIVA e PROFISSIONAL adaptada ao tema.
   
   DIRETRIZES OBRIGATÓRIAS:
   - Foto profissional (não ilustração) relacionada ao nicho ${theme.businessArea}
   - VARIAR O CENÁRIO conforme o tema:
     * Saúde: consultório médico, equipamentos médicos, atendimento
     * Jurídico: escritório de advocacia, livros de direito, reunião com cliente
     * Varejo: loja moderna, PDV digital, atendimento ao cliente
     * Alimentação: restaurante, cozinha profissional, sistema de pedidos
     * Beleza: salão de beleza, agenda digital, cliente satisfeita
     * Fitness: academia moderna, app de treino, personal trainer
     * Educação: sala de aula tech, plataforma digital, estudantes
     * Tecnologia: workspace tech, dashboard de dados, código/desenvolvimento
   - Roupa apropriada ao contexto (nem sempre blazer - pode ser jaleco, uniforme, casual tech)
   - Tecnologia presente mas contextualizada: tablet, smartphone, sistema específico
   - EVITAR REPETIÇÃO: alternar entre: pessoa trabalhando, tela de sistema, resultado do serviço, antes/depois
   - Iluminação profissional adequada ao ambiente
   - Cores relacionadas ao nicho (não apenas azul corporativo)
   - Qualidade stock photo profissional
   
   TEXTO NA IMAGEM:
   - Frase ultra-curta relacionada ao benefício específico (máx 15 caracteres)
   - Exemplos: "Automação 48h" | "+40% vendas" | "Zero espera" | "24/7 online"
   - Tipografia moderna e bold
   - Posição destacada (canto superior direito ou centro)
   
   EXEMPLOS POR NICHO:
   - Saúde: "Foto profissional de médico usando tablet em consultório moderno, jaleco branco, tela mostrando agenda digital organizada, paciente ao fundo em sala de espera confortável, cores verde saúde e branco, texto 'Zero espera' em bold verde, iluminação clean, formato quadrado 1:1"
   - Varejo: "Foto profissional de vendedora sorrindo usando tablet em loja moderna, sistema PDV digital na tela, produtos organizados ao fundo, cliente satisfeito, cores vibrantes da loja, texto '+40% vendas' em bold laranja, formato quadrado 1:1"
   - Fitness: "Foto profissional de personal trainer com aluno, tablet mostrando app de treinos personalizado, academia moderna ao fundo, cores energéticas laranja e preto, texto 'Treino IA' em bold, iluminação dinâmica, formato quadrado 1:1"
   
   IMPORTANTE: ADAPTE O PROMPT AO CONTEXTO ESPECÍFICO DO TEMA! Não use sempre "escritório com planilhas".

3. **caption**: Legenda PERSUASIVA focada em vendas (máx 2200 chars)
   
   ESTRUTURA OBRIGATÓRIA:
   
   [HOOK - 1º parágrafo]
   Pergunta sobre a DOR específica ou dado impactante
   Exemplo: "${theme.hook}"
   
   [AGITAR DOR - 2º parágrafo]
   Expandir o problema: quanto custa (tempo/dinheiro), consequências, impacto no negócio
   
   [SOLUÇÃO - 3º parágrafo]
   Apresentar ${theme.solution} como solução
   Benefícios tangíveis: economia de X horas, aumento Y%, disponibilidade 24/7
   
   [CATBYTES - 4º parágrafo]
   "A CatBytes é especialista em automação de processos para empresas."
   Mencionar 2-3 serviços específicos relevantes
   Enfatizar: solução sob medida, implementação rápida (48-72h), suporte completo
   
   [CALL-TO-ACTION - 5º parágrafo]
   SEMPRE incluir: "👉 Acesse catbytes.site e conheça nossas soluções"
   Adicionar urgência quando cabível
   Pedir ação: "Comenta seu tipo de negócio" ou "Chama no direct"
   
   [HASHTAGS - 8-12 hashtags]
   Mesclar: automação, tecnologia, produtividade, negócios, nicho específico
   Exemplos: #automacao #desenvolvimentoweb #tecnologia #negocios #produtividade
   
   Tom: profissional, direto, focado em resultados práticos

REGRAS:
✅ Sempre mencionar CatBytes e catbytes.site
✅ Focar em RESULTADOS (tempo economizado, aumento de conversão, etc)
✅ Usar números quando possível (40h economizadas, +30% conversão)
✅ Tom profissional mas acessível
✅ Tudo em português brasileiro
❌ NÃO fazer promessas irreais
❌ NÃO esquecer de incluir catbytes.site no CTA
❌ NÃO usar jargões técnicos excessivos

Retorne APENAS um objeto JSON válido:
{
  "titulo": "...",
  "imagePrompt": "...",
  "caption": "..."
}`

      const contentCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um copywriter expert em vendas B2B. Sempre retorna JSON válido.'
          },
          {
            role: 'user',
            content: contentPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      })

      let content
      try {
        content = JSON.parse(contentCompletion.choices[0].message.content || '{}')
      } catch (e) {
        console.error('🧠 [SMART-GEN] Erro ao parsear conteúdo:', e)
        continue
      }

      if (!content.titulo || !content.imagePrompt || !content.caption) {
        console.error('🧠 [SMART-GEN] Conteúdo incompleto:', content)
        continue
      }

      generatedPosts.push({
        titulo: content.titulo,
        imagePrompt: content.imagePrompt,
        caption: content.caption,
        nicho: theme.businessArea,
        tema: theme.hook,
        estrategia: theme.strategy,
        solucao: theme.solution
      })

      console.log(`🧠 [SMART-GEN] ✓ Post gerado: ${content.titulo}`)
    }

    console.log(`🧠 [SMART-GEN] ✅ GERAÇÃO COMPLETA! Total: ${generatedPosts.length}`)

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      message: `${generatedPosts.length} post(s) único(s) e variado(s) gerado(s) com sucesso!`,
      analytics: {
        totalGenerated: generatedPosts.length,
        recentPostsAnalyzed: recentPosts?.length || 0,
        uniqueThemes: themes.length
      }
    })

  } catch (error: any) {
    console.error('🧠 [SMART-GEN] ❌ ERRO:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao gerar conteúdo',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
