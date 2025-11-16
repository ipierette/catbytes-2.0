import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Media Studio | CatBytes',
  description: 'Plataforma integrada de produção de conteúdo multimídia',
  robots: 'noindex, nofollow', // Admin area
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  )
}
