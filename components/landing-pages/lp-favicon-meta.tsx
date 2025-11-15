/**
 * Landing Page Favicon Meta Component
 * Adiciona favicons otimizados para todas as landing pages
 */

import { Metadata } from 'next'

export function generateLPFaviconMeta(): Metadata {
  return {
    icons: {
      icon: [
        {
          url: '/favicon-lp-16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          url: '/favicon-lp-32.png',
          sizes: '32x32',
          type: 'image/png',
        },
      ],
      apple: {
        url: '/favicon-lp-180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      other: [
        {
          rel: 'icon',
          url: '/favicon-lp-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    },
  }
}
