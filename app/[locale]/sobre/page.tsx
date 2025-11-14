import { Metadata } from 'next'
import { About } from '@/components/sections/about'
import { Skills } from '@/components/sections/skills'
import { Contact } from '@/components/sections/contact'
import { BreadcrumbStructuredData } from '@/components/seo/breadcrumb-structured-data'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  const title = locale === 'pt-BR' 
    ? 'Sobre | Izadora Pierette - Desenvolvedora Front-end React & Next.js'
    : 'About | Izadora Pierette - Front-end Developer React & Next.js'
  
  const description = locale === 'pt-BR'
    ? 'Conheça minha trajetória como desenvolvedora front-end especializada em React, Next.js e TypeScript. Skills, experiência e formas de contato profissional.'
    : 'Learn about my journey as a front-end developer specialized in React, Next.js and TypeScript. Skills, experience and professional contact methods.'

  return {
    title,
    description,
    alternates: {
      canonical: `https://catbytes.site/${locale}/sobre`,
      languages: {
        'pt-BR': 'https://catbytes.site/pt-BR/sobre',
        'en-US': 'https://catbytes.site/en-US/about'
      }
    },
    openGraph: {
      type: 'profile',
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      url: `https://catbytes.site/${locale}/sobre`,
      title,
      description,
      siteName: 'CatBytes',
      images: [
        {
          url: '/images/og-about.jpg',
          width: 1200,
          height: 630,
          alt: 'Izadora Pierette - Front-end Developer'
        }
      ],
      firstName: 'Izadora',
      lastName: 'Pierette'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-about.jpg']
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

// Structured Data for Person
function generatePersonStructuredData(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Izadora Cury Pierette',
    alternateName: 'CatBytes',
    jobTitle: 'Front-end Developer',
    description: locale === 'pt-BR' 
      ? 'Desenvolvedora front-end especializada em React, Next.js e TypeScript'
      : 'Front-end developer specialized in React, Next.js and TypeScript',
    url: 'https://catbytes.site',
    image: 'https://catbytes.site/images/izadora-pierette.jpg',
    sameAs: [
      'https://github.com/ipierette',
      'https://linkedin.com/in/izadora-pierette',
      'https://twitter.com/catbytes'
    ],
    knowsAbout: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'Node.js',
      'Web Development',
      'Front-end Development',
      'UI/UX',
      'Artificial Intelligence'
    ],
    knowsLanguage: [
      {
        '@type': 'Language',
        name: 'Portuguese',
        alternateName: 'pt-BR'
      },
      {
        '@type': 'Language',
        name: 'English',
        alternateName: 'en-US'
      }
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Professional',
      email: 'contact@catbytes.com'
    }
  }
}

export default async function SobrePage({ params }: Props) {
  const { locale } = await params
  const structuredData = generatePersonStructuredData(locale)
  
  const breadcrumbItems = [
    { name: 'Home', url: 'https://catbytes.site' },
    { name: locale === 'pt-BR' ? 'Sobre' : 'About', url: `https://catbytes.site/${locale}/sobre` },
  ]

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen pt-safe pb-safe">
        <About />
        <Skills />
        <Contact />
      </div>
    </>
  )
}
