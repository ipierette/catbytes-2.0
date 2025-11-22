import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { NewsletterForm } from '@/components/newsletter/newsletter-form'

export const metadata: Metadata = {
  title: 'Inscreva-se na Newsletter | CatBytes',
  description: 'Receba artigos exclusivos sobre IA, automação e tecnologia direto no seu email.',
}

export default function NewsletterSignupPage({ params }: { params: { locale: string } }) {
  const isEnglish = params.locale === 'en-US'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href={`/${params.locale}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEnglish ? 'Back to Home' : 'Voltar ao Início'}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Newsletter Image */}
          <div className="relative">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/newsletter.webp"
                alt={isEnglish ? 'Newsletter Subscription' : 'Inscrição Newsletter'}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          </div>

          {/* Right: Form */}
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Mail className="h-8 w-8 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  {isEnglish ? 'Join Our Newsletter' : 'Inscreva-se na Newsletter'}
                </h1>
              </div>
              
              <p className="text-lg text-slate-400 leading-relaxed">
                {isEnglish 
                  ? 'Get exclusive articles about AI, automation, and technology delivered straight to your inbox.'
                  : 'Receba artigos exclusivos sobre IA, automação e tecnologia direto no seu email.'}
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300">
                  {isEnglish 
                    ? 'Weekly articles on AI and automation' 
                    : 'Artigos semanais sobre IA e automação'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300">
                  {isEnglish 
                    ? 'Exclusive tips and tutorials' 
                    : 'Dicas e tutoriais exclusivos'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300">
                  {isEnglish 
                    ? 'No spam, unsubscribe anytime' 
                    : 'Sem spam, cancele quando quiser'}
                </p>
              </div>
            </div>

            {/* Newsletter Form */}
            <NewsletterForm locale={params.locale} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-3">
            {isEnglish ? 'What to expect?' : 'O que esperar?'}
          </h2>
          <p className="text-slate-400 leading-relaxed">
            {isEnglish 
              ? 'Each week, we share carefully curated content covering the latest in artificial intelligence, business automation, web development, and digital innovation. Our goal is to help you stay ahead in the tech world with practical, actionable insights.'
              : 'Toda semana, compartilhamos conteúdo cuidadosamente selecionado sobre as últimas novidades em inteligência artificial, automação de negócios, desenvolvimento web e inovação digital. Nosso objetivo é ajudá-lo a se manter à frente no mundo tech com insights práticos e acionáveis.'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          <p>
            {isEnglish 
              ? 'By subscribing, you agree to receive emails from CatBytes. You can unsubscribe at any time.'
              : 'Ao se inscrever, você concorda em receber emails da CatBytes. Você pode cancelar a qualquer momento.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
