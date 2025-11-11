import { Metadata } from 'next'
import { Shield, Database, Cookie, Mail, Lock, Eye, Globe, FileText, Calendar, Users, Heart, Lightbulb, Briefcase, MessageCircle, TrendingUp, CheckCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacyPolicy' })
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    keywords: 'privacy policy, data protection, LGPD, GDPR, catbytes, web development',
    robots: 'index, follow',
    alternates: {
      canonical: `https://catbytes.site/${locale}/privacy-policy`,
      languages: {
        'pt-BR': 'https://catbytes.site/pt-BR/politicas-de-privacidade',
        'en-US': 'https://catbytes.site/en-US/privacy-policy',
      },
    },
    openGraph: {
      title: t('metadata.title'),
      description: t('metadata.description'),
      url: `https://catbytes.site/${locale}/privacy-policy`,
      siteName: 'CatBytes',
      locale: locale,
      type: 'website',
    },
  }
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params
  const isEnglish = locale === 'en-US'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-catbytes-purple to-catbytes-pink rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent mb-4">
            {isEnglish ? 'CatBytes Policies' : 'Políticas da CatBytes'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isEnglish ? 'Transparency, culture, and data protection' : 'Transparência, cultura e proteção de dados'}
          </p>
        </div>

        {/* Company Culture Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🐾</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEnglish ? 'CatBytes Policy and Culture' : 'Política e Cultura da CatBytes'}
            </h2>
          </div>

          <div className="space-y-8">
            {/* Remote Work */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <Briefcase className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    💻 {isEnglish ? 'Remote and Flexible Work' : 'Trabalho Remoto e Flexível'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish ? 'CatBytes is a 100% remote company.' : 'A CatBytes é uma empresa 100% remota.'}</p>
                    <p>{isEnglish 
                      ? 'We value the freedom to work from anywhere, with flexible hours and a focus on results.'
                      : 'Valorizamos a liberdade de trabalhar de qualquer lugar, com horários flexíveis e foco em resultados.'
                    }</p>
                    <p>{isEnglish
                      ? 'Each person organizes their routine according to their rhythm and productivity, maintaining clear communication and well-defined deadlines.'
                      : 'Cada pessoa organiza sua rotina de acordo com seu ritmo e produtividade, mantendo comunicação clara e prazos bem definidos.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Autonomy */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ⚙️ {isEnglish ? 'Autonomy and Responsibility' : 'Autonomia e Responsabilidade'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish ? 'We trust those who are part of CatBytes.' : 'Confiamos em quem faz parte da CatBytes.'}</p>
                    <p>{isEnglish
                      ? 'Here, each collaborator has autonomy to propose solutions, experiment with new ideas, and take responsibility for their projects.'
                      : 'Aqui, cada colaborador tem autonomia para propor soluções, experimentar novas ideias e assumir responsabilidade sobre seus projetos.'
                    }</p>
                    <p>{isEnglish
                      ? 'Our focus is continuous learning and delivering real value.'
                      : 'Nosso foco é o aprendizado contínuo e a entrega de valor real.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Innovation */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🤖 {isEnglish ? 'Innovation and Technology' : 'Inovação e Tecnologia'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish
                      ? 'We live technology every day — AI, automation, and web development are part of our DNA.'
                      : 'Vivemos tecnologia todos os dias — IA, automações e desenvolvimento web fazem parte do nosso DNA.'
                    }</p>
                    <p>{isEnglish
                      ? 'We encourage the use of smart tools and the search for new ways to optimize processes, generate impact, and create high-level digital experiences.'
                      : 'Incentivamos o uso de ferramentas inteligentes e a busca por novas formas de otimizar processos, gerar impacto e criar experiências digitais de alto nível.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Growth */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🧠 {isEnglish ? 'Growth and Knowledge' : 'Crescimento e Conhecimento'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish
                      ? 'CatBytes believes that learning is part of the work.'
                      : 'A CatBytes acredita que aprender é parte do trabalho.'
                    }</p>
                    <p>{isEnglish
                      ? 'We support professional development through practical projects, constant exchanges, and community learning.'
                      : 'Apoiamos o desenvolvimento profissional por meio de projetos práticos, trocas constantes e aprendizado em comunidade.'
                    }</p>
                    <p>{isEnglish
                      ? 'Every idea is welcome, and each project is an opportunity to evolve.'
                      : 'Toda ideia é bem-vinda, e cada projeto é uma oportunidade de evoluir.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Communication */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    💬 {isEnglish ? 'Communication and Collaboration' : 'Comunicação e Colaboração'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish
                      ? 'We work in a collaborative environment, without rigid hierarchies.'
                      : 'Trabalhamos em um ambiente colaborativo, sem hierarquias rígidas.'
                    }</p>
                    <p>{isEnglish
                      ? 'We use modern tools for asynchronous communication, document processes, and maintain a transparent flow of information.'
                      : 'Usamos ferramentas modernas para comunicação assíncrona, documentamos processos e mantemos um fluxo transparente de informações.'
                    }</p>
                    <p>{isEnglish
                      ? 'We believe that empathy and clarity build strong teams.'
                      : 'Acreditamos que empatia e clareza constroem equipes fortes.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Well-being */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <Heart className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    ❤️ {isEnglish ? 'Balance and Well-being' : 'Equilíbrio e Bem-Estar'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish
                      ? 'We respect each person\'s time and space.'
                      : 'Respeitamos o tempo e o espaço de cada pessoa.'
                    }</p>
                    <p>{isEnglish
                      ? 'We value the balance between personal and professional life, and encourage breaks, rest, and self-care.'
                      : 'Valorizamos o equilíbrio entre vida pessoal e profissional, e incentivamos pausas, descanso e autocuidado.'
                    }</p>
                    <p>{isEnglish
                      ? 'Taking care of those who create is an essential part of what we do.'
                      : 'Cuidar de quem cria é parte essencial do que fazemos.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Diversity */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <Users className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    🌍 {isEnglish ? 'Diversity and Inclusion' : 'Diversidade e Inclusão'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish
                      ? 'At CatBytes, we believe that diversity drives innovation.'
                      : 'Na CatBytes, acreditamos que a diversidade impulsiona a inovação.'
                    }</p>
                    <p>{isEnglish
                      ? 'We value people from different backgrounds, experiences, and perspectives, ensuring a welcoming, inclusive environment free from discrimination.'
                      : 'Valorizamos pessoas de diferentes origens, experiências e perspectivas, garantindo um ambiente acolhedor, inclusivo e livre de discriminação.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ethics */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    📈 {isEnglish ? 'Ethics and Transparency' : 'Ética e Transparência'}
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>{isEnglish
                      ? 'We work with ethics, respect, and commitment.'
                      : 'Trabalhamos com ética, respeito e compromisso.'
                    }</p>
                    <p>{isEnglish
                      ? 'We value transparency in relationships with clients, partners, and collaborators — both in communication and in deliveries and contracts.'
                      : 'Prezamos pela transparência nas relações com clientes, parceiros e colaboradores — tanto em comunicação quanto em entregas e contratos.'
                    }</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Privacy Policy Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🛡️</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEnglish ? 'Privacy Policy – CatBytes' : 'Política de Privacidade – CatBytes'}
            </h2>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 italic">
            {isEnglish ? 'Last updated: November 2025' : 'Última atualização: Novembro de 2025'}
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {isEnglish ? (
              <>CatBytes values the privacy and protection of its visitors' personal data. This Policy explains how we collect, use, and protect information obtained through the website <a href="https://catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">https://catbytes.site</a>, the blog, and the newsletter.</>
            ) : (
              <>A CatBytes valoriza a privacidade e a proteção dos dados pessoais de seus visitantes. Esta Política explica como coletamos, utilizamos e protegemos as informações obtidas por meio do site <a href="https://catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">https://catbytes.site</a>, do blog e da newsletter.</>
            )}
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Database className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    📋 {isEnglish ? '1. Information We Collect' : '1. Informações que Coletamos'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {isEnglish
                      ? 'We collect only the data necessary for the website to function and to communicate with the public. This information may include:'
                      : 'Coletamos apenas os dados necessários para o funcionamento do site e a comunicação com o público. Essas informações podem incluir:'
                    }
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>{isEnglish ? 'Name and email (when subscribing to the newsletter or filling out forms);' : 'Nome e e-mail (ao assinar a newsletter ou preencher formulários);'}</li>
                    <li>{isEnglish ? 'Browsing data, such as IP address, browser, device, and time spent, through cookies and analytics tools (like Google Analytics);' : 'Dados de navegação, como endereço IP, navegador, dispositivo e tempo de permanência, por meio de cookies e ferramentas analíticas (como Google Analytics);'}</li>
                    <li>{isEnglish ? 'Messages sent voluntarily through the contact form or social media.' : 'Mensagens enviadas voluntariamente pelo formulário de contato ou redes sociais.'}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    💬 {isEnglish ? '2. How We Use Your Data' : '2. Como Utilizamos Seus Dados'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {isEnglish ? 'The collected data is used to:' : 'Os dados coletados são usados para:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>{isEnglish ? 'Send newsletters and communications about CatBytes content and news;' : 'Enviar newsletters e comunicações sobre conteúdo e novidades da CatBytes;'}</li>
                    <li>{isEnglish ? 'Improve the browsing experience on the website;' : 'Melhorar a experiência de navegação no site;'}</li>
                    <li>{isEnglish ? 'Personalize content and recommendations;' : 'Personalizar conteúdos e recomendações;'}</li>
                    <li>{isEnglish ? 'Maintain the security and integrity of the platform.' : 'Manter a segurança e integridade da plataforma.'}</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                    {isEnglish
                      ? 'CatBytes does not share, sell, or rent personal data to third parties, except when required by law.'
                      : 'A CatBytes não compartilha, vende ou aluga dados pessoais a terceiros, salvo quando exigido por lei.'
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Cookie className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    ⚙️ {isEnglish ? '3. Tools and Cookies' : '3. Ferramentas e Cookies'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {isEnglish
                      ? 'We use cookies and similar technologies to understand how the website is used and offer more efficient browsing. You can configure your browser to block cookies, but this may affect some functionalities.'
                      : 'Utilizamos cookies e tecnologias similares para entender como o site é usado e oferecer uma navegação mais eficiente. Você pode configurar seu navegador para bloquear cookies, mas isso pode afetar algumas funcionalidades.'
                    }
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {isEnglish ? 'Third-party tools that may operate on the site:' : 'Ferramentas de terceiros que podem operar no site:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>{isEnglish ? 'Google Analytics (traffic analysis);' : 'Google Analytics (análise de tráfego);'}</li>
                    <li>{isEnglish ? 'Newsletter platforms (email sending and automation);' : 'Plataformas de newsletter (envio de e-mails e automações);'}</li>
                    <li>{isEnglish ? 'Hosting and security services (Netlify, Supabase, etc.).' : 'Serviços de hospedagem e segurança (Netlify, Supabase, etc.).'}</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                    {isEnglish
                      ? 'These tools follow their own privacy policies.'
                      : 'Essas ferramentas seguem suas próprias políticas de privacidade.'
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Mail className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    ✉️ {isEnglish ? '4. Newsletter and Communication' : '4. Newsletter e Comunicação'}
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      {isEnglish
                        ? 'By subscribing to the newsletter, you authorize receiving occasional communications by email. Each email sent contains an automatic unsubscribe link.'
                        : 'Ao se inscrever na newsletter, você autoriza o envio de comunicações ocasionais por e-mail. Cada e-mail enviado contém um link de descadastramento automático.'
                      }
                    </p>
                    <p>
                      {isEnglish
                        ? 'CatBytes does not send spam or request sensitive information via email.'
                        : 'A CatBytes não envia spam nem solicita informações sensíveis por e-mail.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Lock className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    🔒 {isEnglish ? '5. Data Protection' : '5. Proteção dos Dados'}
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      {isEnglish
                        ? 'CatBytes adopts appropriate technical and organizational measures to protect personal data against unauthorized access, loss, or alteration.'
                        : 'A CatBytes adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, perda ou alteração.'
                      }
                    </p>
                    <p>
                      {isEnglish
                        ? 'Data is stored on secure servers, with access control and continuous monitoring.'
                        : 'Os dados são armazenados em servidores seguros, com controle de acesso e monitoramento contínuo.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    🧾 {isEnglish ? '6. Data Subject Rights (LGPD/GDPR)' : '6. Direitos do Titular (LGPD)'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {isEnglish ? 'You can, at any time:' : 'Você pode, a qualquer momento:'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>{isEnglish ? 'Request access to your data;' : 'Solicitar acesso aos seus dados;'}</li>
                    <li>{isEnglish ? 'Correct incorrect information;' : 'Corrigir informações incorretas;'}</li>
                    <li>{isEnglish ? 'Request deletion of your data;' : 'Solicitar a exclusão dos seus dados;'}</li>
                    <li>{isEnglish ? 'Revoke consent for communications.' : 'Revogar o consentimento para comunicações.'}</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                    {isEnglish ? (
                      <>These requests can be made by email: <a href="mailto:contato@catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">contato@catbytes.site</a>.</>
                    ) : (
                      <>Essas solicitações podem ser feitas pelo e-mail: <a href="mailto:contato@catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">contato@catbytes.site</a>.</>
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Globe className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    🌍 {isEnglish ? '7. External Links' : '7. Links Externos'}
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      {isEnglish
                        ? 'The CatBytes website may contain links to external websites. CatBytes is not responsible for the content or privacy policies of these sites and recommends that you read their policies before providing any personal data.'
                        : 'O site da CatBytes pode conter links para sites externos. A CatBytes não se responsabiliza pelo conteúdo ou políticas de privacidade desses sites, e recomenda que você leia as políticas deles antes de fornecer qualquer dado pessoal.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <FileText className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    🧠 {isEnglish ? '8. Changes to This Policy' : '8. Alterações desta Política'}
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      {isEnglish
                        ? 'CatBytes may update this Privacy Policy periodically. Whenever there are relevant changes, the date of the last update will be changed.'
                        : 'A CatBytes pode atualizar esta Política de Privacidade periodicamente. Sempre que houver mudanças relevantes, a data da última atualização será alterada.'
                      }
                    </p>
                    <p>
                      {isEnglish
                        ? 'We recommend reading this page from time to time.'
                        : 'Recomendamos a leitura desta página de tempos em tempos.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Mail className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    📫 {isEnglish ? '9. Contact' : '9. Contato'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    {isEnglish
                      ? 'For questions or requests about this Policy, please contact us:'
                      : 'Para dúvidas ou solicitações sobre esta Política, entre em contato:'
                    }
                  </p>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p>
                      📧 {isEnglish ? 'Email' : 'E-mail'}:{' '}
                      <a href="mailto:contato@catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline font-semibold">
                        contato@catbytes.site
                      </a>
                    </p>
                    <p>
                      🌐 {isEnglish ? 'Website' : 'Site'}:{' '}
                      <a href="https://catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline font-semibold">
                        https://catbytes.site
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
