'use client'

/**
 * Componente de conteúdo SEO otimizado para a homepage
 * Inclui texto rico com keywords para melhorar indexação do Google
 * Invisível visualmente mas 100% rastreável por search engines
 */
export function SEOContent() {
  return (
    <>
      {/* SEO Content - Hidden but crawlable */}
      <div className="sr-only" aria-hidden="true">
        {/* Este conteúdo é invisível visualmente mas lido pelo Google */}
        <h1>CatBytes - Portfólio de Izadora Cury Pierette | Desenvolvimento Web, React, Next.js e IA</h1>
        
        <article>
          <h2>O que é CatBytes?</h2>
          <p>
            CatBytes é o portfólio profissional de Izadora Cury Pierette, desenvolvedora 
            full-stack especializada em React, Next.js, TypeScript e soluções com 
            inteligência artificial. Com sede no Brasil, CatBytes apresenta projetos 
            inovadores que combinam design moderno, código limpo e automação inteligente.
          </p>
          <p>
            Izadora Pierette é desenvolvedora front-end e back-end com expertise em 
            tecnologias web modernas, criando aplicações escaláveis e performáticas 
            para empresas e startups.
          </p>
        </article>

        <article>
          <h2>Especialidades e Tecnologias do CatBytes</h2>
          <p>
            Izadora Cury Pierette é especialista em desenvolvimento web moderno utilizando 
            as seguintes tecnologias:
          </p>
          <ul>
            <li>React e Next.js para aplicações web de alta performance</li>
            <li>TypeScript para código type-safe e manutenível</li>
            <li>Tailwind CSS para design responsivo e elegante</li>
            <li>Inteligência Artificial e automação com OpenAI e APIs modernas</li>
            <li>Desenvolvimento de chatbots e assistentes virtuais</li>
            <li>UI/UX design com foco em experiência do usuário</li>
            <li>Supabase, PostgreSQL e bancos de dados modernos</li>
            <li>Vercel, deployment e DevOps</li>
          </ul>
        </article>

        <article>
          <h2>Projetos em Destaque no CatBytes</h2>
          <p>
            No portfólio CatBytes você encontra projetos de desenvolvimento web que demonstram 
            expertise técnica e criatividade:
          </p>
          <ul>
            <li>Sistemas de blog com geração de conteúdo por inteligência artificial</li>
            <li>Dashboards administrativos com analytics em tempo real</li>
            <li>Automação de Instagram e gestão de redes sociais</li>
            <li>Aplicações web responsivas otimizadas para SEO</li>
            <li>Integrações com APIs e serviços de terceiros</li>
            <li>Chatbots inteligentes com processamento de linguagem natural</li>
          </ul>
        </article>

        <article>
          <h2>Por que escolher o CatBytes?</h2>
          <p>
            CatBytes representa qualidade e inovação no desenvolvimento web brasileiro. 
            Cada projeto é desenvolvido com atenção aos detalhes, seguindo as 
            melhores práticas de programação, design e acessibilidade.
          </p>
          <p>
            Izadora Cury Pierette traz uma abordagem única que combina conhecimento 
            técnico profundo com sensibilidade para design e experiência do usuário, 
            resultando em aplicações web que não apenas funcionam perfeitamente, 
            mas também encantam os usuários finais.
          </p>
          <p>
            O portfólio CatBytes demonstra capacidade de resolver problemas complexos
            com soluções elegantes e escaláveis, desde landing pages até sistemas
            empresariais completos.
          </p>
        </article>

        <article>
          <h2>Serviços de Desenvolvimento Web</h2>
          <ul>
            <li>Desenvolvimento de aplicações React e Next.js</li>
            <li>Criação de sites institucionais e landing pages</li>
            <li>E-commerce e plataformas de venda online</li>
            <li>Sistemas administrativos e dashboards</li>
            <li>Integração com APIs e automações</li>
            <li>Consultoria em tecnologias web modernas</li>
            <li>Otimização de performance e SEO</li>
          </ul>
        </article>

        <article>
          <h2>Contato e Redes Sociais</h2>
          <p>
            Conecte-se com Izadora Pierette através do CatBytes e acompanhe os 
            últimos projetos, artigos sobre desenvolvimento web, tutoriais de React, 
            Next.js, TypeScript e inteligência artificial.
          </p>
          <p>
            CatBytes está presente no GitHub, LinkedIn e outras plataformas profissionais,
            compartilhando conhecimento e colaborando com a comunidade de desenvolvedores.
          </p>
        </article>

        <footer>
          <p>
            <strong>CatBytes</strong> - Portfólio de Izadora Cury Pierette | 
            Desenvolvedora Full-Stack | React, Next.js, TypeScript e Inteligência Artificial | 
            Desenvolvimento Web Profissional | Brasil 2025
          </p>
          <p>
            Keywords: CatBytes, Izadora Cury Pierette, Izadora Pierette, desenvolvedor React,
            desenvolvedor Next.js, portfolio desenvolvedor, front-end developer, full-stack developer,
            desenvolvimento web, inteligência artificial, automação, chatbot, UI UX design
          </p>
        </footer>
      </div>

      {/* Structured Data JSON-LD adicional para a homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'CatBytes',
            alternateName: 'CatBytes - Izadora Pierette Portfolio',
            url: 'https://catbytes.site',
            logo: 'https://catbytes.site/images/og-1200x630-safe.webp',
            description: 'Desenvolvimento web profissional com React, Next.js, TypeScript e Inteligência Artificial',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'BR'
            },
            geo: {
              '@type': 'GeoCoordinates',
              addressCountry: 'BR'
            },
            founder: {
              '@type': 'Person',
              name: 'Izadora Cury Pierette'
            },
            serviceType: [
              'Web Development',
              'React Development',
              'Next.js Development',
              'AI Integration',
              'Chatbot Development',
              'UI/UX Design'
            ],
            areaServed: {
              '@type': 'Country',
              name: 'Brasil'
            }
          })
        }}
      />
    </>
  )
}
