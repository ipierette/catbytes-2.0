import { Metadata } from 'next'
import FAQClient from './faq-client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en-US'
  
  return {
    title: isEnglish ? 'FAQ - Frequently Asked Questions | CatBytes' : 'FAQ - Perguntas Frequentes | CatBytes',
    description: isEnglish 
      ? 'Find answers to common questions about CatBytes services, technologies, automation with n8n, AI integration, and web development. Professional support and custom solutions.'
      : 'Encontre respostas para dúvidas comuns sobre os serviços da CatBytes, tecnologias, automação com n8n, integração de IA e desenvolvimento web. Suporte profissional e soluções personalizadas.',
    keywords: 'FAQ, frequently asked questions, CatBytes, web development, n8n automation, AI integration, perguntas frequentes, desenvolvimento web, automação, inteligência artificial',
    robots: 'index, follow',
    alternates: {
      canonical: `https://catbytes.site/${locale}/faq`,
      languages: {
        'pt-BR': 'https://catbytes.site/pt-BR/faq',
        'en-US': 'https://catbytes.site/en-US/faq',
      },
    },
    openGraph: {
      title: isEnglish ? 'FAQ - Frequently Asked Questions | CatBytes' : 'FAQ - Perguntas Frequentes | CatBytes',
      description: isEnglish 
        ? 'Find answers to common questions about CatBytes services and technologies'
        : 'Encontre respostas para dúvidas comuns sobre os serviços e tecnologias da CatBytes',
      url: `https://catbytes.site/${locale}/faq`,
      siteName: 'CatBytes',
      locale: locale,
      type: 'website',
      images: [
        {
          url: 'https://catbytes.site/images/gatinho-faq.png',
          width: 800,
          height: 800,
          alt: isEnglish ? 'CatBytes FAQ' : 'FAQ CatBytes',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isEnglish ? 'FAQ - Frequently Asked Questions | CatBytes' : 'FAQ - Perguntas Frequentes | CatBytes',
      description: isEnglish 
        ? 'Find answers to common questions about CatBytes services and technologies'
        : 'Encontre respostas para dúvidas comuns sobre os serviços e tecnologias da CatBytes',
      images: ['https://catbytes.site/images/gatinho-faq.png'],
    },
  }
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params
  return <FAQClient locale={locale} />
}
