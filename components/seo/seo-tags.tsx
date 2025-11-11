'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface SEOTagsProps {
  locale: string
  currentPath?: string
}

export function SEOTags({ locale, currentPath }: SEOTagsProps) {
  const pathname = usePathname()
  const siteUrl = 'https://catbytes.site'
  
  useEffect(() => {
    // Remove tags antigas se existirem
    const oldCanonical = document.querySelector('link[rel="canonical"]')
    const oldAlternates = document.querySelectorAll('link[rel="alternate"]')
    
    if (oldCanonical) oldCanonical.remove()
    oldAlternates.forEach(tag => tag.remove())

    // Constrói a URL canônica
    const path = currentPath || pathname || `/${locale}`
    const canonicalUrl = `${siteUrl}${path}`

    // Adiciona canonical
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = canonicalUrl
    document.head.appendChild(canonical)

    // Adiciona hreflang para pt-BR
    const hreflangPt = document.createElement('link')
    hreflangPt.rel = 'alternate'
    hreflangPt.hreflang = 'pt-BR'
    hreflangPt.href = path.replace(/^\/(en-US|pt-BR)/, '/pt-BR')
    if (!hreflangPt.href.startsWith('http')) {
      hreflangPt.href = `${siteUrl}${hreflangPt.href}`
    }
    document.head.appendChild(hreflangPt)

    // Adiciona hreflang para en-US
    const hreflangEn = document.createElement('link')
    hreflangEn.rel = 'alternate'
    hreflangEn.hreflang = 'en-US'
    hreflangEn.href = path.replace(/^\/(en-US|pt-BR)/, '/en-US')
    if (!hreflangEn.href.startsWith('http')) {
      hreflangEn.href = `${siteUrl}${hreflangEn.href}`
    }
    document.head.appendChild(hreflangEn)

    // Adiciona x-default
    const hreflangDefault = document.createElement('link')
    hreflangDefault.rel = 'alternate'
    hreflangDefault.hreflang = 'x-default'
    hreflangDefault.href = path.replace(/^\/(en-US|pt-BR)/, '/pt-BR')
    if (!hreflangDefault.href.startsWith('http')) {
      hreflangDefault.href = `${siteUrl}${hreflangDefault.href}`
    }
    document.head.appendChild(hreflangDefault)

  }, [locale, pathname, currentPath])

  return null
}
