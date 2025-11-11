'use client'

import { ChevronDown, Mail, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

interface FAQClientProps {
  locale: string
}

export default function FAQClient({ locale }: FAQClientProps) {
  const isEnglish = locale === 'en-US'
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqData = isEnglish ? {
    title: 'FAQ',
    subtitle: 'Frequently Asked Questions',
    description: 'Find quick answers to common questions about CatBytes services and technologies',
    contactTitle: 'Still have questions?',
    contactText: 'Feel free to reach out!',
    contactButton: 'Contact Us',
    questions: [
      {
        q: 'What is CatBytes?',
        a: 'CatBytes is a fullstack web development and intelligent automation company. We create websites, platforms, and systems that combine modern design, AI, and technical performance for professionals and companies seeking real digital presence.'
      },
      {
        q: 'Do you work with ready-made or custom websites?',
        a: 'All CatBytes projects are customized. Each client receives a website or system tailored to their niche, visual identity, and business objectives.'
      },
      {
        q: 'What is n8n automation?',
        a: 'n8n automation is the process of connecting tools and platforms to execute automatic tasks without code. CatBytes uses n8n to create intelligent workflows for emails, social media, marketing, customer service, and AI integrations.'
      },
      {
        q: 'Does CatBytes use artificial intelligence in projects?',
        a: 'Yes. CatBytes integrates generative AI (such as OpenAI and Gemini) into websites, blogs, and automations to generate content, respond to users, and optimize processes.'
      },
      {
        q: 'What technologies is the CatBytes website built with?',
        a: 'Our projects use modern technologies such as React.js, Next.js, Node.js, Supabase, Tailwind, and integrations with external APIs. We always prioritize performance, accessibility, and security.'
      },
      {
        q: 'Does CatBytes serve clients outside Brazil?',
        a: 'Yes. All our services are remote and can be contracted from anywhere. We work with companies and professionals in Brazil and abroad.'
      },
      {
        q: 'Is the website design responsive?',
        a: 'Yes. All layouts are designed to adapt perfectly to different devices, ensuring a good experience on desktops, tablets, and mobile phones.'
      },
      {
        q: 'Can I hire just automation without a website?',
        a: 'Yes. We also offer independent automation packages and workflows, such as email integration, WhatsApp, social media, and internal systems.'
      },
      {
        q: 'Does CatBytes offer support after delivery?',
        a: 'Yes. Each project includes a period of technical support and guidance. We also offer continuous maintenance and update plans.'
      },
      {
        q: 'How can I request a quote?',
        a: 'You can contact us through the website form or send an email to ipierette2@gmail.com. After understanding your needs, we will prepare a customized proposal.'
      }
    ]
  } : {
    title: 'FAQ',
    subtitle: 'Perguntas Frequentes',
    description: 'Encontre respostas rápidas para dúvidas comuns sobre os serviços e tecnologias da CatBytes',
    contactTitle: 'Ainda tem dúvidas?',
    contactText: 'Entre em contato conosco!',
    contactButton: 'Fale Conosco',
    questions: [
      {
        q: 'O que é a CatBytes?',
        a: 'A CatBytes é uma empresa de desenvolvimento web fullstack e automação inteligente. Criamos sites, plataformas e sistemas que unem design moderno, IA e performance técnica para profissionais e empresas que desejam presença digital real.'
      },
      {
        q: 'Vocês trabalham com sites prontos ou sob medida?',
        a: 'Todos os projetos da CatBytes são personalizados. Cada cliente recebe um site ou sistema feito de acordo com seu nicho, identidade visual e objetivos de negócio.'
      },
      {
        q: 'O que é automação com n8n?',
        a: 'Automação com n8n é o processo de conectar ferramentas e plataformas para executar tarefas automáticas sem precisar de código. A CatBytes utiliza o n8n para criar fluxos inteligentes de e-mails, redes sociais, marketing, atendimento e integrações com IA.'
      },
      {
        q: 'A CatBytes usa inteligência artificial nos projetos?',
        a: 'Sim. A CatBytes integra IA generativa (como OpenAI e Gemini) em sites, blogs e automações, para gerar conteúdo, responder usuários e otimizar processos.'
      },
      {
        q: 'O site da CatBytes é feito com quais tecnologias?',
        a: 'Nossos projetos utilizam tecnologias modernas como React.js, Next.js, Node.js, Supabase, Tailwind e integrações com APIs externas. Sempre priorizamos desempenho, acessibilidade e segurança.'
      },
      {
        q: 'A CatBytes atende clientes fora do Brasil?',
        a: 'Sim. Todos os nossos serviços são remotos e podem ser contratados de qualquer lugar. Trabalhamos com empresas e profissionais no Brasil e no exterior.'
      },
      {
        q: 'O design dos sites é responsivo?',
        a: 'Sim. Todos os layouts são projetados para se adaptar perfeitamente a diferentes dispositivos, garantindo boa experiência em desktops, tablets e celulares.'
      },
      {
        q: 'Posso contratar apenas uma automação, sem um site?',
        a: 'Sim. Também oferecemos pacotes e fluxos de automação independentes, como integração de e-mail, WhatsApp, redes sociais e sistemas internos.'
      },
      {
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
        {/* Hero Section with Cat Image */}
        <div className="relative mb-16">
          {/* Background decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-catbytes-purple/10 dark:bg-catbytes-purple/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-catbytes-pink/10 dark:bg-catbytes-pink/5 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center mb-8">
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

          {/* Cat Image as Hero */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Glow effect behind cat */}
              <div className="absolute inset-0 bg-gradient-to-r from-catbytes-purple via-catbytes-pink to-catbytes-blue opacity-20 dark:opacity-30 blur-2xl scale-110 rounded-full"></div>
              
              {/* Cat image */}
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <Image
                  src="/images/gatinho-faq.png"
                  alt={isEnglish ? 'FAQ Cat mascot' : 'Gatinho mascote do FAQ'}
                  fill
                  className="object-contain drop-shadow-2xl animate-float"
                  priority
                />
              </div>

              {/* Floating question marks decoration */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-catbytes-purple/20 dark:bg-catbytes-purple/30 rounded-full flex items-center justify-center animate-bounce-slow">
                <HelpCircle className="w-6 h-6 text-catbytes-purple dark:text-catbytes-pink" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-catbytes-pink/20 dark:bg-catbytes-pink/30 rounded-full flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                <HelpCircle className="w-8 h-8 text-catbytes-pink dark:text-catbytes-purple" />
              </div>
            </div>
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
