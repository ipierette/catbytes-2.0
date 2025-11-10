import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient()
  
  const { data: landingPage } = await supabase
    .from('landing_pages')
    .select('title, headline, subheadline, hero_image_url')
    .eq('slug', slug)
    .single()

  if (!landingPage) {
    return {
      title: 'Página não encontrada',
    }
  }

  return {
    title: landingPage.title,
    description: landingPage.subheadline,
    openGraph: {
      title: landingPage.headline,
      description: landingPage.subheadline,
      images: landingPage.hero_image_url ? [landingPage.hero_image_url] : [],
    },
  }
}

export default async function LandingPagePreview({ params }: PageProps) {
  const { slug } = await params
  const supabase = createClient()

  // Buscar landing page
  const { data: landingPage, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !landingPage) {
    notFound()
  }

  // Incrementar view count
  await supabase
    .from('landing_pages')
    .update({ views_count: (landingPage.views_count || 0) + 1 })
    .eq('id', landingPage.id)

  // Registrar view no analytics
  await supabase
    .from('landing_page_views')
    .insert({
      landing_page_id: landingPage.id,
      viewed_at: new Date().toISOString(),
    })

  // Renderizar HTML diretamente
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: landingPage.html_content }}
      suppressHydrationWarning
    />
  )
}
