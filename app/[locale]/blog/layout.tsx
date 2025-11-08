import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  
  const translations: Record<string, any> = {
    'pt-BR': {
      title: 'Blog CatBytes | Artigos sobre Desenvolvimento Web, React e IA',
      description: 'Artigos e tutoriais sobre desenvolvimento web, React, Next.js, TypeScript, inteligência artificial e automação. Conteúdo técnico de qualidade por Izadora Pierette.',
      keywords: [
        'blog catbytes',
        'artigos react',
        'tutoriais next.js',
        'desenvolvimento web',
        'inteligência artificial',
        'automação',
        'typescript',
        'javascript',
        'programação',
        'izadora pierette blog'
      ]
    },
    'en-US': {
      title: 'CatBytes Blog | Articles about Web Development, React and AI',
      description: 'Articles and tutorials about web development, React, Next.js, TypeScript, artificial intelligence and automation. Quality technical content by Izadora Pierette.',
      keywords: [
        'catbytes blog',
        'react articles',
        'next.js tutorials',
        'web development',
        'artificial intelligence',
        'automation',
        'typescript',
        'javascript',
        'programming',
        'izadora pierette blog'
      ]
    }
  }

  const t = translations[locale] || translations['pt-BR']

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    openGraph: {
      type: 'website',
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      url: `https://catbytes.site/${locale}/blog`,
      title: t.title,
      description: t.description,
      siteName: 'CatBytes',
      images: [
        {
          url: '/images/og-1200x630-safe.webp',
          width: 1200,
          height: 630,
          alt: 'CatBytes Blog'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
      images: ['/images/og-1200x630-safe.webp']
    },
    alternates: {
      canonical: `https://catbytes.site/${locale}/blog`,
      languages: {
        'pt-BR': 'https://catbytes.site/pt-BR/blog',
        'en-US': 'https://catbytes.site/en-US/blog'
      }
    }
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Hidden SEO content for Google */}
      <div className="hidden" aria-hidden="true">
        <h1>Blog CatBytes - Artigos sobre Desenvolvimento Web e Inteligência Artificial</h1>
        <article>
          <h2>Últimos Artigos do Blog CatBytes</h2>
          <p>
            Bem-vindo ao blog CatBytes, onde Izadora Cury Pierette compartilha conhecimento
            sobre desenvolvimento web, React, Next.js, TypeScript e inteligência artificial.
          </p>
          <p>
            Aqui você encontra tutoriais práticos, dicas de programação, insights sobre 
            tecnologias modernas e estratégias de automação para impulsionar seu negócio digital.
          </p>
          <h3>Tópicos Abordados</h3>
          <ul>
            <li>Desenvolvimento Front-end com React e Next.js</li>
            <li>TypeScript e JavaScript moderno</li>
            <li>Inteligência Artificial e Machine Learning</li>
            <li>Automação de processos e chatbots</li>
            <li>UI/UX Design e acessibilidade</li>
            <li>Performance e otimização web</li>
            <li>SEO e marketing digital</li>
          </ul>
        </article>
      </div>
      {children}
    </>
  )
}
