import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AdminProvider } from '@/hooks/use-admin'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { DesktopLayout } from '@/components/layout'
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker'
import { SEOTags } from '@/components/seo/seo-tags'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const isValidLocale = routing.locales.includes(locale as any)
  if (!isValidLocale) return {}

  const translations: Record<string, any> = {
    'pt-BR': {
      title: 'Izadora Cury Pierette | CatBytes — Portfólio Criativo',
      description: 'Desenvolvedora front-end especializada em React, Next.js e IA. Criando experiências digitais que unem criatividade e tecnologia.'
    },
    'en-US': {
      title: 'Izadora Cury Pierette | CatBytes — Creative Portfolio',
      description: 'Front-end developer specialized in React, Next.js and AI. Creating digital experiences that combine creativity and technology.'
    }
  }

  const t = translations[locale]
  const siteUrl = 'https://catbytes.site'

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'pt-BR': `${siteUrl}/pt-BR`,
        'en-US': `${siteUrl}/en-US`
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      alternateLocale: locale === 'pt-BR' ? 'en_US' : 'pt_BR',
      url: `${siteUrl}/${locale}`,
      title: t.title,
      description: t.description,
      siteName: 'CatBytes',
      images: [
        {
          url: `${siteUrl}/images/og-1200x630-safe.jpg`,
          width: 1200,
          height: 630,
          alt: 'CatBytes Portfolio'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
      images: [`${siteUrl}/images/og-1200x630-safe.jpg`]
    }
  }
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  // Await params (Next.js 15 requirement)
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AdminProvider>
          <SEOTags locale={locale} />
          <DesktopLayout>
            <ScrollProgress />
            <AnalyticsTracker />
            <main>{children}</main>
          </DesktopLayout>
        </AdminProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
