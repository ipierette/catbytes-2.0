/**
 * API para gerar posts do Instagram usando DALL-E 3
 * (Antigo: Leonardo AI - nome da rota mantido para compatibilidade)
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePostWithDALLE } from '@/lib/dalle-canvas-post-generator'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminCookie } from '@/lib/api-security'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🎨 [DEBUG LEONARDO] === INICIANDO GERAÇÃO ===')
    
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error!
    }
    console.log('🎨 [DEBUG LEONARDO] ✓ Admin verificado via cookie')

    const { nicho, tema, palavrasChave, estilo, quantidade = 1 } = await request.json()

    console.log('🎨 [DEBUG LEONARDO] Parâmetros recebidos:', { nicho, tema, quantidade, estilo, palavrasChave })

    if (!nicho || !tema) {
      console.error('🎨 [DEBUG LEONARDO] ❌ Nicho ou tema faltando')
      return NextResponse.json({
        success: false,
        error: 'Nicho e tema são obrigatórios'
      }, { status: 400 })
    }

    // Verificar API Key (DALL-E usa OPENAI_API_KEY)
    if (!process.env.OPENAI_API_KEY) {
      console.error('🎨 [DEBUG DALL-E] ❌ OPENAI_API_KEY não encontrada')
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY não configurada',
        sugestao: 'Adicione OPENAI_API_KEY no arquivo .env.local'
      }, { status: 500 })
    }

    const generatedPosts = []
    const errors = []

    for (let i = 0; i < quantidade; i++) {
      try {
        console.log(`🎨 [DEBUG DALL-E] === POST ${i + 1}/${quantidade} ===`)
        
        // 1. Gerar com DALL-E 3
        console.log('🎨 [DEBUG DALL-E] Chamando generatePostWithDALLE...')
        const post = await generatePostWithDALLE({
          nicho,
          tema: quantidade > 1 ? `${tema} - Variação ${i + 1}` : tema,
          palavrasChave: palavrasChave || [],
          estilo: estilo || 'moderno',
        })
        
        console.log('🎨 [DEBUG DALL-E] ✓ Post gerado:', {
          titulo: post.titulo,
          textoImagem: post.textoImagem?.substring(0, 50) + '...',
          imageData: post.imageBase64 ? `Base64 (${post.imageBase64.length} chars)` : 'FALHOU'
        })

        if (!post.imageBase64) {
          console.error('🎨 [DEBUG DALL-E] ❌ Imagem não foi gerada')
          errors.push(`Post ${i + 1}: Imagem não foi gerada`)
          continue
        }

        // 2. Fazer upload da imagem para Supabase Storage
        console.log('🎨 [DEBUG DALL-E] Fazendo upload da imagem...')
        const imageBuffer = Buffer.from(post.imageBase64, 'base64')
        const fileName = `generated/dalle-${Date.now()}-${i}.png`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('instagram-images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error('🎨 [DEBUG LEONARDO] ❌ Erro ao fazer upload:', uploadError)
          errors.push(`Post ${i + 1}: Erro ao fazer upload - ${uploadError.message}`)
          continue
        }

        console.log('🎨 [DEBUG LEONARDO] ✓ Upload concluído:', uploadData.path)

        // 3. Obter URL pública
        const { data: urlData } = supabase.storage
          .from('instagram-images')
          .getPublicUrl(fileName)

        const imageUrl = urlData.publicUrl
        console.log('🎨 [DEBUG LEONARDO] ✓ URL pública:', imageUrl)

        // 4. Criar registro no banco de dados
        console.log('🎨 [DEBUG LEONARDO] Salvando no banco de dados...')
        
        const postData = {
          nicho,
          titulo: post.titulo,
          texto_imagem: post.textoImagem,
          caption: post.caption,
          image_url: imageUrl,
          status: 'pending' as const,
          generation_method: 'dalle-3'
        }
        
        const { data: dbPost, error: insertError } = await supabase
          .from('instagram_posts')
          .insert(postData)
          .select()
          .single()

        if (insertError || !dbPost) {
          console.error('🎨 [DEBUG LEONARDO] ❌ Erro ao salvar no DB:', insertError)
          errors.push(`Post ${i + 1}: Erro ao salvar no banco - ${insertError?.message || 'Desconhecido'}`)
          continue
        }

        console.log('🎨 [DEBUG LEONARDO] ✓ Post salvo no DB, ID:', dbPost.id)

        generatedPosts.push({
          id: dbPost.id,
          ...post,
          imageUrl
        })

        console.log(`🎨 [DEBUG LEONARDO] ✅ Post ${i + 1}/${quantidade} CONCLUÍDO!`)

        // Aguardar 3 segundos entre gerações
        if (i < quantidade - 1) {
          console.log('🎨 [DEBUG LEONARDO] Aguardando 3s antes do próximo...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
        console.error(`🎨 [DEBUG LEONARDO] ❌ ERRO no post ${i + 1}:`, errorMsg)
        errors.push(`Post ${i + 1}: ${errorMsg}`)
      }
    }

    console.log('🎨 [DEBUG LEONARDO] === FIM DA GERAÇÃO ===')
    console.log('🎨 [DEBUG LEONARDO] Posts gerados:', generatedPosts.length)
    console.log('🎨 [DEBUG LEONARDO] Erros:', errors.length)

    if (generatedPosts.length === 0) {
      console.error('🎨 [DEBUG LEONARDO] ❌ NENHUM POST GERADO!')
      return NextResponse.json({
        success: false,
        error: 'Nenhum post foi gerado com sucesso',
        detalhes: errors
      }, { status: 500 })
    }

    console.log('🎨 [DEBUG LEONARDO] ✅ SUCESSO!')
    return NextResponse.json({
      success: true,
      posts: generatedPosts,
      generated: generatedPosts.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${generatedPosts.length} post(s) gerado(s) com DALL-E 3!`
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('🎨 [DEBUG LEONARDO] ❌ ERRO GERAL:', errorMsg)
    
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
}
