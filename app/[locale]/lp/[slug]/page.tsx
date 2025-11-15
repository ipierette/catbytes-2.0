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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    // Favicons otimizados para LPs
    icons: {
      icon: [
        {
          url: '/favicon-lp-16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          url: '/favicon-lp-32.png',
          sizes: '32x32',
          type: 'image/png',
        },
      ],
      apple: {
        url: '/favicon-lp-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      other: [
        {
          rel: 'icon',
          url: '/favicon-lp-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
    openGraph: {
      title: landingPage.headline,
      description: landingPage.subheadline,
      url: `https://catbytes.site/pt-BR/lp/${slug}`,
      type: 'website',
      images: landingPage.hero_image_url ? [{
        url: landingPage.hero_image_url,
        width: 1200,
        height: 630,
        alt: landingPage.headline,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: landingPage.headline,
      description: landingPage.subheadline,
      images: landingPage.hero_image_url ? [landingPage.hero_image_url] : [],
    },
    alternates: {
      canonical: `https://catbytes.site/pt-BR/lp/${slug}`,
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

  // Schema.org structured data para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: landingPage.headline,
    description: landingPage.subheadline,
    url: `https://catbytes.site/pt-BR/lp/${slug}`,
    image: landingPage.hero_image_url,
    datePublished: landingPage.created_at,
    dateModified: landingPage.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'CATBytes AI',
      url: 'https://catbytes.site',
      logo: {
        '@type': 'ImageObject',
        url: 'https://catbytes.site/images/logo-desenvolvedora.webp',
      },
    },
    inLanguage: 'pt-BR',
  }

  // Renderizar HTML diretamente
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div 
        dangerouslySetInnerHTML={{ __html: landingPage.html_content }}
        suppressHydrationWarning
      />
    </>
  )
}
