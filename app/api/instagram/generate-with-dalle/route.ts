/**
 * API para gerar posts do Instagram usando DALL-E 3
 * Gera imagens completas com texto integrado
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePostWithLeonardo } from '@/lib/dalle-canvas-post-generator'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminCookie } from '@/lib/api-security'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/instagram/generate-with-dalle
 * Gera um post completo usando DALL-E 3
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🟣 [DEBUG DALL-E] === INICIANDO GERAÇÃO ===')
    
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }
    console.log('🟣 [DEBUG DALL-E] ✓ Admin verificado via cookie')

    const { nicho, tema, palavrasChave, estilo, quantidade = 1 } = await request.json()

    console.log('🟣 [DEBUG DALL-E] Parâmetros recebidos:', { nicho, tema, quantidade, estilo })

    if (!nicho || !tema) {
      console.error('🟣 [DEBUG DALL-E] ❌ Nicho ou tema faltando')
      return NextResponse.json({
        success: false,
        error: 'Nicho e tema são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se a OpenAI API Key está configurada
    const apiKey = process.env.OPENAI_API_KEY
    console.log('🟣 [DEBUG DALL-E] OpenAI API Key:', apiKey ? `Configurada (${apiKey.substring(0, 10)}...)` : '❌ NÃO CONFIGURADA')
    
    if (!apiKey) {
      console.error('🟣 [DEBUG DALL-E] ❌ OPENAI_API_KEY não encontrada no .env')
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY não configurada. Configure no .env.local',
        errorTecnico: 'Variável de ambiente OPENAI_API_KEY não encontrada',
        sugestao: 'Adicione OPENAI_API_KEY=sk-... no arquivo .env.local'
      }, { status: 500 })
    }

    const generatedPosts = []
    const errors = []

    for (let i = 0; i < quantidade; i++) {
      try {
        console.log(`🟣 [DEBUG DALL-E] === POST ${i + 1}/${quantidade} ===`)
        
        // 1. Gerar com DALL-E 3
        console.log('🟣 [DEBUG DALL-E] Chamando generatePostWithLeonardo...')
        const post = await generatePostWithLeonardo({
          nicho,
          tema: quantidade > 1 ? `${tema} - Variação ${i + 1}` : tema,
          palavrasChave: palavrasChave || [],
          estilo: estilo || 'moderno'
        })
        
        console.log('🟣 [DEBUG DALL-E] ✓ Post gerado:', {
          titulo: post.titulo,
          imageUrl: post.imageUrl ? 'OK' : 'FALHOU',
          promptLength: post.prompt?.length || 0
        })

        // 2. Criar registro temporário no banco para obter ID
        console.log('🟣 [DEBUG DALL-E] Salvando no banco de dados...')
        const { data: tempPost, error: insertError } = await supabase
          .from('instagram_posts')
          .insert({
            nicho,
            titulo: post.titulo,
            texto_imagem: post.textoImagem,
            caption: post.caption,
            image_url: 'pending',
            status: 'pending',
            generation_method: 'dalle-3'
          })
          .select()
          .single()

        if (insertError || !tempPost) {
          console.error('🟣 [DEBUG DALL-E] ❌ Erro ao criar post no DB:', insertError)
          errors.push(`Post ${i + 1}: Erro ao salvar no banco - ${insertError?.message || 'Desconhecido'}`)
          continue
        }
        
        console.log('🟣 [DEBUG DALL-E] ✓ Post criado no DB com ID:', tempPost.id)

        // 3. Usar a URL da imagem diretamente (já vem permanente do DALL-E)
        const permanentUrl = post.imageUrl
        
        console.log('🟣 [DEBUG DALL-E] ✓ Usando URL da imagem:', permanentUrl)

        // 4. Atualizar post com URL permanente
        console.log('🟣 [DEBUG DALL-E] Atualizando post com URL permanente...')
        const { error: updateError } = await supabase
          .from('instagram_posts')
          .update({
            image_url: permanentUrl
          })
          .eq('id', tempPost.id)

        if (updateError) {
          console.error('🟣 [DEBUG DALL-E] ⚠️ Erro ao atualizar post:', updateError)
        } else {
          console.log('🟣 [DEBUG DALL-E] ✓ Post atualizado com sucesso')
        }

        generatedPosts.push({
          id: tempPost.id,
          ...post,
          permanentUrl
        })

        console.log(`🟣 [DEBUG DALL-E] ✅ Post ${i + 1}/${quantidade} CONCLUÍDO!`)

        // Aguardar 3 segundos entre gerações para evitar rate limit
        if (i < quantidade - 1) {
          console.log('🟣 [DEBUG DALL-E] Aguardando 3s antes do próximo...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
        const errorStack = error instanceof Error ? error.stack : undefined
        console.error(`🟣 [DEBUG DALL-E] ❌ ERRO no post ${i + 1}:`, errorMsg)
        console.error(`🟣 [DEBUG DALL-E] Stack:`, errorStack)
        errors.push(`Post ${i + 1}: ${errorMsg}`)
        // Continuar com os próximos
      }
    }
    
    console.log('🟣 [DEBUG DALL-E] === FIM DA GERAÇÃO ===')
    console.log('🟣 [DEBUG DALL-E] Posts gerados:', generatedPosts.length)
    console.log('🟣 [DEBUG DALL-E] Erros:', errors.length)

    if (generatedPosts.length === 0) {
      console.error('🟣 [DEBUG DALL-E] ❌ NENHUM POST GERADO!')
      return NextResponse.json({
        success: false,
        error: 'Nenhum post foi gerado com sucesso',
        detalhes: errors,
        sugestao: 'Verifique se sua conta OpenAI tem acesso ao DALL-E 3 e créditos disponíveis. Alternativamente, use a geração tradicional com IA.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      generated: generatedPosts.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${generatedPosts.length} post(s) gerado(s) com sucesso usando DALL-E 3!`
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('🟣 [DEBUG DALL-E] ❌ ERRO GERAL:', errorMsg)
    console.error('🟣 [DEBUG DALL-E] Stack:', errorStack)
    
    // Mensagem de erro mais detalhada
    let userMessage = errorMsg
    let sugestao = 'Verifique os logs do console para mais detalhes'
    
    if (errorMsg.includes('api_key') || errorMsg.includes('API key')) {
      userMessage = 'API Key da OpenAI inválida ou não configurada'
      sugestao = 'Verifique se OPENAI_API_KEY no .env.local está correta e começa com sk-'
    } else if (errorMsg.includes('insufficient_quota') || errorMsg.includes('quota')) {
      userMessage = 'Créditos OpenAI insuficientes'
      sugestao = 'Adicione créditos na sua conta OpenAI em https://platform.openai.com/settings/organization/billing'
    } else if (errorMsg.includes('model_not_found') || errorMsg.includes('dall-e-3')) {
      userMessage = 'DALL-E 3 não está disponível na sua conta OpenAI'
      sugestao = 'Use o botão "⚡ Stability AI" que é mais barato e funciona imediatamente'
    } else if (errorMsg.includes('rate_limit') || errorMsg.includes('Too Many Requests')) {
      userMessage = 'Limite de requisições atingido'
      sugestao = 'Aguarde alguns minutos antes de tentar novamente'
    }
    
    console.error('🟣 [DEBUG DALL-E] Mensagem para usuário:', userMessage)
    console.error('🟣 [DEBUG DALL-E] Sugestão:', sugestao)
    
    return NextResponse.json({
      success: false,
      error: userMessage,
      errorTecnico: errorMsg,
      sugestao,
      debugInfo: {
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 })
  }
}

/**
 * GET /api/instagram/generate-with-dalle?preview=true
 * Retorna exemplos de prompts e estilos disponíveis
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const preview = url.searchParams.get('preview') === 'true'

    if (!preview) {
      return NextResponse.json({
        success: false,
        error: 'Use POST para gerar posts'
      }, { status: 405 })
    }

    return NextResponse.json({
      success: true,
      estilos: [
        'moderno',
        'minimalista',
        'vibrante',
        'elegante',
        'corporativo'
      ],
      exemplo: {
        nicho: 'tech',
        tema: 'Inteligência Artificial no Marketing',
        palavrasChave: ['IA', 'marketing', 'automação', 'inovação'],
        estilo: 'moderno',
        quantidade: 1
      },
      custos: {
        dalleHD: '$0.080 por imagem (1024x1024 HD)',
        estimativa: 'Gerar 10 posts = ~$0.80'
      }
    })

  } catch (error) {
    console.error('[DALL-E API Preview] Erro:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar informações'
    }, { status: 500 })
  }
}
