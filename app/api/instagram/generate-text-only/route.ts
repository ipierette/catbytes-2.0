import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api-security'

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
    // Verificar autenticação admin
    const adminCheck = await verifyAdmin(request)
    if (!adminCheck.valid) {
      console.log('🎨 [TEXT-ONLY] ❌ Não autorizado')
      return adminCheck.error || NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

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
      
      const prompt = `Você é um especialista em marketing digital e geração de conteúdo para Instagram.

Tema: ${tema}
Nicho: ${nicho}
Estilo: ${estilo || 'Profissional e envolvente'}
Palavras-chave: ${palavrasChave || 'Tecnologia, IA, Automação'}

Gere um post completo para Instagram com:

1. **titulo**: Um título chamativo e direto (máx 60 caracteres)
2. **imagePrompt**: Um prompt DETALHADO para geração de imagem (DALL-E, Midjourney, Stable Diffusion, etc). O prompt deve ser em inglês, descritivo, com estilo visual específico, cores, composição, iluminação. Exemplo: "Professional minimalist infographic showing before/after automation workflow, split screen design, blue and purple gradient background, clean modern UI elements, 3D floating icons, soft shadows, bright lighting, 1:1 aspect ratio"
3. **caption**: Legenda completa com:
   - Hook inicial envolvente
   - Desenvolvimento do conteúdo (3-5 parágrafos curtos)
   - Call-to-action
   - 10-15 hashtags estratégicas relevantes
   - Máx 2000 caracteres

REGRAS IMPORTANTES:
- O imagePrompt DEVE ser detalhado e em inglês
- Incluir estilo visual, cores, composição, iluminação
- A legenda deve ser conversacional e engajante
- Hashtags devem misturar: nicho específico + alcance médio + viral
- Foco em ${nicho}

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
