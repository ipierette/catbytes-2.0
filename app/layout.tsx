import type { Metadata } from 'next'
import { Inter, Comfortaa } from 'next/font/google'
// Removed unused imports: routing, notFound
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
  metadataBase: new URL('https://catbytes.com'),
  title: {
    default: 'Izadora Cury Pierette | CatBytes — Portfólio Criativo',
    template: '%s | CatBytes'
  },
  description: 'Conheça projetos que unem design moderno, código limpo e soluções com inteligência artificial e automação.',
  keywords: ['react', 'next.js', 'desenvolvedor front-end', 'portfolio', 'web development', 'AI'],
  authors: [{ name: 'Izadora Cury Pierette' }],
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
  manifest: '/manifest.json',
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
    title: 'Izadora Cury Pierette | CatBytes — Portfólio Criativo',
    description: 'Conheça projetos que unem design moderno, código limpo e soluções com inteligência artificial e automação.',
    siteName: 'CatBytes',
    images: [
      {
        url: '/images/og-1200x630-safe.webp',
        width: 1200,
        height: 630,
        alt: 'CatBytes Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Izadora Cury Pierette | CatBytes — Portfólio Criativo',
    description: 'Conheça projetos que unem design moderno, código limpo e soluções com inteligência artificial e automação.',
    images: ['/images/og-1200x630-safe.webp'],
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

  return (
    <html
      lang={resolvedParams?.locale || 'pt-BR'}
      className={`${inter.variable} ${comfortaa.variable}`}
      suppressHydrationWarning
    >
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
