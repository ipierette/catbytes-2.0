import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Target, Zap, Heart, Code, Rocket } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Manifesto da IA | CatBytes',
  description: 'Nossa visão sobre o uso ético e responsável da inteligência artificial para transformar negócios e empoderar pessoas.',
}

export default function AIManifestoPage({ params }: { params: { locale: string } }) {
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

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isEnglish ? 'Our Vision' : 'Nossa Visão'}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {isEnglish ? 'AI Manifesto' : 'Manifesto da IA'}
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {isEnglish 
              ? 'How we believe artificial intelligence should be used to transform businesses and empower people, ethically and responsibly.'
              : 'Como acreditamos que a inteligência artificial deve ser usada para transformar negócios e empoderar pessoas, de forma ética e responsável.'}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Core Principles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            {isEnglish ? 'Our Core Principles' : 'Nossos Princípios Fundamentais'}
          </h2>

          <div className="space-y-6">
            {/* Principle 1 */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isEnglish ? '1. AI as an Empowerment Tool' : '1. IA como Ferramenta de Empoderamento'}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {isEnglish 
                      ? 'We believe AI should empower people, not replace them. Our focus is on creating solutions that amplify human capabilities, automate repetitive tasks, and free up time for what truly matters: creativity, strategy, and human connection.'
                      : 'Acreditamos que a IA deve empoderar pessoas, não substituí-las. Nosso foco é criar soluções que amplificam as capacidades humanas, automatizam tarefas repetitivas e liberam tempo para o que realmente importa: criatividade, estratégia e conexão humana.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Principle 2 */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-green-500/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg flex-shrink-0">
                  <Heart className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isEnglish ? '2. Ethics and Transparency' : '2. Ética e Transparência'}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {isEnglish 
                      ? 'Every AI solution we develop prioritizes ethics, data privacy, and transparency. We believe users have the right to understand how AI works, what data is being used, and how decisions are made. No black boxes, no hidden agendas.'
                      : 'Toda solução de IA que desenvolvemos prioriza ética, privacidade de dados e transparência. Acreditamos que os usuários têm o direito de entender como a IA funciona, quais dados estão sendo usados e como as decisões são tomadas. Sem caixas-pretas, sem agendas ocultas.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Principle 3 */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-purple-500/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg flex-shrink-0">
                  <Code className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isEnglish ? '3. Accessibility and Inclusion' : '3. Acessibilidade e Inclusão'}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {isEnglish 
                      ? 'Technology should be accessible to everyone, not just tech giants. We democratize AI by creating affordable, easy-to-use solutions for small and medium businesses, freelancers, and entrepreneurs who want to compete in the digital age.'
                      : 'Tecnologia deve ser acessível a todos, não apenas a gigantes tech. Democratizamos a IA criando soluções acessíveis e fáceis de usar para pequenas e médias empresas, freelancers e empreendedores que querem competir na era digital.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Principle 4 */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-orange-500/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg flex-shrink-0">
                  <Rocket className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isEnglish ? '4. Continuous Innovation' : '4. Inovação Contínua'}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {isEnglish 
                      ? 'The world of AI evolves rapidly, and so do we. We are committed to staying at the forefront of innovation, constantly learning, experimenting, and adapting our solutions to meet the ever-changing needs of our clients and the market.'
                      : 'O mundo da IA evolui rapidamente, e nós também. Estamos comprometidos em permanecer na vanguarda da inovação, constantemente aprendendo, experimentando e adaptando nossas soluções para atender às necessidades em constante mudança de nossos clientes e do mercado.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="mb-16">
          <div className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              {isEnglish ? 'Our Commitment' : 'Nosso Compromisso'}
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-6">
              {isEnglish 
                ? 'At CatBytes, we are committed to building AI solutions that:'
                : 'Na CatBytes, estamos comprometidos em construir soluções de IA que:'}
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>{isEnglish ? 'Respect user privacy and data security' : 'Respeitam a privacidade e segurança de dados dos usuários'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>{isEnglish ? 'Are transparent in their operation and decision-making' : 'São transparentes em seu funcionamento e tomada de decisões'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>{isEnglish ? 'Empower humans rather than replace them' : 'Empoderam humanos ao invés de substituí-los'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>{isEnglish ? 'Are accessible and affordable for all business sizes' : 'São acessíveis e financeiramente viáveis para empresas de todos os tamanhos'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">✓</span>
                <span>{isEnglish ? 'Continuously evolve with technological advances' : 'Evoluem continuamente com os avanços tecnológicos'}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              {isEnglish ? 'Join Us on This Journey' : 'Junte-se a Nós Nesta Jornada'}
            </h2>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
              {isEnglish 
                ? 'Whether you\'re a business looking to automate processes, an entrepreneur wanting to scale, or simply someone curious about AI, we\'re here to help you navigate this technological revolution.'
                : 'Seja você uma empresa buscando automatizar processos, um empreendedor querendo escalar, ou simplesmente alguém curioso sobre IA, estamos aqui para ajudá-lo a navegar nesta revolução tecnológica.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${params.locale}/newsletter-inscricao`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isEnglish ? 'Subscribe to Newsletter' : 'Inscrever na Newsletter'}
              </Link>
              <Link
                href={`/${params.locale}/contato`}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                {isEnglish ? 'Get in Touch' : 'Entre em Contato'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          <p>
            {isEnglish 
              ? '© 2024 CatBytes. Building the future with ethical AI.'
              : '© 2024 CatBytes. Construindo o futuro com IA ética.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
