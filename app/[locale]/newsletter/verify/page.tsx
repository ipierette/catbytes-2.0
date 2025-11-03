import { Suspense } from 'react'
import { VerifyEmailContent } from './verify-content'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirmar Inscrição | CatBytes Newsletter',
  description: 'Confirme sua inscrição na newsletter CatBytes',
  robots: 'noindex, nofollow',
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function LoadingState() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20 px-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Verificando seu email...</p>
      </div>
    </main>
  )
}
