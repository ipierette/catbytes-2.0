import { Metadata } from 'next'
import { Shield, Database, Cookie, Mail, Lock, Eye, Globe, FileText, Calendar, Users, Heart, Lightbulb, Briefcase, MessageCircle, TrendingUp, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Políticas da CatBytes e Privacidade | CatBytes',
  description: 'Conheça a cultura, valores e política de privacidade da CatBytes. Transparência, inovação e respeito aos dados.',
}

export default function PoliticasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-catbytes-purple to-catbytes-pink rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent mb-4">
            Políticas da CatBytes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Transparência, cultura e proteção de dados
          </p>
        </div>

        {/* Company Culture Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Política e Cultura da CatBytes
            </h2>
          </div>

          <div className="space-y-8">
            {/* Remote Work */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <Briefcase className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Trabalho Remoto e Flexível
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>A CatBytes é uma empresa 100% remota.</p>
                    <p>Valorizamos a liberdade de trabalhar de qualquer lugar, com horários flexíveis e foco em resultados.</p>
                    <p>Cada pessoa organiza sua rotina de acordo com seu ritmo e produtividade, mantendo comunicação clara e prazos bem definidos.</p>
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
                    Autonomia e Responsabilidade
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Confiamos em quem faz parte da CatBytes.</p>
                    <p>Aqui, cada colaborador tem autonomia para propor soluções, experimentar novas ideias e assumir responsabilidade sobre seus projetos.</p>
                    <p>Nosso foco é o aprendizado contínuo e a entrega de valor real.</p>
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
                    Inovação e Tecnologia
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Vivemos tecnologia todos os dias — IA, automações e desenvolvimento web fazem parte do nosso DNA.</p>
                    <p>Incentivamos o uso de ferramentas inteligentes e a busca por novas formas de otimizar processos, gerar impacto e criar experiências digitais de alto nível.</p>
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
                    Crescimento e Conhecimento
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>A CatBytes acredita que aprender é parte do trabalho.</p>
                    <p>Apoiamos o desenvolvimento profissional por meio de projetos práticos, trocas constantes e aprendizado em comunidade.</p>
                    <p>Toda ideia é bem-vinda, e cada projeto é uma oportunidade de evoluir.</p>
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
                    Comunicação e Colaboração
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Trabalhamos em um ambiente colaborativo, sem hierarquias rígidas.</p>
                    <p>Usamos ferramentas modernas para comunicação assíncrona, documentamos processos e mantemos um fluxo transparente de informações.</p>
                    <p>Acreditamos que empatia e clareza constroem equipes fortes.</p>
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
                    Equilíbrio e Bem-Estar
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Respeitamos o tempo e o espaço de cada pessoa.</p>
                    <p>Valorizamos o equilíbrio entre vida pessoal e profissional, e incentivamos pausas, descanso e autocuidado.</p>
                    <p>Cuidar de quem cria é parte essencial do que fazemos.</p>
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
                    Diversidade e Inclusão
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Na CatBytes, acreditamos que a diversidade impulsiona a inovação.</p>
                    <p>Valorizamos pessoas de diferentes origens, experiências e perspectivas, garantindo um ambiente acolhedor, inclusivo e livre de discriminação.</p>
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
                    Ética e Transparência
                  </h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>Trabalhamos com ética, respeito e compromisso.</p>
                    <p>Prezamos pela transparência nas relações com clientes, parceiros e colaboradores — tanto em comunicação quanto em entregas e contratos.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Privacy Policy Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Política de Privacidade – CatBytes
            </h2>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 italic">
            Última atualização: Novembro de 2025
          </p>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            A CatBytes valoriza a privacidade e a proteção dos dados pessoais de seus visitantes.
            Esta Política explica como coletamos, utilizamos e protegemos as informações obtidas por meio do site{' '}
            <a href="https://catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">https://catbytes.site</a>, do blog e da newsletter.
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Database className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    1. Informações que Coletamos
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Coletamos apenas os dados necessários para o funcionamento do site e a comunicação com o público.
                    Essas informações podem incluir:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Nome e e-mail (ao assinar a newsletter ou preencher formulários);</li>
                    <li>Dados de navegação, como endereço IP, navegador, dispositivo e tempo de permanência, por meio de cookies e ferramentas analíticas (como Google Analytics);</li>
                    <li>Mensagens enviadas voluntariamente pelo formulário de contato ou redes sociais.</li>
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
                    2. Como Utilizamos Seus Dados
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Os dados coletados são usados para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Enviar newsletters e comunicações sobre conteúdo e novidades da CatBytes;</li>
                    <li>Melhorar a experiência de navegação no site;</li>
                    <li>Personalizar conteúdos e recomendações;</li>
                    <li>Manter a segurança e integridade da plataforma.</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                    A CatBytes não compartilha, vende ou aluga dados pessoais a terceiros, salvo quando exigido por lei.
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
                    3. Ferramentas e Cookies
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Utilizamos cookies e tecnologias similares para entender como o site é usado e oferecer uma navegação mais eficiente.
                    Você pode configurar seu navegador para bloquear cookies, mas isso pode afetar algumas funcionalidades.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Ferramentas de terceiros que podem operar no site:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Google Analytics (análise de tráfego);</li>
                    <li>Plataformas de newsletter (envio de e-mails e automações);</li>
                    <li>Serviços de hospedagem e segurança (Netlify, Supabase, etc.).</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                    Essas ferramentas seguem suas próprias políticas de privacidade.
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
                    4. Newsletter e Comunicação
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Ao se inscrever na newsletter, você autoriza o envio de comunicações ocasionais por e-mail.
                      Cada e-mail enviado contém um link de descadastramento automático.
                    </p>
                    <p>
                      A CatBytes não envia spam nem solicita informações sensíveis por e-mail.
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
                    5. Proteção dos Dados
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      A CatBytes adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, perda ou alteração.
                    </p>
                    <p>
                      Os dados são armazenados em servidores seguros, com controle de acesso e monitoramento contínuo.
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
                    6. Direitos do Titular (LGPD)
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Você pode, a qualquer momento:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Solicitar acesso aos seus dados;</li>
                    <li>Corrigir informações incorretas;</li>
                    <li>Solicitar a exclusão dos seus dados;</li>
                    <li>Revogar o consentimento para comunicações.</li>
                  </ul>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                    Essas solicitações podem ser feitas pelo e-mail:{' '}
                    <a href="mailto:contato@catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline">
                      contato@catbytes.site
                    </a>.
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
                    7. Links Externos
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      O site da CatBytes pode conter links para sites externos.
                      A CatBytes não se responsabiliza pelo conteúdo ou políticas de privacidade desses sites, e recomenda que você leia as políticas deles antes de fornecer qualquer dado pessoal.
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
                    8. Alterações desta Política
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      A CatBytes pode atualizar esta Política de Privacidade periodicamente.
                      Sempre que houver mudanças relevantes, a data da última atualização será alterada.
                    </p>
                    <p>
                      Recomendamos a leitura desta página de tempos em tempos.
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
                    9. Contato
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    Para dúvidas ou solicitações sobre esta Política, entre em contato:
                  </p>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p>
                      E-mail:{' '}
                      <a href="mailto:contato@catbytes.site" className="text-catbytes-purple dark:text-catbytes-pink hover:underline font-semibold">
                        contato@catbytes.site
                      </a>
                    </p>
                    <p>
                      Site:{' '}
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
