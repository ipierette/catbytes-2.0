import { NextRequest, NextResponse } from 'next/server'

type TemplateType = 'traditional' | 'visual-duo' | 'editorial' | 'final-emphasis'

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json()

    if (!theme) {
      return NextResponse.json(
        { error: 'Tema é obrigatório' },
        { status: 400 }
      )
    }

    // Gerar conteúdo mais relevante e útil baseado no tema
    const generatedContent = generateContentForTheme(theme)

    return NextResponse.json(generatedContent)
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo com IA' },
      { status: 500 }
    )
  }
}

function generateContentForTheme(theme: string) {
  const themeL = theme.toLowerCase()
  
  // Temas de tecnologia e programação
  if (themeL.includes('react') || themeL.includes('next') || themeL.includes('javascript') || themeL.includes('typescript')) {
    return {
      title: `Dominando ${theme}: Guia Completo de Boas Práticas 2025`,
      excerpt: `Aprenda as técnicas avançadas e padrões essenciais de ${theme} que todo desenvolvedor precisa conhecer. Da teoria à prática com exemplos reais.`,
      content: `
        <h2>🚀 Por que ${theme} é Essencial em 2025?</h2>
        <p>
          O ecossistema de ${theme} evoluiu drasticamente nos últimos anos. Neste guia, você vai descobrir:
        </p>
        <ul>
          <li><strong>Performance:</strong> Otimizações que fazem diferença real</li>
          <li><strong>Arquitetura:</strong> Padrões escaláveis e manuteníveis</li>
          <li><strong>Ferramentas:</strong> O stack moderno que aumenta produtividade</li>
        </ul>

        <h2>💡 Conceitos Fundamentais</h2>
        <p>
          Antes de mergulhar em técnicas avançadas, é crucial entender os fundamentos sólidos.
          ${theme} oferece recursos poderosos que, quando bem utilizados, transformam a qualidade do código.
        </p>

        <h2>🛠️ Boas Práticas Essenciais</h2>
        <p>
          Desenvolvedores experientes seguem princípios testados em produção. Aqui estão as 
          práticas que fazem a diferença entre código amador e profissional.
        </p>

        <h2>🎯 Aplicação Prática</h2>
        <p>
          Teoria sem prática não vale nada. Vamos implementar um exemplo real que demonstra
          todos os conceitos discutidos, do setup inicial ao deploy em produção.
        </p>

        <h2>✅ Conclusão e Próximos Passos</h2>
        <p>
          Dominar ${theme} exige prática constante e atualização contínua. Continue explorando,
          experimentando e contribuindo com a comunidade.
        </p>
      `,
      tags: [theme, 'Desenvolvimento Web', 'Programação', 'Tutorial', 'Boas Práticas'],
      suggestedTemplate: 'traditional' as TemplateType,
      templateJustification: '📝 Template Tradicional: Ideal para tutoriais técnicos com foco em aprendizado progressivo.'
    }
  }

  // Temas de IA e Machine Learning
  if (themeL.includes('ia') || themeL.includes('ai') || themeL.includes('inteligência artificial') || themeL.includes('machine learning') || themeL.includes('gpt')) {
    return {
      title: `${theme} na Prática: Como Implementar em Projetos Reais`,
      excerpt: `Descubra como integrar ${theme} em aplicações do mundo real, desde conceitos básicos até implementações avançadas que geram valor real.`,
      content: `
        <h2>🤖 A Revolução da ${theme}</h2>
        <p>
          A ${theme} deixou de ser ficção científica e tornou-se ferramenta essencial no desenvolvimento moderno.
          Este guia mostra como aplicar na prática, não apenas teoria.
        </p>

        <h2>📊 Casos de Uso Reais</h2>
        <p>
          Empresas de todos os tamanhos estão obtendo resultados impressionantes:
        </p>
        <ul>
          <li><strong>Automação:</strong> Processos que antes levavam horas agora são instantâneos</li>
          <li><strong>Análise de Dados:</strong> Insights que eram impossíveis de detectar manualmente</li>
          <li><strong>Experiência do Usuário:</strong> Personalização em escala antes inimaginável</li>
        </ul>

        <h2>🔧 Implementação Passo a Passo</h2>
        <p>
          Vamos do zero ao deploy de uma solução completa de ${theme}. Você vai aprender
          as ferramentas, bibliotecas e técnicas usadas em produção.
        </p>

        <h2>⚠️ Desafios e Soluções</h2>
        <p>
          Nem tudo são flores. Discutimos os principais obstáculos e como superá-los,
          economizando meses de tentativa e erro.
        </p>

        <h2>🚀 Próximo Nível</h2>
        <p>
          Com os fundamentos dominados, explore aplicações avançadas e tendências emergentes
          que vão moldar o futuro da ${theme}.
        </p>
      `,
      tags: [theme, 'Inteligência Artificial', 'Tecnologia', 'Inovação', 'Tutorial Prático'],
      suggestedTemplate: 'visual-duo' as TemplateType,
      templateJustification: '🎨 Template Visual Duplo: Perfeito para comparar antes/depois de implementações de IA.'
    }
  }

  // Temas de design e UX
  if (themeL.includes('design') || themeL.includes('ux') || themeL.includes('ui') || themeL.includes('interface')) {
    return {
      title: `${theme}: Princípios que Transformam Experiências Digitais`,
      excerpt: `Explore os fundamentos de ${theme} que separam produtos medianos de experiências extraordinárias. Teoria aplicada com exemplos visuais.`,
      content: `
        <h2>🎨 A Arte e Ciência do ${theme}</h2>
        <p>
          Design não é apenas estética - é psicologia, usabilidade e estratégia combinadas.
          Descubra como criar interfaces que usuários amam usar.
        </p>

        <h2>📐 Princípios Fundamentais</h2>
        <p>
          Existem leis universais do ${theme} que funcionam em qualquer contexto:
        </p>
        <ul>
          <li><strong>Hierarquia Visual:</strong> Guie o olhar do usuário naturalmente</li>
          <li><strong>Consistência:</strong> Reduza carga cognitiva com padrões</li>
          <li><strong>Feedback:</strong> Toda ação merece uma reação visível</li>
        </ul>

        <h2>💎 Cases de Sucesso</h2>
        <p>
          Analisamos produtos icônicos e extraímos lições práticas que você pode
          aplicar imediatamente em seus projetos.
        </p>

        <h2>🛠️ Ferramentas e Workflow</h2>
        <p>
          Do conceito ao protótipo, passando por testes com usuários. O processo completo
          que designers profissionais usam diariamente.
        </p>

        <h2>🎯 Conclusão</h2>
        <p>
          Excelência em ${theme} é jornada contínua. Continue praticando, testando
          e iterando para criar experiências cada vez melhores.
        </p>
      `,
      tags: [theme, 'Design', 'UX/UI', 'Experiência do Usuário', 'Interface'],
      suggestedTemplate: 'editorial' as TemplateType,
      templateJustification: '📖 Template Editorial: Sofisticado e visual, perfeito para conteúdo de design.'
    }
  }

  // Temas de negócios e produtividade
  if (themeL.includes('produtividade') || themeL.includes('negócio') || themeL.includes('startup') || themeL.includes('gestão')) {
    return {
      title: `${theme}: Estratégias Comprovadas para Resultados Exponenciais`,
      excerpt: `Técnicas validadas por profissionais de sucesso para multiplicar resultados em ${theme}. Práticas que funcionam no mundo real.`,
      content: `
        <h2>💼 O Cenário Atual de ${theme}</h2>
        <p>
          O mundo mudou e as estratégias tradicionais não funcionam mais. Descubra
          o que realmente funciona em ${theme} em 2025.
        </p>

        <h2>📈 Métricas que Importam</h2>
        <p>
          Pare de medir vaidades e foque no que gera impacto real:
        </p>
        <ul>
          <li><strong>ROI Mensurável:</strong> Como calcular e otimizar retorno</li>
          <li><strong>Velocidade de Execução:</strong> Mova-se rápido sem quebrar tudo</li>
          <li><strong>Escalabilidade:</strong> Cresça sem perder qualidade</li>
        </ul>

        <h2>🎯 Framework de Implementação</h2>
        <p>
          Metodologia testada em dezenas de empresas, desde startups até corporações.
          Adaptável para qualquer tamanho de operação.
        </p>

        <h2>⚡ Aceleradores de Resultado</h2>
        <p>
          Ferramentas e automações que fazem você produzir 10x mais com o mesmo esforço.
          Investimentos que se pagam em semanas.
        </p>

        <h2>🚀 Próximos Passos</h2>
        <p>
          Implemente essas estratégias sistematicamente e acompanhe os resultados.
          Sucesso em ${theme} é consequência de ação consistente.
        </p>
      `,
      tags: [theme, 'Negócios', 'Estratégia', 'Produtividade', 'Crescimento'],
      suggestedTemplate: 'final-emphasis' as TemplateType,
      templateJustification: '💡 Template Final Ênfase: Ideal para mensagens de impacto e chamada à ação.'
    }
  }

  // Tema genérico - mais interessante que antes
  return {
    title: `${theme}: O Guia Definitivo para Iniciantes e Experts`,
    excerpt: `Tudo o que você precisa saber sobre ${theme} em um único lugar. Do básico ao avançado, com exemplos práticos e casos reais.`,
    content: `
      <h2>🌟 Introdução a ${theme}</h2>
      <p>
        ${theme} está transformando a forma como trabalhamos e vivemos. Este guia completo
        vai te levar do zero ao domínio prático, com exemplos reais e aplicações imediatas.
      </p>

      <h2>🎓 Fundamentos Essenciais</h2>
      <p>
        Antes de técnicas avançadas, domine os conceitos-chave que formam a base:
      </p>
      <ul>
        <li><strong>Conceitos Core:</strong> O que todo profissional precisa saber</li>
        <li><strong>Terminologia:</strong> Fale a linguagem dos experts</li>
        <li><strong>Ferramentas:</strong> Stack essencial para começar</li>
      </ul>

      <h2>💪 Técnicas Avançadas</h2>
      <p>
        Com a base sólida, explore estratégias que separam amadores de profissionais.
        Aprenda com quem já trilhou esse caminho.
      </p>

      <h2>🔥 Casos de Sucesso</h2>
      <p>
        Histórias reais de pessoas e empresas que alcançaram resultados extraordinários
        aplicando ${theme}. Inspire-se e adapte para sua realidade.
      </p>

      <h2>🎯 Ação Imediata</h2>
      <p>
        Conhecimento sem ação é desperdício. Aqui está seu plano de ação para os próximos
        30 dias de estudos e prática em ${theme}.
      </p>

      <h2>✅ Conclusão</h2>
      <p>
        ${theme} é jornada, não destino. Continue aprendendo, praticando e compartilhando
        conhecimento com a comunidade.
      </p>
    `,
    tags: [theme, 'Tecnologia', 'Tutorial', 'Guia Completo', 'Aprendizado'],
    suggestedTemplate: 'traditional' as TemplateType,
    templateJustification: '📝 Template Tradicional: Versátil e eficaz para conteúdo educacional abrangente.'
  }
}

function determineTemplate(theme: string): 'traditional' | 'visual-duo' | 'editorial' | 'final-emphasis' {
  const themeL = theme.toLowerCase()

  // Visual Duplo: bom para comparações, reviews, antes/depois
  if (themeL.includes('comparação') || 
      themeL.includes('review') || 
      themeL.includes('vs') ||
      themeL.includes('diferença')) {
    return 'visual-duo'
  }

  // Editorial: bom para storytelling, casos de uso, experiências
  if (themeL.includes('história') || 
      themeL.includes('experiência') || 
      themeL.includes('jornada') ||
      themeL.includes('caso')) {
    return 'editorial'
  }

  // Final Emphasis: bom para conclusões, anúncios, mensagens importantes
  if (themeL.includes('anúncio') || 
      themeL.includes('lançamento') || 
      themeL.includes('novidade') ||
      themeL.includes('comunicado')) {
    return 'final-emphasis'
  }

  // Traditional: padrão para artigos técnicos, tutoriais, guias
  return 'traditional'
}
