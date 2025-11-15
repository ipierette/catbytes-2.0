import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { nicho, titulo } = await req.json()

    // Prompts específicos por nicho para gerar imagens profissionais
    const imagePrompts: Record<string, string> = {
      automacao: 'modern corporate office with robotic arms and automation technology, professional business photography, high-end commercial photography, clean and minimal, warm lighting, 8k, no text',
      ecommerce: 'luxury e-commerce warehouse with organized packages and modern logistics, professional corporate photography, business environment, natural lighting, high quality, no text',
      saude: 'modern medical facility with advanced healthcare technology, professional medical photography, clean hospital environment, soft lighting, high resolution, no text',
      educacao: 'contemporary classroom with digital learning technology, professional educational photography, modern school environment, bright natural light, 8k quality, no text',
      financas: 'sophisticated financial district office with modern technology, professional corporate photography, business executives, glass and steel architecture, golden hour lighting, no text',
      marketing: 'creative marketing agency workspace with digital displays and team collaboration, professional business photography, modern office design, vibrant but professional, no text',
      logistica: 'state-of-the-art logistics center with automated sorting systems, professional industrial photography, modern warehouse, dramatic lighting, high quality, no text',
      tecnologia: 'cutting-edge tech company headquarters with innovation labs, professional corporate photography, modern architecture, blue hour lighting, futuristic but real, no text',
      energia: 'renewable energy facility with solar panels and wind turbines, professional industrial photography, sustainable technology, clear sky, high resolution, no text',
      manufatura: 'advanced manufacturing facility with precision machinery, professional industrial photography, modern factory floor, well-lit production line, 8k quality, no text',
      construcao: 'modern construction site with advanced equipment and smart building technology, professional architectural photography, safety and innovation, golden hour, no text',
      agricultura: 'smart agriculture facility with precision farming technology, professional agribusiness photography, modern greenhouse or farm, natural lighting, high quality, no text',
    }

    const prompt = imagePrompts[nicho] || 'professional corporate business photography, modern office environment, high-end commercial photography, natural lighting, 8k quality, no text'

    console.log('🎨 Gerando imagem hero para:', titulo)
    console.log('📝 Prompt:', prompt)

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024', // Formato paisagem ideal para hero
      quality: 'hd',
      style: 'natural', // Estilo fotográfico, não artístico
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('Nenhuma imagem gerada')
    }

    console.log('✅ Imagem gerada com sucesso:', imageUrl)

    // Baixar e salvar a imagem no Supabase Storage
    console.log('💾 Salvando imagem no Supabase Storage...')
    
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Gerar nome único para a imagem
    const timestamp = Date.now()
    const sanitizedTitle = titulo.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
    
    const fileName = `lp-hero/${nicho}-${sanitizedTitle}-${timestamp}.webp`
    
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not configured')
    }

    // Fazer upload para o bucket blog-images
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('blog-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 ano de cache
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Erro ao fazer upload:', uploadError)
      throw new Error(`Erro ao salvar imagem: ${uploadError.message}`)
    }

    // Obter URL pública permanente
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('blog-images')
      .getPublicUrl(fileName)

    console.log('✅ Imagem salva permanentemente:', publicUrl)

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl, // URL permanente do Supabase
      prompt,
    })
  } catch (error: any) {
    console.error('❌ Erro ao gerar imagem hero:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao gerar imagem',
      },
      { status: 500 }
    )
  }
}
