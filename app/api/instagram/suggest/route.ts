import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação via JWT cookie
    const adminToken = request.cookies.get('admin_token')?.value
    
    if (!adminToken) {
      console.warn('⚠️ [API SUGGEST] Cookie ausente, usando sugestão padrão')
      return NextResponse.json({
        nicho: 'Tecnologia e IA',
        tema: 'Claude 3.5 Sonnet - Análise de código em tempo real',
        estilo: 'Moderno',
        coresPrincipais: ['roxo profundo', 'azul elétrico', 'branco'],
        palavrasChave: ['IA', 'Claude', 'Anthropic', 'código', 'automação'],
        pontosVisuais: ['logo da Anthropic estilizado', 'código em destaque', 'interface moderna']
      })
    }

    // Verificar JWT
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this')
      await jwtVerify(adminToken, JWT_SECRET)
      console.log('✅ [API SUGGEST] Admin autenticado via JWT')
    } catch (jwtError) {
      console.warn('⚠️ [API SUGGEST] JWT inválido, usando sugestão padrão')
      return NextResponse.json({
        nicho: 'Tecnologia e IA',
        tema: 'Gemini 2.0 Pro - Multimodalidade nativa do Google',
        estilo: 'Moderno',
        coresPrincipais: ['azul Google', 'verde vibrante', 'branco'],
        palavrasChave: ['Gemini', 'Google', 'multimodal', 'IA', 'produtividade'],
        pontosVisuais: ['logo Gemini', 'múltiplas mídias integradas', 'interface futurista']
      })
    }

    console.log('🎯 [API SUGGEST] Gerando sugestões inteligentes...')

    // Gera sugestões usando GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Modelo mais recente com conhecimento atualizado
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em marketing digital e Instagram BRASILEIRO, especializado em tecnologia e IA.
Sua tarefa é sugerir ideias criativas e ATUAIS para posts do Instagram.

IMPORTANTE: 
- Você é o GPT-4o com conhecimento atualizado
- Sugira APENAS tecnologias/produtos/ferramentas que você CONHECE e que são RECENTES
- SEJA ESPECÍFICO com nomes, versões e aplicações práticas
- NÃO invente tecnologias genéricas
- NÃO use datas antigas ou eventos antigos
- Foque em novidades RECENTES que você conhece (últimos 12 meses)

Retorne APENAS um JSON válido, sem markdown ou explicações.`
          },
          {
            role: 'user',
            content: `Sugira UMA ideia ESPECÍFICA e ATUAL para um post de Instagram profissional sobre tecnologia.

CRITÉRIOS OBRIGATÓRIOS:
✅ Nome EXATO e ESPECÍFICO da tecnologia (ex: "Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Flash")
✅ Versão específica quando relevante (ex: "Next.js 15", "Python 3.13", "React 19")
✅ Aplicação prática clara (ex: "para análise de código", "para automação de processos")
✅ Tecnologia que você CONHECE (dentro do seu conhecimento atualizado)
✅ Relevante para público brasileiro de tecnologia
✅ Útil e educativo

EXEMPLOS DE TEMAS ESPECÍFICOS E BONS (use estes como referência):
✅ "Claude 3.5 Sonnet - IA que escreve código melhor que humanos"
✅ "GPT-4o - Modelo multimodal mais rápido da OpenAI"
✅ "Gemini 2.0 Flash - IA do Google com raciocínio avançado"
✅ "Sora OpenAI - Gerador de vídeos realistas com IA"
✅ "GitHub Copilot Workspace - IA que desenvolve projetos completos"
✅ "Cursor IDE - Editor com IA integrada para programação"
✅ "Midjourney v6.1 - Realismo fotográfico em imagens IA"
✅ "Next.js 15 - React Compiler e turbopack"
✅ "Bun 1.1 - Runtime JavaScript ultrarrápido"
✅ "Llama 3.3 da Meta - IA open source de 70B parâmetros"
✅ "Devin AI - Engenheiro de software IA autônomo"
✅ "v0.dev da Vercel - IA que gera componentes React"
✅ "NotebookLM do Google - IA que analisa documentos"
✅ "Anthropic Claude - IA com janela de contexto de 200k tokens"

EXEMPLOS RUINS (NÃO FAZER):
❌ "IA em 2024" (genérico demais)
❌ "Novo modelo de smartphone" (não especifica qual)
❌ "Lançamento recente" (vago)
❌ "Inteligência artificial avançada" (sem especificação)
❌ "IA em 2002" (data antiga e errada)

Retorne no formato JSON:
{
  "nicho": "Tecnologia e IA",
  "tema": "NOME EXATO DA TECNOLOGIA + aplicação prática específica",
  "estilo": "Moderno e Profissional",
  "coresPrincipais": ["cor1", "cor2", "cor3"],
  "palavrasChave": ["tecnologia-específica", "aplicação", "benefício", "contexto"],
  "pontosVisuais": ["elemento visual 1", "elemento visual 2", "elemento visual 3"]
}

Pense em uma tecnologia/ferramenta ESPECÍFICA que você conhece e que foi lançada ou atualizada recentemente (últimos 6-12 meses).
Seja preciso e específico!`
          }
        ],
        temperature: 0.8, // Aumentado para mais variedade
        max_tokens: 600
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [API SUGGEST] OpenAI error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ [API SUGGEST] Resposta inválida:', data)
      throw new Error('Resposta inválida da OpenAI')
    }

    const content = data.choices[0].message.content.trim()
    console.log('🎯 [API SUGGEST] Conteúdo recebido:', content.substring(0, 100))

    // Remove markdown se presente (```json ... ```)
    const cleanContent = content.replaceAll(/```json\s*|\s*```/g, '').trim()

    // Parse do JSON
    let suggestion
    try {
      suggestion = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('❌ [API SUGGEST] Erro ao parsear JSON:', parseError)
      console.error('❌ [API SUGGEST] Conteúdo:', cleanContent)
      throw new Error('Erro ao processar resposta da IA')
    }

    console.log('✅ [API SUGGEST] Sugestões geradas com sucesso')

    return NextResponse.json(suggestion)
    
  } catch (error: any) {
    console.error('❌ [API SUGGEST] Erro geral:', error)
    
    // Retorna sugestão padrão em caso de erro
    return NextResponse.json({
      nicho: 'Tecnologia',
      tema: 'Inovação e Produtividade',
      estilo: 'Moderno',
      coresPrincipais: ['azul profundo', 'laranja vibrante', 'branco'],
      palavrasChave: ['tecnologia', 'inovação', 'produtividade', 'digital'],
      pontosVisuais: ['ícones modernos', 'gradientes suaves', 'tipografia bold']
    })
  }
}
