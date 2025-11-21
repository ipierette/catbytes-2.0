import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter, Comfortaa } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import './mobile-performance.css'

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
    default: 'CatBytes - Izadora Pierette | Web, React e IA',
    template: '%s | CatBytes'
  },
  description: 'Desenvolvedora web full-stack especializada em React, Next.js, TypeScript e IA. Portfólio de projetos modernos com design responsivo e automação inteligente.',
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
      { url: '/favicon.ico?v=20251120', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-16x16.png?v=20251120', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=20251120', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64x64.png?v=20251120', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=20251120',
    apple: '/apple-touch-icon.png?v=20251120',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/favicon-192x192.png?v=20251120',
      },
    ],
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
    title: 'CatBytes - Izadora Pierette | Web, React e IA',
    description: 'Desenvolvedora web full-stack especializada em React, Next.js, TypeScript e IA. Portfólio de projetos modernos com design responsivo e automação inteligente.',
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
    title: 'CatBytes - Izadora Pierette | Web, React e IA',
    description: 'Desenvolvedora web full-stack especializada em React, Next.js, TypeScript e IA. Portfólio de projetos modernos.',
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
        
        {/* Force favicon refresh */}
        <link rel="icon" href="/favicon.ico?v=20251120" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=20251120" type="image/x-icon" />
        
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Preload critical assets */}
        <link 
          rel="preload" 
          href="/images/gato-sentado.webp" 
          as="image" 
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        {/* Google Analytics - Carregamento otimizado */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3P34NX4KV8"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
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
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
