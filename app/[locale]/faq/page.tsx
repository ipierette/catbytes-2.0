import { Metadata } from 'next'
import FAQClient from './faq-client'
import { BreadcrumbStructuredData } from '@/components/seo/breadcrumb-structured-data'

type Props = {
  params: Promise<{ locale: string }>
}

// FAQ data for structured data
const getFaqData = (locale: string) => {
  const isEnglish = locale === 'en-US'
  return isEnglish ? [
    { question: 'What is CatBytes?', answer: 'CatBytes is a fullstack web development and intelligent automation company. We create websites, platforms, and systems that combine modern design, AI, and technical performance for professionals and companies seeking real digital presence.' },
    { question: 'Do you work with ready-made or custom websites?', answer: 'All CatBytes projects are customized. Each client receives a website or system tailored to their niche, visual identity, and business objectives.' },
    { question: 'What is n8n automation?', answer: 'n8n automation is the process of connecting tools and platforms to execute automatic tasks without code. CatBytes uses n8n to create intelligent workflows for emails, social media, marketing, customer service, and AI integrations.' },
    { question: 'Does CatBytes use artificial intelligence in projects?', answer: 'Yes. CatBytes integrates generative AI (such as OpenAI and Gemini) into websites, blogs, and automations to generate content, respond to users, and optimize processes.' },
    { question: 'What technologies is the CatBytes website built with?', answer: 'Our projects use modern technologies such as React.js, Next.js, Node.js, Supabase, Tailwind, and integrations with external APIs. We always prioritize performance, accessibility, and security.' },
    { question: 'Does CatBytes serve clients outside Brazil?', answer: 'Yes. All our services are remote and can be contracted from anywhere. We work with companies and professionals in Brazil and abroad.' },
    { question: 'Is the website design responsive?', answer: 'Yes. All layouts are designed to adapt perfectly to different devices, ensuring a good experience on desktops, tablets, and mobile phones.' },
    { question: 'Can I hire just automation without a website?', answer: 'Yes. We also offer independent automation packages and workflows, such as email integration, WhatsApp, social media, and internal systems.' },
    { question: 'Does CatBytes offer support after delivery?', answer: 'Yes. Each project includes a period of technical support and guidance. We also offer continuous maintenance and update plans.' },
    { question: 'How can I request a quote?', answer: 'You can contact us through the website form or send an email to ipierette2@gmail.com. After understanding your needs, we will prepare a customized proposal.' }
  ] : [
    { question: 'O que é a CatBytes?', answer: 'A CatBytes é uma empresa de desenvolvimento web fullstack e automação inteligente. Criamos sites, plataformas e sistemas que unem design moderno, IA e performance técnica para profissionais e empresas que desejam presença digital real.' },
    { question: 'Vocês trabalham com sites prontos ou sob medida?', answer: 'Todos os projetos da CatBytes são personalizados. Cada cliente recebe um site ou sistema feito de acordo com seu nicho, identidade visual e objetivos de negócio.' },
    { question: 'O que é automação com n8n?', answer: 'Automação com n8n é o processo de conectar ferramentas e plataformas para executar tarefas automáticas sem precisar de código. A CatBytes utiliza o n8n para criar fluxos inteligentes de e-mails, redes sociais, marketing, atendimento e integrações com IA.' },
    { question: 'A CatBytes usa inteligência artificial nos projetos?', answer: 'Sim. A CatBytes integra IA generativa (como OpenAI e Gemini) em sites, blogs e automações, para gerar conteúdo, responder usuários e otimizar processos.' },
    { question: 'O site da CatBytes é feito com quais tecnologias?', answer: 'Nossos projetos utilizam tecnologias modernas como React.js, Next.js, Node.js, Supabase, Tailwind e integrações com APIs externas. Sempre priorizamos desempenho, acessibilidade e segurança.' },
    { question: 'A CatBytes atende clientes fora do Brasil?', answer: 'Sim. Todos os nossos serviços são remotos e podem ser contratados de qualquer lugar. Trabalhamos com empresas e profissionais no Brasil e no exterior.' },
    { question: 'O design dos sites é responsivo?', answer: 'Sim. Todos os layouts são projetados para se adaptar perfeitamente a diferentes dispositivos, garantindo boa experiência em desktops, tablets e celulares.' },
    { question: 'Posso contratar apenas automação sem site?', answer: 'Sim. Também oferecemos pacotes independentes de automação e workflows, como integração de e-mails, WhatsApp, redes sociais e sistemas internos.' },
    { question: 'A CatBytes oferece suporte após a entrega?', answer: 'Sim. Cada projeto inclui período de suporte técnico e orientações. Também oferecemos planos de manutenção e atualização contínua.' },
    { question: 'Como posso solicitar um orçamento?', answer: 'Você pode entrar em contato pelo formulário do site ou enviar e-mail para ipierette2@gmail.com. Após entender suas necessidades, elaboraremos uma proposta personalizada.' }
  ]
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
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
  const faqData = getFaqData(locale)
  
  const breadcrumbItems = [
    { name: 'Home', url: 'https://catbytes.site' },
    { name: 'FAQ', url: `https://catbytes.site/${locale}/faq` },
  ]
  
  // FAQPage structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  
  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQClient locale={locale} />
    </>
  )
}
