// =====================================================
// Blog Types - Type-safe blog system
// =====================================================

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  keywords: string[]
  seo_title: string | null
  seo_description: string | null
  meta_description: string | null // SEO meta description (50-160 chars)
  canonical_url: string | null // Canonical URL for SEO
  published: boolean
  status: 'draft' | 'published' | 'scheduled' | 'archived' // Post status
  created_at: string
  updated_at: string
  views: number
  author: string
  category: string
  tags: string[]
  ai_model: string
  generation_prompt: string | null
  locale?: string // 'pt-BR' or 'en-US'
  translated_from?: string | null // ID of the original post if this is a translation
  deleted_at?: string | null // Soft delete timestamp
  scheduled_at?: string | null // Scheduled publication date
  image_prompt?: string | null // AI prompt for cover image generation
  content_image_prompts?: string[] | null // AI prompts for content images
  highlight?: string | null // Custom highlight text for sidebar (max 300 chars)
}

export interface BlogPostInsert {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string
  keywords: string[]
  seo_title?: string
  seo_description?: string
  meta_description?: string
  canonical_url?: string
  published?: boolean
  status?: 'draft' | 'published' | 'scheduled' | 'archived'
  author?: string
  category?: string
  tags?: string[]
  ai_model?: string
  generation_prompt?: string
  locale?: string // 'pt-BR' or 'en-US'
  translated_from?: string | null // ID of the original post if this is a translation
  scheduled_at?: string | null
  image_prompt?: string | null // AI prompt for cover image generation
  content_image_prompts?: string[] | null // AI prompts for content images
  highlight?: string | null // Custom highlight text for sidebar (max 300 chars)
}

export interface BlogPostUpdate {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  cover_image_url?: string
  keywords?: string[]
  seo_title?: string
  seo_description?: string
  meta_description?: string
  canonical_url?: string
  published?: boolean
  status?: 'draft' | 'published' | 'scheduled' | 'archived'
  category?: string
  tags?: string[]
  scheduled_at?: string | null
  highlight?: string | null // Custom highlight text for sidebar (max 300 chars)
}

export interface BlogGenerationLog {
  id: string
  post_id: string | null
  status: 'success' | 'error' | 'pending'
  error_message: string | null
  generation_time_ms: number | null
  created_at: string
}

