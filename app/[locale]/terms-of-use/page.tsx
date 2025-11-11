import { Metadata } from 'next'
import { Scale, Mail, Shield, FileText, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'termsOfUse' })
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    keywords: 'terms of use, legal, privacy, catbytes, web development',
    robots: 'index, follow',
    alternates: {
      canonical: `https://catbytes.site/${locale}/terms-of-use`,
      languages: {
        'pt-BR': 'https://catbytes.site/pt-BR/termos-de-uso',
        'en-US': 'https://catbytes.site/en-US/terms-of-use',
      },
    },
    openGraph: {
      title: t('metadata.title'),
      description: t('metadata.description'),
      url: `https://catbytes.site/${locale}/terms-of-use`,
      siteName: 'CatBytes',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function TermsOfUsePage({ params }: Props) {
  const { locale } = await params
  const isEnglish = locale === 'en-US'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-catbytes-purple to-catbytes-pink rounded-2xl mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent mb-4">
            {isEnglish ? 'Terms of Use' : 'Termos de Uso'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isEnglish ? (
              <>Welcome to CatBytes (<a href="https://catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">https://catbytes.site</a>).</>
            ) : (
              <>Bem-vindo(a) ao site CatBytes (<a href="https://catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">https://catbytes.site</a>).</>
            )}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEnglish 
              ? 'By accessing this website, you agree to the terms and conditions below. If you do not agree, we recommend that you do not continue browsing.'
              : 'Ao acessar este site, você concorda com os termos e condições abaixo. Caso não concorde, recomendamos que não continue a navegação.'
            }
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
                  {isEnglish ? '1. Website Purpose' : '1. Finalidade do Site'}
                </h2>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {isEnglish
                ? 'CatBytes is an independent web development and intelligent automation project. Its content is for informational and educational purposes, including articles, original materials, and demonstration projects.'
                : 'O CatBytes é um projeto independente de desenvolvimento web e automação inteligente. Seu conteúdo tem fins informativos e educacionais, incluindo artigos, materiais autorais e projetos demonstrativos.'
              }
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">💬</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEnglish ? '2. Content and Copyright' : '2. Conteúdo e Direitos Autorais'}
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                {isEnglish
                  ? 'All published content — texts, images, logos, and design — belongs to CatBytes, unless otherwise indicated.'
                  : 'Todo o conteúdo publicado — textos, imagens, logotipos e design — pertence à CatBytes, salvo indicação em contrário.'
                }
              </p>
              <p>
                {isEnglish
                  ? 'Total or partial reproduction is prohibited without express authorization from the author.'
                  : 'É proibida a reprodução total ou parcial sem autorização expressa da autora.'
                }
              </p>
              <p>
                {isEnglish
                  ? 'Citations are allowed as long as they include credit and a link to the original content.'
                  : 'Citações são permitidas desde que com crédito e link para o conteúdo original.'
                }
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">✉️</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEnglish ? '3. Newsletter and Forms' : '3. Newsletter e Formulários'}
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                {isEnglish
                  ? 'By registering your email on our newsletter or forms, you authorize receiving communications related to technology, automation, and CatBytes news.'
                  : 'Ao cadastrar seu e-mail em nossa newsletter ou formulários, você autoriza o recebimento de comunicações relacionadas a tecnologia, automação e novidades da CatBytes.'
                }
              </p>
              <p>
                {isEnglish
                  ? 'You can unsubscribe at any time through the link available in the emails sent.'
                  : 'Você pode cancelar a inscrição a qualquer momento por meio do link disponível nos e-mails enviados.'
                }
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🔒</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEnglish ? '4. Privacy and Data' : '4. Privacidade e Dados'}
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                {isEnglish
                  ? 'The data collected is used exclusively for communication purposes and to improve the website experience.'
                  : 'Os dados coletados são utilizados exclusivamente para fins de comunicação e melhoria de experiência no site.'
                }
              </p>
              <p>
                {isEnglish
                  ? 'We do not share personal information with third parties.'
                  : 'Não compartilhamos informações pessoais com terceiros.'
                }
              </p>
              <p>
                {isEnglish ? (
                  <>More details can be found in our <a href={`/${locale}/privacy-policy`} className="text-catbytes-purple dark:text-catbytes-pink hover:underline font-semibold">Privacy Policy</a>.</>
                ) : (
                  <>Mais detalhes podem ser encontrados em nossa <a href={`/${locale}/politicas-de-privacidade`} className="text-catbytes-purple dark:text-catbytes-pink hover:underline font-semibold">Política de Privacidade</a>.</>
                )}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">⚙️</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEnglish ? '5. Tools and Integrations' : '5. Ferramentas e Integrações'}
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                {isEnglish
                  ? 'The website may use third-party tools, such as Google Analytics, hosting platforms, AI APIs, and email services.'
                  : 'O site pode utilizar ferramentas de terceiros, como Google Analytics, plataformas de hospedagem, APIs de IA e serviços de e-mail.'
                }
              </p>
              <p>
                {isEnglish
                  ? 'These tools may collect cookies or technical data, according to their own policies.'
                  : 'Essas ferramentas podem coletar cookies ou dados técnicos, conforme suas próprias políticas.'
                }
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">🚫</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEnglish ? '6. Limitation of Liability' : '6. Limitação de Responsabilidade'}
                </h2>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {isEnglish
                ? 'CatBytes is not responsible for any damages resulting from misuse of published information, service interruptions, technical failures, or external links.'
                : 'O CatBytes não se responsabiliza por eventuais danos decorrentes do uso indevido das informações publicadas, interrupções de serviço, falhas técnicas ou links externos.'
              }
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">📅</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEnglish ? '7. Changes' : '7. Alterações'}
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                {isEnglish
                  ? 'These Terms may be updated periodically without prior notice.'
                  : 'Os presentes Termos podem ser atualizados periodicamente sem aviso prévio.'
                }
              </p>
              <p>
                {isEnglish
                  ? 'The date of the last update will always be indicated on this page.'
                  : 'A data da última atualização será sempre indicada nesta página.'
                }
              </p>
            </div>
          </section>

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {isEnglish ? 'Last Updated' : 'Última atualização'}
                  </p>
                  <p>{isEnglish ? 'November 2025' : 'Novembro de 2025'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {isEnglish ? 'Responsible' : 'Responsável'}
                  </p>
                  <p>Izadora Cury Pierette – CatBytes</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <Mail className="w-5 h-5 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    {isEnglish ? 'Contact' : 'Contato'}
                  </p>
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
