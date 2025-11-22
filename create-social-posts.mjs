import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Buscar artigo de hoje
const { data: post } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('slug', 'decifre-o-comportamento-do-seu-gato-a-linguagem-corporal-felina')
  .single()

if (!post) {
  console.error('Artigo não encontrado')
  process.exit(1)
}

console.log('Artigo:', post.title)
console.log('Slug:', post.slug)
console.log('Cover:', post.cover_image_url)
console.log('Excerpt:', post.excerpt)

// Criar post Instagram
const instagramResponse = await fetch('https://catbytes.site/api/instagram/publish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
  },
  body: JSON.stringify({
    image_url: post.cover_image_url,
    caption: `📰 NOVO ARTIGO NO BLOG!

📌 ${post.title}

✨ ${post.excerpt}

🐱💙 Este portfólio tem também uma missão social: incentivar a adoção responsável e promover o bem-estar de felinos domésticos. Por isso, dedicamos parte da nossa produção a artigos informativos sobre saúde, cuidado e proteção de gatinhos.

🔗 Leia o artigo completo no link da bio!

#catbytes #izadoracurypierette #gatos #comportamentofelino #linguagemcorporal #cuidadosfelinos #adocaoderesponsavel #gatosdobrasil #amogatos #dicasfelinas`,
    auto_publish: true,
    blog_category: 'Cuidados Felinos'
  })
})

const instagramResult = await instagramResponse.json()
console.log('\n✅ Instagram:', instagramResult)

// Criar post LinkedIn  
const linkedinResponse = await fetch('https://catbytes.site/api/linkedin/publish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY
  },
  body: JSON.stringify({
    text: `📰 Novo artigo no blog CatBytes!

📌 ${post.title}

${post.excerpt}

Como desenvolvedora fullstack, acredito que tecnologia e empatia caminham juntas. Por isso, dedico parte do meu trabalho a conteúdos sobre o bem-estar animal, especialmente felinos.

Este artigo explora a fascinante linguagem corporal dos gatos, ajudando tutores a compreenderem melhor seus companheiros.

🔗 Leia o artigo completo: https://catbytes.site/pt-BR/blog/${post.slug}

#desenvolvimentoweb #tecnologia #cuidadosfelinos #bemestaranimal #gatos #responsabilidadesocial`,
    image_url: post.cover_image_url,
    publish_now: true,
    blog_category: 'Cuidados Felinos'
  })
})

const linkedinResult = await linkedinResponse.json()
console.log('\n✅ LinkedIn:', linkedinResult)