export interface PaginatedBlogPosts {
  posts: BlogPost[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// AI Generation Types
export interface AIGeneratedPost {
  title: string
  excerpt: string
  content: string
  keywords: string[]
  seo_title: string
  seo_description: string
  category: string
  tags: string[]
  sources?: Array<{
    name: string
    url: string
  }>
}

export interface BlogGenerationRequest {
  topic?: string
  keywords?: string[]
  category?: string
}

export interface BlogGenerationResponse {
  success: boolean
  post?: BlogPost
  error?: string
  generationTime?: number
}

// Image Text Overlay Types
export interface ImageTextSettings {
  fontSize: number
  fontFamily: string
  color: string
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  isBold?: boolean
  isItalic?: boolean
}

export interface CustomBlogPostRequest {
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  cover_image_url: string
  imageText?: string
  imageSettings?: ImageTextSettings
}

// SEO Keywords for blog automation
export const SEO_KEYWORDS = [
  'automação com IA',
  'chatbots personalizados',
  'aplicações web inteligentes',
  'serviços digitais',
  'desenvolvimento web',
  'inteligência artificial',
  'automação empresarial',
  'transformação digital',
  'soluções tecnológicas',
  'inovação digital',
  'chatbot para empresas',
  'assistentes virtuais',
  'API de IA',
  'integração de IA',
  'desenvolvimento de software',
] as const

// Blog Theme Categories (rotating by day)
export const BLOG_CATEGORIES = [
  'Automação e Negócios', // Segunda-feira - Para clientes e recrutadores
  'Programação e IA',     // Quinta-feira - Dicas de programação web fullstack para leigos
  'Cuidados Felinos',     // Sábado - Gatinhos com fotos acolhedoras
  'Tech Aleatório',       // Domingo - Tutoriais, SEO, marketing digital, tendências tech
] as const

export type BlogTheme = typeof BLOG_CATEGORIES[number]

// Schedule: Monday, Thursday, Saturday, Sunday
export const BLOG_SCHEDULE = {
  1: 'Automação e Negócios', // Segunda
  4: 'Programação e IA',     // Quinta
  6: 'Cuidados Felinos',     // Sábado
  0: 'Tech Aleatório',       // Domingo
} as const

// Topic ideas for each theme (EXPANDED for variety)
export const BLOG_TOPICS = {
  'Automação e Negócios': [
    'Como otimizar seu CRM para aumentar a produtividade da equipe de vendas',
    'Estratégias eficazes para integrar chatbots ao atendimento ao cliente sem perder o toque humano',
    'A importância de landing pages otimizadas para aumentar a conversão em campanhas de marketing digital',
    'Como calcular o ROI de ferramentas de automação empresarial e justificar investimentos para a diretoria',
    'Técnicas para personalização de e-commerce que podem impulsionar a experiência do usuário e as vendas',
    'O papel da transformação digital na melhoria dos processos internos de pequenas e médias empresas',
    'Como utilizar dados analíticos para refinar suas estratégias de marketing digital e maximizar resultados',
    'Desenvolvendo um plano de ação para implementar vendas automatizadas com sucesso em sua empresa',
    'A influência da automação de marketing na fidelização de clientes e aumento do LTV (Lifetime Value)',
    'Como escolher a plataforma de e-commerce ideal com base nas necessidades específicas do seu negócio',
    'Desmistificando a automação de processos: como iniciar a transformação digital sem grandes investimentos',
    'Táticas para criar um site profissional que se destaca em SEO e atrai mais visitantes qualificados',
    'Como os chatbots podem ajudar na geração de leads e na diminuição do custo de aquisição de clientes',
    'Cinco erros comuns na implementação de automação empresarial e como evitá-los para garantir o sucesso',
    'A importância da integração entre diferentes sistemas de TI para otimizar sua operação de negócios',
    'Como as landing pages dinâmicas podem aumentar as taxas de conversão em campanhas publicitárias específicas',
    'Estratégias de marketing digital que aproveitam a automação para escalar negócios sem aumentar custos fixos',
    'O que considerar ao escolher um software de CRM: funcionalidades essenciais para maximizar sua eficácia',
    'Como a automação de processos pode melhorar a gestão financeira e aumentar a lucratividade da sua empresa',
    'A relação entre experiência do usuário em sites de e-commerce e as taxas de abandono de carrinho',
    'Transformando feedback do cliente em melhorias automatizadas: um guia prático para empresas',
    'Como integrar vendas online e offline para criar uma experiência de compra unificada e satisfatória',
    'O impacto da inteligência artificial no futuro das estratégias de automação empresarial e marketing',
    'Como criar um funil de vendas automatizado que realmente converte: passo a passo para iniciantes',
    'Benefícios e desafios da automação de atendimento via chatbots para pequenas empresas',
    'Como a análise de dados pode direcionar melhorias em landing pages e aumentar conversões de forma mensurável',
    'Conectando a estratégia de e-commerce à automação de marketing para otimizar o funil de vendas',
    'Ferramentas de automação que podem impulsionar o engajamento em redes sociais e converter seguidores em clientes',
    'Como educar sua equipe sobre a importância da transformação digital e sua aplicação prática no dia a dia',
    'Melhores práticas para otimizar o processo de checkout em e-commerce e reduzir a fricção da compra',
    'O papel dos chatbots na geração de relatórios automatizados: como economizar tempo e aumentar a eficiência',
    'Como implementar automação de marketing para campanhas de e-mail personalizadas.',
    'Estratégias de precificação inteligente através da automação de coleta de dados.',
    'Automatizando o atendimento ao cliente em múltiplos canais: e-mail, chat e redes sociais.',
    'Como usar automação para análise de feedback de clientes e melhoria contínua.',
    'Melhores práticas para configurar automações de lembretes e follow-ups de tarefas.',
    'A importância da automação na gestão de redes sociais para pequenas empresas.',
    'Como a automação pode melhorar a eficiência das equipes de vendas.',
    'Integrando automação de marketing com CRM para um ciclo de vendas mais eficaz.',
    'Automação de onboarding de clientes: como garantir uma experiência tranquila.',
    'Analisando o retorno sobre investimento em automação de processos empresariais.',
    'Como a automação pode facilitar auditorias internas e compliance.',
    'Dicas para criar landing pages automatizadas que convertem mais leads.',
    'Transformando dados em insights acionáveis com automação de relatórios.',
    'Como automatizar o agendamento de reuniões para otimizar a comunicação interna.',
    'Estratégias de automação em e-commerce para aumentar a taxa de conversão.',
    'Como a automação pode ajudar a gerenciar e otimizar campanhas publicitárias.',
    'O papel da automação na prevenção de fraudes em transações digitais.',
    'Implementando automação na gestão de projetos para melhor colaboração.',
    'Automatizando a atualização de informações de produto em e-commerce.',
    'Como utilizar automação para gerar relatórios financeiros com maior precisão.',
    'Automação na gestão de redes de fornecedores: simplificando o relacionamento.',
    'Criando uma experiência de compra personalizada com automações no e-commerce.',
    'Como utilizar chatbots para atender diferentes segmentos de clientes simultaneamente.',
    'Automação de feedbacks pós-compra: como ouvir sua audiência de forma eficaz.',
    'Implementando sistemas de automação para gerenciamento de eventos e webinars.',
    'Como a automação pode ajudar na gestão de campanhas de fidelização de clientes.',
    'Ferramentas de automação que pequenas empresas podem adotar sem complicação.',
    'Como otimizar o funil de vendas com automações baseadas em comportamento do cliente.',
    'Estratégias de automação para melhorar a retenção de clientes a longo prazo.',
    'Automatizando a gestão de tarefas diárias para liberar tempo da equipe.',
    'O impacto das automações na criação de conteúdo digital e gestão de marcas.',
    'Por que toda empresa precisa de automação',
    'Como um site profissional aumenta sua credibilidade',
    'Chatbots: o segredo para atendimento 24/7',
    'ROI de aplicações web: vale a pena investir?',
    'Transformação digital para pequenas empresas',
    'Como a IA pode revolucionar seu negócio',
    'Sites responsivos: por que são essenciais hoje',
    'Automação de vendas: ganhe mais vendendo menos',
    'Portfolio online: sua vitrine digital profissional',
    'Como escolher a tecnologia certa para sua empresa',
    // NOVOS TÓPICOS (20+ adicionais)
    'E-commerce: como vender mais com automação de marketing',
    'CRM inteligente: gestão de clientes com IA',
    'Agendamento online: elimine ligações e economize tempo',
    'Chatbots para WhatsApp Business: automatize vendas',
    'Presença digital: como se destacar da concorrência',
    'Landing pages que convertem: design e copywriting',
    'Email marketing automatizado: nutra leads sem esforço',
    'Dashboards gerenciais: dados em tempo real para decisões',
    'Integração de sistemas: conecte todas suas ferramentas',
    'Atendimento omnichannel: unifique todos os canais',
    'Automação de cobrança: reduza inadimplência',
    'Onboarding digital: impressione novos clientes',
    'Relatórios automatizados: insights sem trabalho manual',
    'Assinatura digital: valide contratos instantaneamente',
    'Workflow automation: processos que se gerenciam sozinhos',
    'Chatbots multilíngues: atenda clientes globais',
    'API integrations: conecte seu negócio ao mundo',
    'Gestão de projetos com IA: produtividade em alta',
    'Funil de vendas automatizado: conversões no piloto automático',
    'Marketing de conteúdo: atraia clientes organicamente',
    'SEO local: domine buscas na sua região',
    'Análise preditiva: antecipe tendências de mercado',
    'Automação de RH: recrutamento e seleção inteligentes',
    'Faturamento eletrônico: emita notas automaticamente',
    'Chatbots para suporte técnico: reduza tickets',
    'Personalização em escala: experiências únicas para cada cliente',
    'Voice commerce: venda por comando de voz',
    'Inteligência de negócios: BI para pequenas empresas',
    'Automação financeira: controle total sobre o caixa',
    'Marketplace próprio: crie sua plataforma de vendas',
  ],
  'Programação e IA': [
    'O que é HTML? Guia para quem nunca programou',
    'CSS para iniciantes: deixando seu site bonito',
    'JavaScript explicado: o que ele faz no seu navegador?',
    'React para iniciantes: criando interfaces modernas',
    'Angular vs React vs Vue: qual escolher?',
    'Node.js: JavaScript no back-end explicado',
    'SQL básico: entendendo bancos de dados',
    'MongoDB: quando usar banco de dados NoSQL',
    'APIs REST: conectando front-end e back-end',
    'Git e GitHub: salvando seu código na nuvem',
    'TypeScript: JavaScript com superpoderes',
    'Next.js: framework React para produção',
    'Express.js: criando servidores com Node',
    'Tailwind CSS: estilização rápida e moderna',
    'Docker: empacotando aplicações explicado simples',
    'N8N: automação visual sem código',
    'Webhooks: o que são e como funcionam',
    'JWT: autenticação em APIs explicada',
    'Deploy: colocando sua aplicação online (Vercel, Netlify)',
    'Firebase: back-end pronto para seu app',
    'GraphQL: alternativa moderna ao REST',
    'Redux: gerenciamento de estado em React',
    'Python para web: Flask e Django para iniciantes',
    'Responsividade: design para todos os dispositivos',
    'SEO para desenvolvedores: seu site no Google',
    // NOVOS TÓPICOS (25+ adicionais)
    'Claude vs ChatGPT vs Gemini: qual IA escolher',
    'Prompts para programadores: otimize seu código com IA',
    'GitHub Copilot: programe 10x mais rápido',
    'Cursor AI: o editor que escreve código para você',
    'IA generativa: crie imagens, vídeos e áudio com código',
    'Machine Learning para iniciantes: primeiros passos',
    'Processamento de linguagem natural: IA que entende texto',
    'Computer Vision: ensine máquinas a enxergar',
    'RAG (Retrieval Augmented Generation): IA com seus dados',
    'Fine-tuning de modelos: personalize IAs para seu negócio',
    'LangChain: construa aplicações com LLMs',
    'Vector databases: armazene embeddings eficientemente',
    'Prompt engineering: arte de conversar com IAs',
    'Hugging Face: biblioteca essencial de ML',
    'TensorFlow vs PyTorch: frameworks de deep learning',
    'Stable Diffusion: gere imagens realistas com código',
    'Whisper AI: transcrição de áudio com precisão',
    'AutoGPT: agentes de IA autônomos',
    'Semantic Kernel: framework da Microsoft para IA',
    'LlamaIndex: conecte LLMs a dados externos',
    'Pinecone: busca vetorial em escala',
    'Chroma DB: banco de dados para embeddings',
    'Ollama: rode LLMs localmente no seu PC',
    'LM Studio: interface gráfica para modelos locais',
    'OpenAI API: integre GPT-4 nas suas aplicações',
    'Anthropic Claude API: IA mais segura e precisa',
    'Google Gemini API: multimodalidade nativa',
    'Midjourney via API: automação de geração de arte',
    'ElevenLabs: crie vozes realistas com IA',
    'RunwayML: edição de vídeo com inteligência artificial',
  ],
  'Cuidados Felinos': [
    'Como escolher a ração ideal para gatos com necessidades especiais, como obesidade ou alergias alimentares.',
    'A importância do enriquecimento olfativo para gatos: técnicas e brinquedos caseiros.',
    'Dicas para cuidar da saúde dental do seu gato: prevenção de doenças e escovação.',
    'Como identificar e lidar com problemas de comportamento em gatos filhotes.',
    'A influência da idade na dieta dos gatos: o que mudar conforme eles envelhecem.',
    'Sinais de que seu gato pode estar com ansiedade de separação e como ajudar.',
    'Como criar um ambiente seguro para gatos com acesso ao exterior, evitando acidentes.',
    'A importância do rastreamento de parasitas em gatos: tipos e como prevenir.',
    'Rotina de exercícios para gatos: como estimular a atividade física em casa.',
    'Como lidar com a introdução de novos alimentos para gatos: dicas e cuidados.',
    'Compreendendo o comportamento de arranhar: o que seu gato está tentando comunicar.',
    'Dicas para a socialização de gatos tímidos: estratégias para vencer o medo.',
    'Cuidados com gatos que vivem em apartamentos: garantindo qualidade de vida.',
    'Como lidar com gatos que não gostam de ser tocados: respeitando os limites felinos.',
    'A influência da raça na personalidade e comportamento dos gatos: o que esperar.',
    'A importância do acompanhamento veterinário em gatos seniores: check-ups e cuidados específicos.',
    'Como fazer uma transição saudável de ração para gatos: evitando problemas digestivos.',
    'A relação entre estresse e saúde felina: como criar um ambiente calmo.',
    'Identificando e prevenindo a obesidade em gatos: dicas práticas e rotinas.',
    'Os benefícios da adoção de gatos com necessidades especiais: mitos e realidades.',
    'Entendendo a linguagem corporal dos gatos: como decifrar seus sinais.',
    'Como escolher o veterinário ideal para o seu gato: fatores importantes a considerar.',
    'Estratégias para evitar que gatos briguem dentro de casa: harmonizando múltiplos felinos.',
    'Os efeitos do ronronar no bem-estar felino e como isso ajuda na cura.',
    'Como preparar seu gato para viagens e passeios: dicas para um transporte seguro.',
    'Gatos e mudanças no lar: como ajudá-los a se adaptarem a novos ambientes.',
    'Cuidados com a saúde mental de gatos: a importância da estimulação cognitiva.',
    'Dicas práticas para manter a caixa de areia limpa e agradável para o gato.',
    'Impactos da dieta na pelagem dos gatos: alimentos que promovem um pelo saudável.',
    'Como identificar se seu gato está com dor: sinais sutis de desconforto.',
    'A importância do acompanhamento veterinário após a adoção: o que considerar.',
    'Primeiros cuidados com filhotes de gato',
    'Como criar um ambiente seguro para gatos',
    'Alimentação felina: guia completo por idade',
    'Sinais de que seu gato precisa de veterinário',
    'Como socializar gatos com outros pets',
    'Brincadeiras essenciais para o bem-estar felino',
    'Cuidados com gatos idosos: amor na terceira idade',
    'Como identificar o stress em felinos',
    'Vacinação felina: cronograma essencial',
    'Plantas tóxicas para gatos: lista de cuidados',
    // NOVOS TÓPICOS (15+ adicionais)
    'Arranhadores: como escolher e posicionar corretamente',
    'Caixa de areia: higiene e melhores práticas',
    'Petiscos saudáveis: o que pode e o que evitar',
    'Comportamento felino: entenda a linguagem corporal',
    'Dentes e saúde bucal: escovação e cuidados',
    'Pelagem perfeita: rotina de escovação por raça',
    'Castração: benefícios e cuidados pós-operatórios',
    'Gatos e água: como incentivar a hidratação',
    'Problemas urinários: sintomas e prevenção',
    'Obesidade felina: dieta e exercícios',
    'Gatificação: transforme sua casa num paraíso felino',
    'Viagem com gatos: transporte seguro e confortável',
    'Mudança de casa: adaptando gatos ao novo lar',
    'Gatos e crianças: convivência harmoniosa',
    'Primeiros socorros felinos: o que todo tutor deve saber',
    'Brinquedos DIY: diversão econômica para gatos',
    'Gatos resgatados: adaptação e socialização',
    'Raças hipoalergênicas: opções para alérgicos',
    'Ronronar: o que significa e benefícios terapêuticos',
    'Gatos noturnos: como lidar com atividade à noite',
  ],
  'Tech Aleatório': [
    'SEO para iniciantes: rankeie seu site no Google',
    'Marketing digital: estratégias essenciais',
    'Next.js vs Remix: qual framework escolher?',
    'Tailwind CSS: guia completo de utilitários',
    'Google Analytics 4: configuração passo a passo',
    'TypeScript: melhores práticas e padrões',
    'Docker para desenvolvedores: tutorial prático',
    'Vercel vs Netlify: qual plataforma de deploy usar?',
    'Git avançado: rebase, cherry-pick e workflows',
    'Progressive Web Apps: transforme seu site em app',
    'Web Vitals: otimize performance para SEO',
    'Accessibilidade web: WCAG e melhores práticas',
    'Ferramentas de produtividade para devs',
    'React Server Components: o futuro do React',
    'Database design: SQL vs NoSQL na prática',
    'CI/CD com GitHub Actions: automatize deploys',
    'Content Marketing: crie conteúdo que converte',
    'Email marketing: ferramentas e estratégias',
    'Headless CMS: Strapi, Sanity e Contentful',
    'API Security: proteja suas aplicações',
    // NOVOS TÓPICOS (25+ adicionais)
    'Notion para produtividade: organize sua vida e trabalho',
    'Obsidian: segunda cérebro para conhecimento',
    'Linear: gestão de projetos para times ágeis',
    'Figma: design colaborativo em tempo real',
    'Framer: prototipagem interativa de alta fidelidade',
    'Webflow: crie sites profissionais sem código',
    'Bubble.io: desenvolva aplicações complexas sem programar',
    'Supabase: alternativa open-source ao Firebase',
    'Cloudflare Workers: serverless na edge',
    'Astro: framework para sites ultra-rápidos',
    'Svelte vs React: performance e simplicidade',
    'Bun: runtime JavaScript mais rápido que Node',
    'Deno: sucessor do Node.js?',
    'tRPC: TypeScript end-to-end type-safety',
    'Prisma ORM: banco de dados type-safe',
    'Drizzle ORM: alternativa leve ao Prisma',
    'Turso: SQLite distribuído na edge',
    'PlanetScale: MySQL serverless e escalável',
    'Neon: Postgres serverless com branching',
    'Railway: deploy simplificado de aplicações',
    'Fly.io: rode apps perto dos seus usuários',
    'Render: alternativa ao Heroku',
    'DigitalOcean App Platform: PaaS completo',
    'Hetzner Cloud: VPS acessíveis na Europa',
    'Cloudflare Pages: hospedagem estática grátis',
    'GitHub Pages vs Vercel vs Netlify: comparativo completo',
    'Markdown: escrita profissional simplificada',
    'MDX: Markdown com componentes React',
    'Regex: expressões regulares sem mistério',
    'Cron jobs: agende tarefas automaticamente',
  ]
} as const
