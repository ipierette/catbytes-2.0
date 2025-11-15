/**
 * Script para publicar manualmente posts sociais do artigo do blog de hoje
 * Uso: node publish-social-today.js
 */

const blogPost = {
  id: '41521029-5ae3-4325-9443-d2391179fcb0',
  title: 'Alimentação Amorosa: O Guia Completo Para Cada Fase do Gato',
  excerpt: 'Descubra como nutrir seu felino com amor em cada etapa da vida, desde gatinhos até a terceira idade',
  slug: 'alimentacao-amorosa-o-guia-completo-para-cada-fase-do-gato',
  cover_image_url: 'https://lbjekucdxgouwgegpdhi.supabase.co/storage/v1/object/public/blog-images/blog-covers/alimentacao-amorosa-o-guia-completo-para-cada-fase-1763219521864.webp',
  category: 'Cuidados Felinos',
  tags: ['gatos', 'alimentacao', 'saude felina', 'nutricao', 'cuidados']
}

const CRON_SECRET = process.env.CRON_SECRET || 'a0a99efa3213a7ffcf610276504172999bd3e07c908709c3fd6e25f44af518fb'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.catbytes.site'

async function generateSocialContent() {
  const { generateInstagramPost, generateLinkedInPost } = await import('./lib/blog-social-promoter.ts')
  
  console.log('📱 Gerando conteúdo dos posts sociais...\n')
  
  const instagramPost = await generateInstagramPost(blogPost)
  const linkedInPost = await generateLinkedInPost(blogPost)
  
  return {
    instagram: instagramPost,
    linkedin: linkedInPost
  }
}

async function publishToInstagram(content) {
  console.log('📸 Publicando no Instagram...')
  
  const response = await fetch(`${BASE_URL}/api/instagram/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CRON_SECRET}`
    },
    body: JSON.stringify({
      image_url: blogPost.cover_image_url,
      caption: content.fullText,
      auto_publish: true
    })
  })
  
  const result = await response.json()
  
  if (result.success) {
    console.log('✅ Instagram: Post criado com sucesso!')
    console.log('   ID:', result.id || result.instagram_post_id)
    console.log('   Status:', result.status)
  } else {
    console.error('❌ Instagram: Falha ao publicar')
    console.error('   Erro:', result.error || result.message)
  }
  
  return result
}

async function publishToLinkedIn(content) {
  console.log('\n💼 Publicando no LinkedIn...')
  
  const response = await fetch(`${BASE_URL}/api/linkedin/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CRON_SECRET}`
    },
    body: JSON.stringify({
      text: content.fullText,
      image_url: blogPost.cover_image_url,
      publish_now: true
    })
  })
  
  const result = await response.json()
  
  if (result.success) {
    console.log('✅ LinkedIn: Post criado com sucesso!')
    console.log('   ID:', result.id || result.post_id)
    console.log('   Status:', result.status)
  } else {
    console.error('❌ LinkedIn: Falha ao publicar')
    console.error('   Erro:', result.error || result.message)
  }
  
  return result
}

async function main() {
  try {
    console.log('='.repeat(60))
    console.log('🚀 Publicação Manual de Posts Sociais')
    console.log('='.repeat(60))
    console.log(`\n📝 Artigo: ${blogPost.title}`)
    console.log(`🔗 Slug: ${blogPost.slug}`)
    console.log(`🎨 Categoria: ${blogPost.category}\n`)
    
    // Gera conteúdo
    const content = await generateSocialContent()
    
    console.log('📄 Preview do conteúdo Instagram:')
    console.log('-'.repeat(60))
    console.log(content.instagram.fullText.substring(0, 200) + '...')
    console.log('-'.repeat(60))
    
    console.log('\n📄 Preview do conteúdo LinkedIn:')
    console.log('-'.repeat(60))
    console.log(content.linkedin.fullText.substring(0, 200) + '...')
    console.log('-'.repeat(60))
    console.log('')
    
    // Publica nos dois
    const [instagramResult, linkedInResult] = await Promise.allSettled([
      publishToInstagram(content.instagram),
      publishToLinkedIn(content.linkedin)
    ])
    
    console.log('\n' + '='.repeat(60))
    console.log('📊 Resumo da Publicação:')
    console.log('='.repeat(60))
    
    if (instagramResult.status === 'fulfilled' && instagramResult.value.success) {
      console.log('✅ Instagram: SUCESSO')
    } else {
      console.log('❌ Instagram: FALHA')
    }
    
    if (linkedInResult.status === 'fulfilled' && linkedInResult.value.success) {
      console.log('✅ LinkedIn: SUCESSO')
    } else {
      console.log('❌ LinkedIn: FALHA')
    }
    
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n❌ Erro durante a execução:', error)
    process.exit(1)
  }
}

main()
