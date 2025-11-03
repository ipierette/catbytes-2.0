import type { Metadata } from 'next'
import { Inter, Comfortaa } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
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
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon-512x512.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
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
}: {
  children: React.ReactNode
  params?: Promise<{ locale?: string }>
}) {
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
