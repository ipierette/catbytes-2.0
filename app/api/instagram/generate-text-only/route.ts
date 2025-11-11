import { NextRequest, NextResponse } from 'next/server'

const openai = require('openai')

const client = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Temas e subtemas estratégicos para geração de conteúdo
const STRATEGIC_THEMES = {
  clients: [
    "Como automatizei X horas por semana de um negócio",
    "Antes vs Depois de um fluxo automatizado",
    "Por que seu site atual não vende",
    "Dashboard personalizado que criei para cliente",
    "Chatbot que aumentou conversão em X%",
    "Sistema de agendamento inteligente",
    "Integração entre ferramentas que salvou X horas",
    "Landing page que dobrou as vendas",
    "Automação de email marketing com IA",
    "CRM customizado para nicho específico"
  ],
  recruiters: [
    "Como penso arquitetura de sistemas",
    "Meu processo de code review",
    "Tech stack que escolhi e por quê",
    "Como organizo roadmap de produto",
    "Decisões técnicas que tomei",
    "Pattern que uso para escalabilidade",
    "Como faço deploy sem downtime",
    "Debugging de problema complexo",
    "Refatoração que melhorou performance",
    "Minha abordagem de testes"
  ],
  viral: [
    "Expectativa vs Realidade de ser dev",
    "Automação maluca que fiz",
    "IA fazendo coisas inesperadas",
    "Desmistificando tecnologia complexa",
    "Processo técnico de forma visual",
    "Bug mais bizarro que encontrei",
    "IA vs Humano em tarefa específica",
    "Tecnologia do futuro que já existe",
    "Hack de produtividade para devs",
    "Ferramenta que mudou meu workflow"
  ],
  brand: [
    "Gatos + Tecnologia + IA = CatBytes",
    "MeowFlix: Interface que criei",
    "IA Felina em ação",
    "Por trás do CatBytes",
    "Tecnologia com identidade felina",
    "Projeto pessoal que virou produto",
    "Design system do CatBytes",
    "Branding técnico e criativo",
    "Stack do portfólio CatBytes",
    "Evolução do projeto"
  ],
  authority: [
    "Checklist completo de deploy",
    "Framework decision matrix",
    "Quando usar cada arquitetura",
    "Guia de otimização de performance",
    "Segurança em aplicações web",
    "Melhores práticas de API design",
    "Como estruturar monorepo",
    "Git workflow para times",
    "Documentação que realmente funciona",
    "Métricas que importam em tech"
  ]
}

