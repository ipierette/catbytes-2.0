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
    default: 'CatBytes | Izadora Cury Pierette — Portfólio de Desenvolvimento Web e IA',
    template: '%s | CatBytes'
  },
  description: 'CatBytes é o portfólio de Izadora Cury Pierette, desenvolvedora full-stack especializada em React, Next.js, TypeScript e soluções com inteligência artificial. Projetos que unem design moderno, código limpo e automação.',
  keywords: [
    'CatBytes',
    'Izadora Cury Pierette',
    'Izadora Pierette',
    'desenvolvedor react',
    'desenvolvedor next.js',
    'desenvolvedor typescript',
    'portfolio desenvolvedor',
    'full stack developer',
    'front-end developer',
    'inteligência artificial',
    'automação web',
    'React',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'web development',
    'AI automation',
    'chatbot development',
    'UI/UX design'
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
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
    title: 'CatBytes | Izadora Cury Pierette — Portfólio de Desenvolvimento Web e IA',
    description: 'Portfólio de Izadora Cury Pierette: projetos que unem design moderno, código limpo e soluções com inteligência artificial. Especialista em React, Next.js e automação.',
    siteName: 'CatBytes',
    images: [
      {
        url: '/images/og-1200x630-safe.webp',
        width: 1200,
        height: 630,
        alt: 'CatBytes - Portfólio de Izadora Cury Pierette',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CatBytes | Izadora Cury Pierette — Portfólio de Desenvolvimento Web e IA',
    description: 'Portfólio de Izadora Cury Pierette: projetos que unem design moderno, código limpo e soluções com inteligência artificial.',
    images: ['/images/og-1200x630-safe.webp'],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
