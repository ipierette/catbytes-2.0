/**
 * API para gerar posts do Instagram usando Stability AI
 * 10x mais barato que DALL-E 3 ($0.007 vs $0.080 por imagem)
 * Melhor qualidade para texto em português
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePostWithStability } from '@/lib/stability-post-generator'
import { createClient } from '@supabase/supabase-js'
import { verifyAdmin } from '@/lib/api-security'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/instagram/generate-with-stability
 * Gera um post completo usando Stability AI (Stable Diffusion 3.5)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔷 [DEBUG STABILITY] === INICIANDO GERAÇÃO ===')
    
    await verifyAdmin(request)
    console.log('🔷 [DEBUG STABILITY] ✓ Admin verificado')

    const { nicho, tema, palavrasChave, estilo, quantidade = 1 } = await request.json()

    console.log('🔷 [DEBUG STABILITY] Parâmetros recebidos:', { nicho, tema, quantidade, estilo, palavrasChave })

    if (!nicho || !tema) {
      console.error('🔷 [DEBUG STABILITY] ❌ Nicho ou tema faltando')
      return NextResponse.json({
        success: false,
        error: 'Nicho e tema são obrigatórios'
      }, { status: 400 })
    }

    // Verificar se a Stability API Key está configurada
    const apiKey = process.env.STABILITY_API_KEY
    console.log('🔷 [DEBUG STABILITY] Stability API Key:', apiKey ? `Configurada (${apiKey.substring(0, 10)}...)` : '❌ NÃO CONFIGURADA')
    
    if (!apiKey) {
      console.error('🔷 [DEBUG STABILITY] ❌ STABILITY_API_KEY não encontrada no .env')
      return NextResponse.json({
        success: false,
        error: 'STABILITY_API_KEY não configurada',
        errorTecnico: 'Variável de ambiente STABILITY_API_KEY não encontrada',
        sugestao: 'Adicione STABILITY_API_KEY=sk-... no arquivo .env.local. Obtenha em https://platform.stability.ai/account/keys'
      }, { status: 500 })
    }

    // Verificar OpenAI API Key para GPT-4 (geração de conteúdo)
    const openaiKey = process.env.OPENAI_API_KEY
    console.log('🔷 [DEBUG STABILITY] OpenAI API Key (GPT-4):', openaiKey ? 'Configurada' : '❌ NÃO CONFIGURADA')
    
    if (!openaiKey) {
      console.error('🔷 [DEBUG STABILITY] ❌ OPENAI_API_KEY não encontrada (necessária para GPT-4)')
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY não configurada (necessária para gerar textos com GPT-4)',
        errorTecnico: 'Variável de ambiente OPENAI_API_KEY não encontrada',
        sugestao: 'Stability AI usa GPT-4 para textos + Stability para imagens. Configure OPENAI_API_KEY no .env.local'
      }, { status: 500 })
    }

    const generatedPosts = []
    const errors = []
    let totalCost = 0

    for (let i = 0; i < quantidade; i++) {
      try {
        console.log(`🔷 [DEBUG STABILITY] === POST ${i + 1}/${quantidade} ===`)
        
        // 1. Gerar com Stability AI
        console.log('🔷 [DEBUG STABILITY] Chamando generatePostWithStability...')
        const request_config = {
          nicho,
          tema: quantidade > 1 ? `${tema} - Variação ${i + 1}` : tema,
          palavrasChave: palavrasChave || [],
          estilo: estilo || 'moderno',
        }
        console.log('🔷 [DEBUG STABILITY] Request config:', request_config)
        
        const post = await generatePostWithStability(request_config)
        
        console.log('🔷 [DEBUG STABILITY] ✓ Post gerado:', {
          titulo: post.titulo,
          textoImagem: post.textoImagem?.substring(0, 50) + '...',
          imageData: post.imageBase64 ? `Base64 (${post.imageBase64.length} chars)` : 'FALHOU'
        })

        if (!post.imageBase64) {
          console.error('🔷 [DEBUG STABILITY] ❌ Imagem não foi gerada')
          errors.push(`Post ${i + 1}: Imagem não foi gerada`)
          continue
        }

        // 2. Fazer upload da imagem para Supabase Storage
        console.log('🔷 [DEBUG STABILITY] Fazendo upload da imagem...')
        const imageBuffer = Buffer.from(post.imageBase64, 'base64')
        const fileName = `generated/stability-${Date.now()}-${i}.png`
        
        console.log('🔷 [DEBUG STABILITY] Upload config:', {
          bucket: 'instagram-images',
          fileName,
          size: `${(imageBuffer.length / 1024).toFixed(2)} KB`
        })

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('instagram-images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error('🔷 [DEBUG STABILITY] ❌ Erro ao fazer upload:', uploadError)
          errors.push(`Post ${i + 1}: Erro ao fazer upload - ${uploadError.message}`)
          continue
        }

        console.log('🔷 [DEBUG STABILITY] ✓ Upload concluído:', uploadData.path)

        // 3. Obter URL pública
        const { data: urlData } = supabase.storage
          .from('instagram-images')
          .getPublicUrl(fileName)

        const imageUrl = urlData.publicUrl
        console.log('🔷 [DEBUG STABILITY] ✓ URL pública:', imageUrl)

        // 4. Criar registro no banco de dados
        console.log('🔷 [DEBUG STABILITY] Salvando no banco de dados...')
        const { data: dbPost, error: insertError } = await supabase
          .from('instagram_posts')
          .insert({
            nicho,
            titulo: post.titulo,
            texto_imagem: post.textoImagem,
            caption: post.caption,
            image_url: imageUrl,
            status: 'pending',
            generation_method: 'stability-ai'
          })
          .select()
          .single()

        if (insertError || !dbPost) {
          console.error('🔷 [DEBUG STABILITY] ❌ Erro ao salvar no DB:', insertError)
          errors.push(`Post ${i + 1}: Erro ao salvar no banco - ${insertError?.message || 'Desconhecido'}`)
          continue
        }

        console.log('🔷 [DEBUG STABILITY] ✓ Post salvo no DB, ID:', dbPost.id)

        generatedPosts.push({
          id: dbPost.id,
          ...post,
          imageUrl
        })

        // Calcular custo ($0.007 por imagem)
        const postCost = 0.007
        totalCost += postCost

        console.log(`🔷 [DEBUG STABILITY] ✅ Post ${i + 1}/${quantidade} CONCLUÍDO! Custo: $${postCost}`)

        // Aguardar 1 segundo entre gerações (rate limit mais generoso que DALL-E)
        if (i < quantidade - 1) {
          console.log('🔷 [DEBUG STABILITY] Aguardando 1s antes do próximo...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
        const errorStack = error instanceof Error ? error.stack : undefined
        console.error(`🔷 [DEBUG STABILITY] ❌ ERRO no post ${i + 1}:`, errorMsg)
        console.error(`🔷 [DEBUG STABILITY] Stack:`, errorStack)
        errors.push(`Post ${i + 1}: ${errorMsg}`)
        // Continuar com os próximos
      }
    }

    console.log('🔷 [DEBUG STABILITY] === FIM DA GERAÇÃO ===')
    console.log('🔷 [DEBUG STABILITY] Posts gerados:', generatedPosts.length)
    console.log('🔷 [DEBUG STABILITY] Erros:', errors.length)
    console.log('🔷 [DEBUG STABILITY] Custo total: $', totalCost.toFixed(4))

    if (generatedPosts.length === 0) {
      console.error('🔷 [DEBUG STABILITY] ❌ NENHUM POST GERADO!')
      return NextResponse.json({
        success: false,
        error: 'Nenhum post foi gerado com sucesso',
        detalhes: errors,
        sugestao: 'Verifique os logs do console para mais detalhes. Stability AI tem $25 grátis ao criar conta.'
      }, { status: 500 })
    }

    console.log('🔷 [DEBUG STABILITY] ✅ SUCESSO!')
    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      generated: generatedPosts.length,
      totalCost: `$${totalCost.toFixed(4)}`,
      costPerImage: '$0.007',
      errors: errors.length > 0 ? errors : undefined,
      message: `${generatedPosts.length} post(s) gerado(s) com Stability AI! Custo total: ~$${totalCost.toFixed(4)}`
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('🔷 [DEBUG STABILITY] ❌ ERRO GERAL:', errorMsg)
    console.error('🔷 [DEBUG STABILITY] Stack:', errorStack)
    
    // Mensagem de erro mais detalhada
    let userMessage = errorMsg
    let sugestao = 'Verifique os logs do console para mais detalhes'
    
    if (errorMsg.includes('api_key') || errorMsg.includes('API key') || errorMsg.includes('unauthorized')) {
      userMessage = 'API Key da Stability AI inválida ou não configurada'
      sugestao = 'Verifique se STABILITY_API_KEY no .env.local está correta. Obtenha em https://platform.stability.ai/account/keys'
    } else if (errorMsg.includes('insufficient_quota') || errorMsg.includes('quota') || errorMsg.includes('credits')) {
      userMessage = 'Créditos Stability AI insuficientes'
      sugestao = 'Adicione créditos na sua conta Stability AI. Você ganhou $25 grátis ao criar a conta.'
    } else if (errorMsg.includes('rate_limit') || errorMsg.includes('Too Many Requests')) {
      userMessage = 'Limite de requisições atingido'
      sugestao = 'Aguarde alguns segundos antes de tentar novamente'
    } else if (errorMsg.includes('OpenAI') || errorMsg.includes('GPT')) {
      userMessage = 'Erro ao gerar conteúdo com GPT-4'
      sugestao = 'Verifique se OPENAI_API_KEY está configurada corretamente'
    } else if (errorMsg.includes('Supabase') || errorMsg.includes('storage')) {
      userMessage = 'Erro ao salvar imagem no Supabase'
      sugestao = 'Verifique se o bucket instagram-images existe e SUPABASE_SERVICE_ROLE_KEY está correta'
    }
    
    console.error('🔷 [DEBUG STABILITY] Mensagem para usuário:', userMessage)
    console.error('🔷 [DEBUG STABILITY] Sugestão:', sugestao)
    
    return NextResponse.json({
      success: false,
      error: userMessage,
      errorTecnico: errorMsg,
      sugestao,
      debugInfo: {
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        hasStabilityKey: !!process.env.STABILITY_API_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY
      }
    }, { status: 500 })
  }
}

/**
 * GET /api/instagram/generate-with-stability?preview=true
 * Retorna informações sobre a API Stability AI
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
      info: {
        name: 'Stability AI (Stable Diffusion 3.5)',
        model: 'sd3.5-large',
        costPerImage: '$0.007',
        freeCredits: '$25 ao criar conta',
        estimatedFreeImages: '3,571 imagens grátis',
        features: [
          'Texto em português perfeitamente escrito',
          '10x mais barato que DALL-E 3',
          'Qualidade profissional',
          'Rate limit mais generoso',
          'Suporte a múltiplos estilos'
        ]
      },
      nichos: ['tech', 'business', 'lifestyle', 'education', 'fitness'],
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
      comparison: {
        'Stability AI': '$0.007/imagem',
        'DALL-E 3': '$0.080/imagem',
        'Economia': '10x mais barato'
      }
    })

  } catch (error) {
    console.error('[Stability API Preview] Erro:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar informações'
    }, { status: 500 })
  }
}
