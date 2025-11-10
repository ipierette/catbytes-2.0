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
      
      const prompt = `Você é um especialista em copywriting persuasivo e vendas de produtos digitais no Instagram.

Tema: ${tema}
Nicho: ${nicho}
Estilo: ${estilo || 'Comercial e persuasivo'}
Palavras-chave: ${palavrasChave || 'Produtos digitais, Infoprodutos, Transformação'}

🎯 OBJETIVO PRINCIPAL: VENDER PRODUTOS DIGITAIS

PRIORIDADE DE TEMAS (90% do conteúdo):
1. Venda direta de produtos digitais (e-books, cursos, templates, planilhas, etc)
2. Transformação e resultados que o produto oferece
3. Problema → Solução → Produto
4. Prova social, depoimentos, cases de sucesso
5. Urgência e escassez (promoções, bônus limitados)
6. Autoridade no nicho (expertise que valida o produto)

NICHOS DE PRODUTOS DIGITAIS (variar):
- Marketing digital e vendas online
- Finanças pessoais e investimentos
- Emagrecimento e saúde
- Desenvolvimento pessoal e mindset
- Relacionamentos e autoestima
- Produtividade e organização
- Beleza e autocuidado
- Maternidade e criação de filhos
- Culinária saudável
- Idiomas e educação
- Design e criatividade
- Empreendedorismo digital
- **Tecnologia e automação (10% - apenas ocasionalmente)**

Gere um post completo para Instagram com:

1. **titulo**: Título hipnotizante focado em BENEFÍCIO ou DOR (máx 60 caracteres)
   Exemplos: "R$ 10K/mês com apenas 1 produto" | "Pare de perder dinheiro online"

2. **imagePrompt**: Prompt DETALHADO EM PORTUGUÊS para criar design vendedor.
   - Visual profissional e impactante que VENDE
   - Cores que convertem (vermelho, laranja, dourado, preto)
   - TEXTO na imagem: curto, direto, provocativo (máx 30 chars)
   - Incluir elementos de prova social se relevante (números, % crescimento)
   - Estilo: clean, moderno, com sensação de valor alto
   - Exemplo: "Design profissional para post comercial, fundo gradiente preto e dourado premium, elementos de luxo discretos, texto em destaque 'Fature 5x Mais' em tipografia bold impactante, ícones minimalistas de crescimento, composição equilibrada, qualidade publicitária, formato quadrado 1:1"

3. **caption**: Legenda de VENDA com estrutura persuasiva:
   
   📌 ESTRUTURA OBRIGATÓRIA:
   
   [HOOK - 1º parágrafo]
   - Pergunta provocativa OU dado impactante OU história curta
   - Objetivo: parar o scroll
   
   [DOR/PROBLEMA - 2º parágrafo]
   - Agitar a dor do público-alvo
   - "Você está cansado de..."
   
   [SOLUÇÃO - 3º parágrafo]
   - Apresentar a transformação possível
   - "Imagine se você pudesse..."
   
   [PRODUTO/OFERTA - 4º parágrafo]
   - Mencionar o produto digital de forma natural
   - Benefícios claros e objetivos
   
   [CALL-TO-ACTION - 5º parágrafo]
   - Ação clara: "Link na bio" | "Comente QUERO" | "Chama no direct"
   - Senso de urgência se aplicável
   
   [HASHTAGS - final]
   - 12-15 hashtags estratégicas
   - Mix: nicho + comercial + viral
   - Exemplos: #produtosdigitais #infoprodutos #rendaextra #marketingdigital
   
   Máx 2000 caracteres | Tom conversacional mas comercial

REGRAS DE OURO:
✅ FOCO TOTAL EM VENDER produtos digitais
✅ Usar gatilhos mentais (escassez, urgência, prova social, autoridade)
✅ Linguagem direta e persuasiva
✅ TUDO em português brasileiro
✅ Promessa clara de transformação
❌ Evitar conteúdo puramente técnico (a menos que venda algo técnico)
❌ Evitar teoria sem aplicação comercial

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
