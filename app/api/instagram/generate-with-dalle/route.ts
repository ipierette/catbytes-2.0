/**
 * API para gerar posts do Instagram usando DALL-E 3
 * Gera imagens completas com texto integrado
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateInstagramPostWithDALLE, downloadAndSaveDALLEImage, NICHE_TEMPLATES } from '@/lib/dalle-post-generator'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '@/lib/api-security'

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
    await verifyAdmin(request)

    const { nicho, tema, palavrasChave, estilo, quantidade = 1 } = await request.json()

    console.log('[DALL-E API] Gerando posts:', { nicho, tema, quantidade })

    if (!nicho || !tema) {
      return NextResponse.json({
        success: false,
        error: 'Nicho e tema são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se a OpenAI API Key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY não configurada. Configure no .env.local'
      }, { status: 500 })
    }

    // Usar template do nicho se disponível
    const nicheTemplate = NICHE_TEMPLATES[nicho as keyof typeof NICHE_TEMPLATES]

    const generatedPosts = []
    const errors = []

    for (let i = 0; i < quantidade; i++) {
      try {
        console.log(`[DALL-E API] Tentando gerar post ${i + 1}/${quantidade}...`)
        
        // 1. Gerar com DALL-E 3
        const post = await generateInstagramPostWithDALLE({
          nicho,
          tema: quantidade > 1 ? `${tema} - Variação ${i + 1}` : tema,
          palavrasChave: palavrasChave || nicheTemplate?.palavrasChave || [],
          estilo: estilo || nicheTemplate?.estilo || 'moderno',
          coresPrincipais: nicheTemplate?.coresPrincipais,
          incluirLogo: true
        })

        // 2. Criar registro temporário no banco para obter ID
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
          console.error('[DALL-E API] Erro ao criar post:', insertError)
          errors.push(`Post ${i + 1}: Erro ao salvar no banco`)
          continue
        }

        // 3. Baixar e salvar imagem permanentemente
        const permanentUrl = await downloadAndSaveDALLEImage(
          post.imageUrl,
          tempPost.id
        )

        // 4. Atualizar post com URL permanente
        const { error: updateError } = await supabase
          .from('instagram_posts')
          .update({
            image_url: permanentUrl,
            dalle_prompt: post.prompt,
            dalle_revised_prompt: post.revisedPrompt
          })
          .eq('id', tempPost.id)

        if (updateError) {
          console.error('[DALL-E API] Erro ao atualizar post:', updateError)
        }

        generatedPosts.push({
          id: tempPost.id,
          ...post,
          permanentUrl
        })

        console.log(`[DALL-E API] Post ${i + 1}/${quantidade} gerado com sucesso!`)

        // Aguardar 3 segundos entre gerações para evitar rate limit
        if (i < quantidade - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
        console.error(`[DALL-E API] Erro ao gerar post ${i + 1}:`, errorMsg)
        errors.push(`Post ${i + 1}: ${errorMsg}`)
        // Continuar com os próximos
      }
    }

    if (generatedPosts.length === 0) {
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
    console.error('[DALL-E API] Erro geral:', errorMsg)
    
    // Mensagem de erro mais detalhada
    let userMessage = errorMsg
    if (errorMsg.includes('api_key')) {
      userMessage = 'API Key da OpenAI inválida ou não configurada'
    } else if (errorMsg.includes('insufficient_quota')) {
      userMessage = 'Créditos OpenAI insuficientes. Adicione créditos na sua conta OpenAI.'
    } else if (errorMsg.includes('model_not_found')) {
      userMessage = 'DALL-E 3 não está disponível na sua conta OpenAI. Use a geração tradicional.'
    }
    
    return NextResponse.json({
      success: false,
      error: userMessage,
      errorTecnico: errorMsg
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
      templates: NICHE_TEMPLATES,
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
