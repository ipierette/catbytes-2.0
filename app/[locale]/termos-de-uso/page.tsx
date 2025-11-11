import { Metadata } from 'next'
import { Scale, Mail, Shield, FileText, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso | CatBytes',
  description: 'Termos e condições de uso do site CatBytes. Conheça nossos direitos, deveres e políticas.',
}

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-catbytes-purple to-catbytes-pink rounded-2xl mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent mb-4">
            Termos de Uso
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Bem-vindo(a) ao site CatBytes (<a href="https://catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">https://catbytes.site</a>).
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ao acessar este site, você concorda com os termos e condições abaixo.<br />
            Caso não concorde, recomendamos que não continue a navegação.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          {/* Section 1 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🐾</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  1. Finalidade do Site
                </h2>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              O CatBytes é um projeto independente de desenvolvimento web e automação inteligente.
              Seu conteúdo tem fins informativos e educacionais, incluindo artigos, materiais autorais e projetos demonstrativos.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">💬</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  2. Conteúdo e Direitos Autorais
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Todo o conteúdo publicado — textos, imagens, logotipos e design — pertence à CatBytes, salvo indicação em contrário.
              </p>
              <p>
                É proibida a reprodução total ou parcial sem autorização expressa da autora.
              </p>
              <p>
                Citações são permitidas desde que com crédito e link para o conteúdo original.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">✉️</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  3. Newsletter e Formulários
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Ao cadastrar seu e-mail em nossa newsletter ou formulários, você autoriza o recebimento de comunicações relacionadas a tecnologia, automação e novidades da CatBytes.
              </p>
              <p>
                Você pode cancelar a inscrição a qualquer momento por meio do link disponível nos e-mails enviados.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🔒</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  4. Privacidade e Dados
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Os dados coletados são utilizados exclusivamente para fins de comunicação e melhoria de experiência no site.
              </p>
              <p>
                Não compartilhamos informações pessoais com terceiros.
              </p>
              <p>
                Mais detalhes podem ser encontrados em nossa <a href="/pt-BR/politicas-de-privacidade" className="text-catbytes-purple dark:text-catbytes-pink hover:underline font-semibold">Política de Privacidade</a>.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">⚙️</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. Ferramentas e Integrações
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                O site pode utilizar ferramentas de terceiros, como Google Analytics, plataformas de hospedagem, APIs de IA e serviços de e-mail.
              </p>
              <p>
                Essas ferramentas podem coletar cookies ou dados técnicos, conforme suas próprias políticas.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🚫</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  6. Limitação de Responsabilidade
                </h2>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              O CatBytes não se responsabiliza por eventuais danos decorrentes do uso indevido das informações publicadas, interrupções de serviço, falhas técnicas ou links externos.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">📅</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  7. Alterações
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Os presentes Termos podem ser atualizados periodicamente sem aviso prévio.
              </p>
              <p>
                A data da última atualização será sempre indicada nesta página.
              </p>
            </div>
          </section>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Última atualização</p>
                  <p>Novembro de 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Responsável</p>
                  <p>Izadora Cury Pierette – CatBytes</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <Mail className="w-5 h-5 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Contato</p>
                  <a href="mailto:contato@catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">
                    contato@catbytes.site
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
