import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Projects from '@/components/sections/projects'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  const title = locale === 'pt-BR' 
    ? 'Projetos | Izadora Pierette - Portfolio de Desenvolvimento'
    : 'Projects | Izadora Pierette - Development Portfolio'
  
  const description = locale === 'pt-BR'
    ? 'Explore meus projetos de desenvolvimento web, aplicações React, Next.js, e soluções com IA. Portfolio completo de trabalhos em front-end e full-stack.'
    : 'Explore my web development projects, React applications, Next.js, and AI solutions. Complete portfolio of front-end and full-stack work.'

  return {
    title,
    description,
    alternates: {
      canonical: `https://catbytes.com/${locale}/projetos`,
      languages: {
        'pt-BR': 'https://catbytes.com/pt-BR/projetos',
        'en-US': 'https://catbytes.com/en-US/projects'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      url: `https://catbytes.com/${locale}/projetos`,
      title,
      description,
      siteName: 'CatBytes',
      images: [
        {
          url: '/images/og-projects.jpg',
          width: 1200,
          height: 630,
          alt: 'CatBytes Projects Portfolio'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-projects.jpg']
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    }
  }
}

// Structured Data for Projects
function generateProjectsStructuredData(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: locale === 'pt-BR' ? 'Projetos' : 'Projects',
    description: locale === 'pt-BR' 
      ? 'Portfolio de projetos de desenvolvimento web'
      : 'Web development projects portfolio',
    url: `https://catbytes.com/${locale}/projetos`,
    author: {
      '@type': 'Person',
      name: 'Izadora Cury Pierette',
      jobTitle: 'Front-end Developer',
      url: 'https://catbytes.com'
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'CatBytes',
      url: 'https://catbytes.com'
    }
  }
}

export default async function ProjetosPage({ params }: Props) {
  const { locale } = await params
  const structuredData = generateProjectsStructuredData(locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen pt-safe pb-safe">
        <Projects />
      </div>
    </>
  )
}
