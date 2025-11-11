import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Comfortaa } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

const comfortaa = Comfortaa({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comfortaa',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://catbytes.site'),
  verification: {
    google: 'x6dGmR7woC-z7VVaZottGIYO-gmCCEkNBzv9b9qWmgw',
    other: {
      'google-site-verification': ['5fc8fb7600af5494'],
    },
  },
  title: {
    default: 'CatBytes - Izadora Cury Pierette | Desenvolvimento Web, IA e Automação',
    template: '%s | CatBytes - Izadora Pierette'
  },
  description: 'CatBytes: Portfólio de Izadora Cury Pierette, desenvolvedora full-stack especializada em React, Next.js, TypeScript, Node.js e soluções com inteligência artificial. Projetos modernos que unem design responsivo, código limpo e automação inteligente. Desenvolvimento web profissional.',
  keywords: [
    'CatBytes',
    'catbytes',
    'cat bytes',
    'Izadora Cury Pierette',
    'Izadora Pierette',
    'izadora cury',
    'portfolio izadora',
    'desenvolvedor react',
    'desenvolvedor next.js',
    'desenvolvedor typescript',
    'portfolio desenvolvedor',
    'portifolio web developer',
    'full stack developer',
    'front-end developer',
    'backend developer',
    'desenvolvedor full stack brasil',
    'programador react',
    'inteligência artificial',
    'automação web',
    'chatbot AI',
    'React',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Node.js',
    'web development',
    'desenvolvimento web moderno',
    'AI automation',
    'chatbot development',
    'UI/UX design',
    'responsive design',
    'web application',
    'aplicação web',
    'site responsivo',
    'design moderno',
    'programação',
    'tecnologia',
    'desenvolvedor freelancer',
    'serviços de desenvolvimento',
    'criação de sites',
    'desenvolvimento de sistemas'
  ],
  authors: [{ name: 'Izadora Cury Pierette', url: 'https://catbytes.site' }],
  creator: 'Izadora Cury Pierette',
  publisher: 'CatBytes',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0617' }
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CatBytes'
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://catbytes.site',
    title: 'CatBytes - Izadora Cury Pierette | Desenvolvimento Web, IA e Automação',
    description: 'Portfólio de Izadora Cury Pierette: projetos que unem design moderno, código limpo e soluções com inteligência artificial. Especialista em React, Next.js e automação.',
    siteName: 'CatBytes',
    images: [
      {
        url: '/images/og-1200x630-safe.webp',
        width: 1200,
        height: 630,
        alt: 'CatBytes - Portfólio de Izadora Cury Pierette - Desenvolvimento Web, React, Next.js e IA',
        type: 'image/webp',
      },
      {
        url: '/images/og-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'CatBytes - Portfólio de Izadora Cury Pierette',
        type: 'image/jpeg',
      },
      {
        url: '/images/og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'CatBytes - Portfólio de Izadora Cury Pierette',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CatBytes - Izadora Cury Pierette | Desenvolvimento Web, IA e Automação',
    description: 'Portfólio de Izadora Cury Pierette: projetos que unem design moderno, código limpo e soluções com inteligência artificial.',
    images: ['/images/og-twitter-800x418.jpg'],
    creator: '@catbytes',
    site: '@catbytes',
  },
  alternates: {
    canonical: 'https://catbytes.site',
    languages: {
      'pt-BR': 'https://catbytes.site/pt-BR',
      'en-US': 'https://catbytes.site/en-US',
    },
  },
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params?: Promise<{ locale?: string }>
}>) {
  // Await params if they exist (Next.js 15)
  const resolvedParams = params ? await params : undefined

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://catbytes.site/#website',
        url: 'https://catbytes.site',
        name: 'CatBytes',
        description: 'Portfólio de desenvolvimento web, IA e automação de Izadora Cury Pierette',
        publisher: {
          '@id': 'https://catbytes.site/#person'
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://catbytes.site/pt-BR/blog?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        },
        inLanguage: ['pt-BR', 'en-US']
      },
      {
        '@type': 'Person',
        '@id': 'https://catbytes.site/#person',
        name: 'Izadora Cury Pierette',
        alternateName: 'Izadora Pierette',
        jobTitle: 'Full Stack Developer & AI Specialist',
        url: 'https://catbytes.site',
        image: {
          '@type': 'ImageObject',
          url: 'https://catbytes.site/images/og-1200x630-safe.webp',
          width: 1200,
          height: 630
        },
        sameAs: [
          'https://github.com/izadoracury',
          'https://www.linkedin.com/in/izadoracury',
        ],
        knowsAbout: [
          'Web Development',
          'React',
          'Next.js',
          'TypeScript',
          'Tailwind CSS',
          'AI Automation',
          'Chatbot Development',
          'UX/UI Design',
          'Front-end Development',
          'Full Stack Development'
        ],
        description: 'Desenvolvedora Full Stack especializada em React, Next.js, TypeScript e soluções com inteligência artificial. Criadora do portfólio CatBytes.',
        worksFor: {
          '@type': 'Organization',
          name: 'CatBytes',
          url: 'https://catbytes.site'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://catbytes.site/#organization',
        name: 'CatBytes',
        url: 'https://catbytes.site',
        logo: {
          '@type': 'ImageObject',
          url: 'https://catbytes.site/images/og-1200x630-safe.webp'
        },
        description: 'Portfólio de projetos de desenvolvimento web, inteligência artificial e automação',
        founder: {
          '@id': 'https://catbytes.site/#person'
        },
        sameAs: [
          'https://github.com/izadoracury',
        ]
      }
    ]
  }

  return (
    <html lang={resolvedParams?.locale || 'pt-BR'} className={`${inter.variable} ${comfortaa.variable}`} suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Meta tags adicionais para redes sociais */}
        <meta property="og:image" content="https://catbytes.site/images/og-1200x630.jpg" />
        <meta property="og:image:secure_url" content="https://catbytes.site/images/og-1200x630.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CatBytes - Portfólio de Izadora Cury Pierette - Desenvolvimento Web, React, Next.js e IA" />
        
        {/* Twitter/X Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@catbytes" />
        <meta name="twitter:creator" content="@catbytes" />
        <meta name="twitter:title" content="CatBytes - Izadora Cury Pierette | Desenvolvimento Web, IA e Automação" />
        <meta name="twitter:description" content="Portfólio de Izadora Cury Pierette: projetos que unem design moderno, código limpo e soluções com inteligência artificial." />
        <meta name="twitter:image" content="https://catbytes.site/images/og-twitter-800x418.jpg" />
        <meta name="twitter:image:alt" content="CatBytes - Portfólio de Izadora Pierette" />
        
        {/* LinkedIn */}
        <meta property="og:image" content="https://catbytes.site/images/og-linkedin-1200x600.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="600" />
        
        {/* WhatsApp (usa og:image square) */}
        <link rel="image_src" href="https://catbytes.site/images/og-whatsapp-1200x1200.jpg" />
        
        {/* Instagram/Facebook */}
        <meta property="og:image" content="https://catbytes.site/images/og-instagram-1080x1080.jpg" />
        <meta property="og:image:width" content="1080" />
        <meta property="og:image:height" content="1080" />
        
        {/* Favicon e touch icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3P34NX4KV8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3P34NX4KV8', {
              page_path: window.location.pathname,
              send_page_view: true
            });
            console.log('[Google Analytics] Tag inicializado: G-3P34NX4KV8');
          `}
        </Script>
        
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