export async function POST(request: NextRequest) {
  console.log('🎨 [TEXT-ONLY] === INICIANDO GERAÇÃO DE TEXTO + PROMPT ===')
  
  try {
    const body = await request.json()
    const { nicho, tema, estilo, palavrasChave, quantidade = 1 } = body

    console.log('🎨 [TEXT-ONLY] Request:', { nicho, tema, estilo, palavrasChave, quantidade })

    if (!nicho || !tema) {
      console.log('🎨 [TEXT-ONLY] ❌ Campos obrigatórios faltando')
      return NextResponse.json(
        { error: 'Nicho e tema são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('🎨 [TEXT-ONLY] ❌ API Key não configurada')
      return NextResponse.json(
        { error: 'OpenAI API key não configurada' },
        { status: 500 }
      )
    }

    console.log('🎨 [TEXT-ONLY] ✓ API Key configurada:', process.env.OPENAI_API_KEY.substring(0, 10) + '...')

    const generatedPosts = []

    for (let i = 0; i < quantidade; i++) {
      console.log(`🎨 [TEXT-ONLY] Gerando post ${i + 1}/${quantidade}...`)

      // Gerar conteúdo com GPT-4
      console.log('🎨 [TEXT-ONLY] Chamando GPT-4 para gerar conteúdo...')
      
      const prompt = `Você é um copywriter especializado em vendas de serviços de automação e desenvolvimento web.

🎯 CONTEXTO IMPORTANTE:
Você está criando conteúdo para a CATBytes - desenvolvedora web fullstack especializada em AUTOMAÇÕES para empresas.

👩‍💻 SOBRE A CATBYTES:
- Desenvolvedora fullstack especializada em automação de processos
- Cria soluções personalizadas para empresas
- Site: catbytes.site
- Foco: Automatizar tarefas repetitivas e economizar tempo das empresas

� PÚBLICO-ALVO (empresas que precisam de automação):
- Escritórios (advocacia, contabilidade, arquitetura)
- Consultórios (médicos, dentistas, psicólogos, estéticos)
- Academias e personal trainers
- Lojas físicas e e-commerces
- Restaurantes e food services
- Salões de beleza e barbearias
- Clínicas veterinárias
- Escolas e cursos
- Imobiliárias
- Oficinas mecânicas
- Agências de marketing
- Qualquer negócio com processos manuais repetitivos

💡 SERVIÇOS/PRODUTOS QUE A CATBYTES OFERECE:
- Sistemas de agendamento online automatizado
- Chatbots para atendimento 24/7
- Automação de email marketing
- Integração entre ferramentas (CRM, WhatsApp, planilhas)
- Dashboards personalizados para gestão
- Landing pages de alta conversão
- E-commerces completos
- Automação de processos internos (RH, financeiro, estoque)
- APIs customizadas
- Websites profissionais com SEO

Tema: ${tema}
Nicho empresarial: ${nicho}
Estilo: ${estilo || 'Comercial, direto e profissional'}
Palavras-chave: ${palavrasChave || 'Automação, Produtividade, Economia de tempo'}

🎯 OBJETIVO: Vender serviços de automação da CATBytes

Gere um post completo para Instagram com:

1. **titulo**: Título impactante focado no PROBLEMA ou BENEFÍCIO (máx 60 caracteres)
   Exemplos: "Pare de perder clientes por falta de tempo" | "Automatize seu agendamento agora"

2. **imagePrompt**: Prompt DETALHADO EM PORTUGUÊS para criar visual CORPORATIVO e PROFISSIONAL.
   
   🏢 DIRETRIZES OBRIGATÓRIAS PARA IMAGENS CORPORATIVAS:
   
   VISUAL PRINCIPAL (escolha 1):
   - Executiva/secretária ocupada em escritório moderno, múltiplas telas, pilhas de documentos organizadas
   - Advogado sério com processo jurídicos empilhados na mesa, computador aberto, ambiente profissional
   - Médico/dentista verificando agenda lotada no tablet, pacientes aguardando ao fundo
   - Empresário estressado olhando planilhas complexas, calculadora, gráficos impressos
   - Gerente de loja conferindo estoque manualmente, prancheta, produtos organizados
   - Contador cercado de documentos fiscais, múltiplas planilhas abertas, ambiente corporativo
   
   ELEMENTOS OBRIGATÓRIOS:
   ✅ Ambiente corporativo limpo e profissional
   ✅ Pessoa usando roupa social (blazer, camisa social, etc.)
   ✅ Múltiplas telas/documentos/planilhas visíveis (demonstrando complexidade)
   ✅ Iluminação profissional (não casa/ambiente casual)
   ✅ Cores sérias: azul corporativo, cinza, branco, toques de roxo/verde tech
   ✅ Tecnologia presente mas não dominante (laptop, tablet, smartphone)
   
   TEXTO NA IMAGEM:
   ✅ Frase curta e impactante (máx 20 caracteres)
   ✅ Exemplos: "Automação em 48h" | "Sem mais planilhas" | "+40h/mês economizadas"
   ✅ Tipografia moderna, bold, legível
   ✅ Posicionamento destacado (canto superior ou centro)
   
   ESTILO VISUAL:
   ✅ Fotografia profissional, não ilustração cartoon
   ✅ Qualidade de stock photo empresarial
   ✅ Sem excessos: clean, organizado, confiável
   ✅ Perspectiva ligeiramente de cima (transmite controle)
   
   EXEMPLO DE PROMPT IDEAL:
   "Foto profissional de executiva concentrada em escritório corporativo moderno, vestindo blazer azul marinho, trabalhando com múltiplas planilhas abertas no laptop e documentos organizados na mesa, ambiente iluminação natural, cores azul corporativo e branco, texto em destaque 'Automação em 48h' em tipografia modern bold no canto superior direito, qualidade stock photo empresarial, composição clean e profissional, formato quadrado 1:1"

3. **caption**: Legenda VENDEDORA com estrutura persuasiva:
   
   📌 ESTRUTURA OBRIGATÓRIA:
   
   [HOOK - 1º parágrafo]
   - Pergunta sobre DOR do negócio OU dado impactante
   - Exemplos: "Quantas horas você perde por semana com agendamentos manuais?" | "Seu consultório está perdendo 30% dos clientes por demora no atendimento?"
   
   [DOR/PROBLEMA - 2º parágrafo]
   - Agitar a dor específica do tipo de negócio
   - Focar em: perda de tempo, perda de dinheiro, clientes insatisfeitos, trabalho manual repetitivo
   
   [SOLUÇÃO - 3º parágrafo]
   - Apresentar a AUTOMAÇÃO como solução
   - Mencionar benefícios tangíveis: economia de X horas, aumento de Y% em conversões, atendimento 24/7
   
   [SERVIÇO CATBYTES - 4º parágrafo]
   - Apresentar a CATBytes como especialista em automação
   - Mencionar um ou dois serviços específicos relevantes para o nicho
   - Exemplos: "chatbot inteligente", "sistema de agendamento", "dashboard personalizado"
   - Enfatizar: solução sob medida, rápida implementação
   
   [CALL-TO-ACTION - 5º parágrafo]
   - SEMPRE incluir: "Acesse catbytes.site" ou "Link na bio: catbytes.site"
   - Adicionar urgência quando cabível
   - Pedir ação: "Chama no direct", "Comenta seu tipo de negócio"
   
   [HASHTAGS - final]
   - 10-15 hashtags estratégicas
   - Focar em: automação, tecnologia, produtividade, negócios, o nicho específico
   - Exemplos: #automacao #desenvolvimentoweb #producao #tecnologia #empreendedorismo #negociosdigitais
   
   Máx 2200 caracteres | Tom: profissional mas acessível, focado em resultados

REGRAS CRÍTICAS:
✅ SEMPRE mencionar que é a CATBytes oferecendo o serviço
✅ SEMPRE incluir "catbytes.site" no CTA
✅ Focar em AUTOMAÇÃO e DESENVOLVIMENTO WEB
✅ Usar casos de uso REAIS para empresas (não inventar nichos irrelevantes)
✅ Ser específico sobre o problema que a automação resolve
✅ Tudo em português brasileiro
✅ Tom profissional e confiável
❌ NÃO inventar serviços que a CATBytes não oferece
❌ NÃO focar em infoprodutos genéricos
❌ NÃO usar promessas exageradas ou irreais
❌ NÃO esquecer de mencionar catbytes.site

Retorne APENAS um objeto JSON válido:
{
  "titulo": "...",
  "imagePrompt": "...",
  "caption": "..."
}`

      const completion = await client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em marketing digital e geração de conteúdo para Instagram. Sempre retorna JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })

      const responseText = completion.choices[0].message.content
      console.log('🎨 [TEXT-ONLY] ✓ GPT-4 response recebido:', responseText?.substring(0, 200) + '...')

      let content
      try {
        content = JSON.parse(responseText || '{}')
      } catch (e) {
        console.error('🎨 [TEXT-ONLY] ❌ Erro ao parsear JSON:', e)
        throw new Error('Resposta do GPT-4 não é um JSON válido')
      }

      const { titulo, imagePrompt, caption } = content

      if (!titulo || !imagePrompt || !caption) {
        console.error('🎨 [TEXT-ONLY] ❌ Conteúdo incompleto:', { titulo, imagePrompt: !!imagePrompt, caption: !!caption })
        throw new Error('GPT-4 não gerou todo o conteúdo necessário')
      }

      console.log('🎨 [TEXT-ONLY] ✓ Conteúdo gerado:')
      console.log('  - Título:', titulo)
      console.log('  - Image Prompt (primeiros 100 chars):', imagePrompt.substring(0, 100) + '...')
      console.log('  - Caption (primeiros 100 chars):', caption.substring(0, 100) + '...')

      generatedPosts.push({
        titulo,
        imagePrompt,
        caption,
        nicho,
        tema,
        estilo: estilo || 'Profissional e envolvente',
        palavrasChave: palavrasChave || 'Tecnologia, IA, Automação'
      })

      console.log(`🎨 [TEXT-ONLY] ✅ Post ${i + 1} gerado com sucesso!`)
    }

    console.log('🎨 [TEXT-ONLY] ✅ GERAÇÃO COMPLETA! Total:', generatedPosts.length)

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      message: `${generatedPosts.length} post(s) gerado(s) com sucesso!`
    })

  } catch (error: any) {
    console.error('🎨 [TEXT-ONLY] ❌ ERRO CRÍTICO:', error)
    console.error('Stack trace:', error.stack)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao gerar conteúdo',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
