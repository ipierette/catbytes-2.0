import { Metadata } from 'next'
import { AIFeatures } from '@/components/sections/ai-features'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  const title = locale === 'pt-BR' 
    ? 'IA Felina | CatBytes - Identificação de Gatos e Ferramentas com IA'
    : 'Feline AI | CatBytes - Cat Identification and AI Tools'
  
  const description = locale === 'pt-BR'
    ? 'Ferramentas de Inteligência Artificial para gatos: identificar raças, gerar anúncios de adoção e encontrar gatinhos para adotar. IA aplicada ao mundo felino.'
    : 'Artificial Intelligence tools for cats: identify breeds, generate adoption ads and find kittens to adopt. AI applied to the feline world.'

  return {
    title,
    description,
    alternates: {
      canonical: `https://catbytes.com/${locale}/ia-felina`,
      languages: {
        'pt-BR': 'https://catbytes.com/pt-BR/ia-felina',
        'en-US': 'https://catbytes.com/en-US/feline-ai'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      url: `https://catbytes.com/${locale}/ia-felina`,
      title,
      description,
      siteName: 'CatBytes',
      images: [
        {
          url: '/images/og-ai-features.jpg',
          width: 1200,
          height: 630,
          alt: 'CatBytes AI Features'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-ai-features.jpg']
    },
    keywords: locale === 'pt-BR' 
      ? 'ia gatos, identificar raça gato, adoção gatos, inteligência artificial pets'
      : 'cat ai, identify cat breed, cat adoption, pet artificial intelligence',
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

// Structured Data for AI Features
function generateAIFeaturesStructuredData(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: locale === 'pt-BR' ? 'IA Felina CatBytes' : 'CatBytes Feline AI',
    applicationCategory: 'UtilityApplication',
    description: locale === 'pt-BR' 
      ? 'Ferramentas de IA para identificação de raças de gatos e adoção'
      : 'AI tools for cat breed identification and adoption',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL'
    },
    author: {
      '@type': 'Person',
      name: 'Izadora Cury Pierette',
      url: 'https://catbytes.com'
    },
    featureList: locale === 'pt-BR'
      ? 'Identificar raça de gatos, Gerar anúncios de adoção, Encontrar gatos para adotar'
      : 'Identify cat breeds, Generate adoption ads, Find cats for adoption'
  }
}

export default async function IAFelinaPage({ params }: Props) {
  const { locale } = await params
  const structuredData = generateAIFeaturesStructuredData(locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen pt-safe pb-safe">
        <AIFeatures />
      </div>
    </>
  )
}
