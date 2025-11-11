import { Metadata } from 'next'
import FAQClient from './faq-client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en-US'
  
  return {
    title: isEnglish ? 'FAQ - Frequently Asked Questions | CatBytes' : 'FAQ - Perguntas Frequentes | CatBytes',
    description: isEnglish 
      ? 'Find answers to common questions about CatBytes services, technologies, automation with n8n, AI integration, and web development. Professional support and custom solutions.'
      : 'Encontre respostas para dúvidas comuns sobre os serviços da CatBytes, tecnologias, automação com n8n, integração de IA e desenvolvimento web. Suporte profissional e soluções personalizadas.',
    keywords: 'FAQ, frequently asked questions, CatBytes, web development, n8n automation, AI integration, perguntas frequentes, desenvolvimento web, automação, inteligência artificial',
    robots: 'index, follow',
    alternates: {
      canonical: `https://catbytes.site/${locale}/faq`,
      languages: {
        'pt-BR': 'https://catbytes.site/pt-BR/faq',
        'en-US': 'https://catbytes.site/en-US/faq',
      },
    },
    openGraph: {
      title: isEnglish ? 'FAQ - Frequently Asked Questions | CatBytes' : 'FAQ - Perguntas Frequentes | CatBytes',
      description: isEnglish 
        ? 'Find answers to common questions about CatBytes services and technologies'
        : 'Encontre respostas para dúvidas comuns sobre os serviços e tecnologias da CatBytes',
      url: `https://catbytes.site/${locale}/faq`,
      siteName: 'CatBytes',
      locale: locale,
      type: 'website',
      images: [
        {
          url: 'https://catbytes.site/images/gatinho-faq.png',
          width: 800,
          height: 800,
          alt: isEnglish ? 'CatBytes FAQ' : 'FAQ CatBytes',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isEnglish ? 'FAQ - Frequently Asked Questions | CatBytes' : 'FAQ - Perguntas Frequentes | CatBytes',
      description: isEnglish 
        ? 'Find answers to common questions about CatBytes services and technologies'
        : 'Encontre respostas para dúvidas comuns sobre os serviços e tecnologias da CatBytes',
      images: ['https://catbytes.site/images/gatinho-faq.png'],
    },
  }
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params
  return <FAQClient locale={locale} />
}

        q: 'A CatBytes oferece suporte após a entrega?',
        a: 'Sim. Cada projeto inclui um período de suporte técnico e orientação. Também oferecemos planos de manutenção e atualização contínua.'
      },
      {
        q: 'Como posso solicitar um orçamento?',
        a: 'Você pode entrar em contato pelo formulário do site ou enviar um e-mail para ipierette2@gmail.com. Após entender suas necessidades, elaboramos uma proposta personalizada.'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-catbytes-purple to-catbytes-pink rounded-2xl mb-6 shadow-lg">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-comfortaa font-bold bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue bg-clip-text text-transparent mb-4">
            {faqData.title}
          </h1>
          <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {faqData.subtitle}
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {faqData.description}
          </p>
        </div>

        {/* FAQ Image */}
        <div className="flex justify-center mb-12">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src="/images/gatinho-faq.png"
              alt={isEnglish ? 'FAQ Cat mascot' : 'Gatinho mascote do FAQ'}
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-16">
          {faqData.questions.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-catbytes-purple dark:focus:ring-catbytes-pink focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-catbytes-purple dark:text-catbytes-pink flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                id={`faq-answer-${index}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                aria-hidden={openIndex !== index}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            {faqData.contactTitle}
          </h2>
          <p className="text-white/90 text-lg mb-6">
            {faqData.contactText}
          </p>
          <a
            href={`/${locale}/#contact`}
            className="inline-flex items-center gap-2 bg-white text-catbytes-purple px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
          >
            <Mail className="w-5 h-5" />
            {faqData.contactButton}
          </a>
        </div>

        {/* Schema.org FAQ Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqData.questions.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.a
                }
              }))
            })
          }}
        />
      </div>
    </div>
  )
}
