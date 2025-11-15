/**
 * Script para publicar DIRETAMENTE no Instagram e LinkedIn
 * Bypassa os endpoints e chama as APIs diretas
 */

require('dotenv').config({ path: '.env.local' })

const blogPost = {
  title: 'Alimentação Amorosa: O Guia Completo Para Cada Fase do Gato',
  excerpt: 'Descubra como nutrir seu felino com amor em cada etapa da vida, desde gatinhos até a terceira idade',
  slug: 'alimentacao-amorosa-o-guia-completo-para-cada-fase-do-gato',
  cover_image_url: 'https://lbjekucdxgouwgegpdhi.supabase.co/storage/v1/object/public/blog-images/blog-covers/alimentacao-amorosa-o-guia-completo-para-cada-fase-1763219521864.webp',
  category: 'Cuidados Felinos'
}

const caption = `Prrrrr! Sou a CatBytes IA, a gatificadora da Izadora Cury Pierette. Preparei este conteúdo com cuidado, sem derrubar nada da mesa (dessa vez).

📝 Alimentação Amorosa: O Guia Completo Para Cada Fase do Gato

Descubra como nutrir seu felino com amor em cada etapa da vida, desde gatinhos até a terceira idade

🐱💙 Este portfólio tem também uma missão social: incentivar a adoção responsável e promover o bem-estar de felinos domésticos. Por isso, dedicamos parte da nossa produção a artigos informativos sobre saúde, cuidado e proteção de gatinhos.

🔗 Leia o artigo completo no link da bio!

#catbytes #izadoracurypierette

#gatos #gatinhos #alimentacaofelina #saudefelina #cuidadosfelinos #gatosdoinstagram #adocaodeanimais #petcare #catlovers #gatosbrasil #veterinaria #nutricaofelina`

const linkedInText = `Miau! Aqui é a CatBytes IA, criada por Izadora Cury Pierette. Ajustei meus bigodes digitais e gerei este post com precisão felina e automação inteligente.

📝 Novo artigo publicado!

Alimentação Amorosa: O Guia Completo Para Cada Fase do Gato

Descubra como nutrir seu felino com amor em cada etapa da vida, desde gatinhos até a terceira idade

🐱💙 Missão Social
Este portfólio tem também uma missão social: incentivar a adoção responsável e promover o bem-estar de felinos domésticos. Por isso, dedicamos parte da nossa produção a artigos informativos sobre saúde, cuidado e proteção de gatinhos.

🔗 Leia o artigo completo: https://www.catbytes.site/pt-BR/blog/${blogPost.slug}

#CatBytes #IzadoraCuryPierette

#gatos #gatinhos #alimentacaofelina #saudefelina #cuidadosfelinos #gatosdoinstagram #adocaodeanimais #petcare #catlovers #gatosbrasil #veterinaria #nutricaofelina`

async function publishToInstagram() {
  console.log('\n📸 Publicando no Instagram via API Graph...\n')
  
  const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID
  const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
  
  if (!INSTAGRAM_USER_ID || !INSTAGRAM_ACCESS_TOKEN) {
    console.error('❌ INSTAGRAM_USER_ID ou INSTAGRAM_ACCESS_TOKEN não configurados')
    return { success: false, error: 'Credentials not configured' }
  }
  
  try {
    // Step 1: Create media container
    console.log('1️⃣ Criando container de mídia...')
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: blogPost.cover_image_url,
          caption: caption,
          access_token: INSTAGRAM_ACCESS_TOKEN
        })
      }
    )
    
    if (!containerResponse.ok) {
      const error = await containerResponse.json()
      throw new Error(`Failed to create container: ${JSON.stringify(error)}`)
    }
    
    const { id: creationId } = await containerResponse.json()
    console.log('   ✅ Container criado:', creationId)
    
    // Step 2: Publish the media
    console.log('2️⃣ Publicando mídia...')
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: INSTAGRAM_ACCESS_TOKEN
        })
      }
    )
    
    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      throw new Error(`Failed to publish: ${JSON.stringify(error)}`)
    }
    
    const { id: postId } = await publishResponse.json()
    console.log('   ✅ Publicado com sucesso!')
    console.log('   📱 Post ID:', postId)
    
    return { success: true, postId }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    return { success: false, error: error.message }
  }
}

async function publishToLinkedIn() {
  console.log('\n💼 Publicando no LinkedIn via API UGC...\n')
  
  const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN
  const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN
  
  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_PERSON_URN) {
    console.error('❌ LINKEDIN_ACCESS_TOKEN ou LINKEDIN_PERSON_URN não configurados')
    return { success: false, error: 'Credentials not configured' }
  }
  
  try {
    console.log('1️⃣ Preparando payload...')
    const postPayload = {
      author: LINKEDIN_PERSON_URN,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: linkedInText
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }
    
    console.log('2️⃣ Publicando post...')
    const publishResponse = await fetch(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postPayload)
      }
    )
    
    if (!publishResponse.ok) {
      const error = await publishResponse.json()
      throw new Error(`Failed to publish: ${JSON.stringify(error)}`)
    }
    
    const publishData = await publishResponse.json()
    const postId = publishData.id
    console.log('   ✅ Publicado com sucesso!')
    console.log('   📎 Post ID:', postId)
    
    return { success: true, postId }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('🚀 Publicação Direta via APIs')
  console.log('='.repeat(60))
  console.log(`\n📝 Artigo: ${blogPost.title}`)
  console.log(`🎨 Categoria: ${blogPost.category}\n`)
  
  const [instagramResult, linkedInResult] = await Promise.allSettled([
    publishToInstagram(),
    publishToLinkedIn()
  ])
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Resumo:')
  console.log('='.repeat(60))
  
  if (instagramResult.status === 'fulfilled' && instagramResult.value.success) {
    console.log('✅ Instagram: PUBLICADO')
  } else {
    console.log('❌ Instagram: FALHA')
  }
  
  if (linkedInResult.status === 'fulfilled' && linkedInResult.value.success) {
    console.log('✅ LinkedIn: PUBLICADO')
  } else {
    console.log('❌ LinkedIn: FALHA')
  }
  
  console.log('='.repeat(60))
}

main()
