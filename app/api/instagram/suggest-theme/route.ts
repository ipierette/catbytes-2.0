import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Temas estratégicos categorizados
const TEMAS_ESTRATEGICOS = `
# CATEGORIAS DE CONTEÚDO CATBYTES

## 1. ATRAIR CLIENTES (pequenos negócios, clínicas, advogados, lojas)

### Automação que gera lucro real
- "Como automatizei X horas por semana de um negócio"
- "Antes vs Depois de um fluxo automatizado"
- "3 tarefas que todo negócio local deveria automatizar"
- "Como um chatbot inteligente reduz o tempo de atendimento em 70%"

### Sites inteligentes que convertem
- "Por que seu site atual não vende"
- "Elementos que transformam um site comum em uma máquina de vendas"
- "Dashboard + IA: como visualizar seus resultados em tempo real"

### Demonstrações reais de projetos
- Vídeos curtos mostrando CatBytes, CatButler, CatFetch, LoveCats API
- "Como criei uma automação completa em 2 minutos usando n8n"
- "Mostrando meu fluxo de IA que cria post para clientes"
- Deploys rápidos, UI funcionando, telas bonitinhas

### Conteúdo educacional simples
- "O que é automação de WhatsApp?"
- "O que é um agente de IA e por que ele pode aumentar suas vendas?"
- "Diferença entre chatbot e agente"

## 2. ATRAIR RECRUTADORES e empresas de tecnologia

### Mostrando raciocínio como dev
- Code reviews rápidos
- Refatoração de trechos comuns
- "Corrigindo um bug em 30 segundos"
- "Como organizo meu projeto React passo a passo"

### Arquitetura e boas práticas
- "Por que uso Supabase + RLS"
- "Como estruturo pastas em projetos profissionais"
- "Como otimizo o bundle no Vite/React"

### Mostrando maturidade técnica
- Comparações explicadas: REST vs GraphQL
- SSR vs SSG vs SPA
- Quando usar automações e quando NÃO usar

### Estudos e roadmaps
- Avanços semanais
- "Como estudo ADS + projetos + comunidade"
- "Minhas especialidades e o que estou aprendendo agora"

## 3. CONTEÚDOS VIRALIZÁVEIS (grandes públicos, curiosidade)

### Vida de dev (humor e realidade)
- "Expectativa vs Realidade ao usar IA"
- "Coisas que só acontecem com quem programa à noite"
- "A IA não vai roubar seu emprego — mas alguém que usa IA sim"

### Bastidores de automações absurdas
- "Automação mais louca que já fiz"
- "Transformei o WhatsApp de um cliente em um funcionário 24/7"
- "Criei um agente que responde como um gato e ele já ganhou fãs"

### Desmistificando TI
- "Ninguém te conta isso sobre programação…"
- "O erro que destrói 99% dos sites"
- "3 coisas que aprendi como advogada que mudaram minha carreira na TI"

### Processos visuais (causa efeito)
- Fluxos animados
- Antes e depois
- Timelapse de criação

## 4. MARCA CATBYTES (gatos + tecnologia + IA)

- "Como gatos inspiram boas práticas de UX"
- "CatBytes: IA + Gatos + Automação = por que isso funciona tão bem?"
- "Meu agente IA Axel está cada vez mais inteligente"
- "Dashboard estilo MeowFlix: como fiz"

## 5. AUTORIDADE (posicionamento como especialista)

- "Checklist: o que seu site precisa ter em 2025"
- "Por que automações estão substituindo equipes inteiras"
- "O painel administrativo que entrego para meus clientes"
- "Como construo sites que já vêm com IA integrada"
`

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 [SUGGEST-THEME] Iniciando geração de sugestão...')
    
    const body = await request.json()
    const { currentNicho } = body

    console.log('📋 [SUGGEST-THEME] Nicho atual:', currentNicho || 'Nenhum')

    // Prompt para o GPT-4 gerar sugestão baseada nos temas estratégicos
    const prompt = `Você é um assistente especializado em marketing digital para a CatBytes.

Baseado nos temas estratégicos abaixo, sugira UM tema específico para um post do Instagram.
${currentNicho ? `Prefira temas relacionados ao nicho: ${currentNicho}` : 'Escolha qualquer tema interessante'}

TEMAS DISPONÍVEIS:
${TEMAS_ESTRATEGICOS}

RESPONDA APENAS NO FORMATO JSON (sem markdown):
{
  "nicho": "tech|business|lifestyle|education|fitness",
  "tema": "Título específico e chamativo do post",
  "estilo": "moderno|minimalista|vibrante|elegante|corporativo",
  "palavrasChave": "palavra1, palavra2, palavra3",
  "categoria": "Nome da categoria escolhida (ex: Automação que gera lucro real)"
}

REGRAS:
- O tema deve ser específico e chamativo
- Use os exemplos dos temas estratégicos como inspiração
- Palavras-chave devem ser relevantes e em português
- O estilo deve combinar com o tema escolhido`

    console.log('🤖 [SUGGEST-THEME] Chamando GPT-4 para sugestão...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de marketing digital especializado em criar conteúdo estratégico para Instagram.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9, // Mais criativo
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    const suggestion = completion.choices[0].message.content
    console.log('✅ [SUGGEST-THEME] Sugestão gerada:', suggestion)

    if (!suggestion) {
      throw new Error('GPT-4 não retornou sugestão')
    }

    const parsed = JSON.parse(suggestion)
    
    console.log('📊 [SUGGEST-THEME] Sugestão parseada:', {
      nicho: parsed.nicho,
      tema: parsed.tema,
      categoria: parsed.categoria
    })

    return NextResponse.json({
      success: true,
      ...parsed,
      debug: {
        model: 'gpt-4-turbo-preview',
        tokens: completion.usage?.total_tokens,
        categoria: parsed.categoria
      }
    })

  } catch (error: any) {
    console.error('❌ [SUGGEST-THEME] Erro ao gerar sugestão:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        debug: {
          errorType: error.constructor.name,
          errorMessage: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
}
