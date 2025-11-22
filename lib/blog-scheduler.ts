/**
 * Blog Scheduler - Sistema de rotação de temas por dia
 * Terça: Automação e Negócios | Quinta: Dicas de Programação Web | Sábado: Cuidados Felinos | Domingo: Tech Aleatório
 */

import type { BlogTheme } from '@/types/blog'

/**
 * Gera prompt variado para imagens de Cuidados Felinos
 * Inclui diferentes raças, poses, atmosferas e estilos
 */
function generateFelineCarePrompt(): string {
  // Raças variadas (com peso maior para raças mais populares)
  const breeds = [
    'vira-lata rajado', 'vira-lata laranja', 'vira-lata pretinho', 'vira-lata tricolor',
    'gato siamês', 'gato persa fofo', 'maine coon majestoso', 'gato british shorthair',
    'gato ragdoll', 'gato scottish fold', 'gato bengal', 'gato munchkin',
    'vários gatinhos sphynx', 'grupo de gatinhos sphynx brincando', '3-4 gatinhos sphynx fofos juntos', // Sphynx sempre em quantidade
  ]
  
  // Situações e poses
  const situations = [
    // Engraçadas e fofas
    'com o rosto colado na câmera como se estivesse espiando curiosamente',
    'fazendo cara de "peguei você no flagra" com olhos arregalados',
    'com expressão de surpresa enquanto segura um brinquedinho',
    'dormindo em posição super engraçada e desajeitada',
    'tentando alcançar um petisco com a patinha esticada',
    'encolhido dentro de uma caixinha minúscula demais',
    'fazendo aquela pose clássica de esticadão no sol',
    'correndo atrás de um laser pointer com olhos focados',
    'olhando para cima com olhos grandes e cara de inocente',
    
    // Atmosferas e cenários temáticos
    'brincando com brinquedos seguros em ambiente enriquecido',
    'sendo escovado delicadamente por mãos humanas',
    'em consulta veterinária sendo examinado com carinho',
    'tomando banho com cara de poucos amigos (mas seguro)',
    'explorando arranhador vertical novo',
    'relaxando em caminha aquecida super confortável',
    'comendo petisco saudável com expressão feliz',
    
    // Close-ups artísticos
    'close-up extremo das patinhas fofas e almofadinhas',
    'close-up dos bigodes e focinho adorável',
    'close-up dos olhos grandes e expressivos',
    'vista de cima (bird\'s eye view) olhando para a câmera',
  ]
  
  // Atmosferas e iluminação
  const atmospheres = [
    'iluminação natural suave e calorosa',
    'luz dourada da tarde entrando pela janela',
    'ambiente aconchegante com luz difusa',
    'cenário super felpudo e fofinho',
    'atmosfera pacífica e reconfortante',
  ]
  
  // Estilos visuais
  const visualStyles = [
    'fotografia ultra-realista profissional',
    'estilo pet photography de alta qualidade',
    'composição fofa e cativante',
    'estética heartwarming e adorável',
  ]
  
  // Seleciona aleatoriamente
  const breed = breeds[Math.floor(Math.random() * breeds.length)]
  const situation = situations[Math.floor(Math.random() * situations.length)]
  const atmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)]
  const visualStyle = visualStyles[Math.floor(Math.random() * visualStyles.length)]
  
  // Cores sempre consistentes
  const colors = 'Cores: Tons quentes, pastéis suaves, iluminação natural dourada'
  
  return `${breed} ${situation}. Ambiente seguro e confortável para gatos, ${atmosphere}. ${visualStyle}. ${colors}. Estilo: Super fofo, realista, pet-friendly, cativante. IMPORTANTE: Máxima fofura e realismo, perfeito para artigo sobre cuidados felinos.`
}

/**
 * Determina o tema do blog baseado no dia atual
 */
export function getCurrentBlogTheme(): BlogTheme {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=domingo, 1=segunda, ..., 6=sábado
  
  // Mapeia os dias de postagem para temas
  if (dayOfWeek === 2) return 'Automação e Negócios'     // Terça
  if (dayOfWeek === 4) return 'Programação e IA'         // Quinta (Dicas de Programação Web)
  if (dayOfWeek === 6) return 'Cuidados Felinos'         // Sábado (Gatinhos)
  if (dayOfWeek === 0) return 'Tech Aleatório'           // Domingo (Tech Aleatório)
  
  // Para outros dias, determina baseado no próximo dia de postagem
  return getNextScheduledTheme()
}

/**
 * Determina o próximo tema agendado baseado no dia atual
 */
export function getNextScheduledTheme(): BlogTheme {
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  // Lógica para determinar próximo tema
  if (dayOfWeek === 2 || dayOfWeek === 3) return 'Programação e IA'      // Ter/Qua -> Quinta
  if (dayOfWeek === 4 || dayOfWeek === 5) return 'Cuidados Felinos'      // Qui/Sex -> Sábado
  if (dayOfWeek === 6) return 'Tech Aleatório' // Sábado -> Domingo
  return 'Automação e Negócios' // Domingo/Segunda -> próxima Terça
}

/**
 * Gera prompt de imagem personalizado para cada tema
 * Adiciona variação aleatória para evitar imagens repetidas
 */
export function generateImagePromptForTheme(theme: BlogTheme, title: string): string {
  const basePrompts = {
    'Automação e Negócios': `Cena de escritório empresarial profissional mostrando transformação digital. Espaço de trabalho moderno com laptop exibindo painel de automação, mesa limpa e organizada, iluminação natural brilhante. Estética corporativa com elementos de tecnologia (gráficos, interfaces digitais). Cores: Azul, branco, tons profissionais. Estilo: Limpo, moderno, focado em negócios. Sem pessoas na imagem.`,
    
    'Programação e IA': `Cena amigável e acessível de programação perfeita para iniciantes. Laptop moderno mostrando editor de código colorido com HTML/CSS/JavaScript, ícones úteis e ilustrações ao redor (como lâmpadas, marcações, elementos amigáveis para iniciantes). Espaço de trabalho convidativo com plantas, caneca de café e materiais de aprendizado. Cores: Vibrantes mas não excessivas - acentos azul, verde, roxo. Estilo: Acolhedor, educacional, moderno, acessível. Sem pessoas na imagem.`,
    
    'Cuidados Felinos': generateFelineCarePrompt(),
    
    'Tech Aleatório': `Espaço de trabalho tech moderno e versátil. Múltiplos monitores exibindo código, dashboards de SEO, ferramentas de marketing digital, tutoriais e tendências tech mais recentes. Setup profissional com iluminação LED ambiente (cores vibrantes). Gadgets tech, frameworks modernos, interfaces de ferramentas populares visíveis. Cores: Azul, verde, roxo, laranja, estética tech diversificada. Estilo: Contemporâneo, educacional, inovador, dinâmico. Sem pessoas na imagem.`
  }
  
  // Adiciona elementos de variação para evitar imagens idênticas
  const variations = [
    'Ângulo: Vista frontal',
    'Ângulo: Vista lateral diagonal',
    'Ângulo: Vista aérea suave',
    'Iluminação: Luz natural da manhã',
    'Iluminação: Luz dourada da tarde',
    'Iluminação: Luz difusa do dia nublado',
    'Composição: Regra dos terços',
    'Composição: Centralizada e equilibrada',
    'Composição: Profundidade de campo'
  ]
  
  const randomVariation = variations[Math.floor(Math.random() * variations.length)]
  
  return `${basePrompts[theme]} ${randomVariation}. Imagem de cabeçalho de blog profissional para artigo sobre "${title}". Alta qualidade, pronta para web. Proporção: 16:9. IMPORTANTE: Crie uma composição ÚNICA e visualmente distinta.`
}

/**
 * Gera keywords SEO específicas para cada tema
 */
export function getThemeKeywords(theme: BlogTheme): string[] {
  const keywordsByTheme = {
    'Automação e Negócios': [
      'automação empresarial',
      'transformação digital',
      'chatbots para empresas',
      'aplicações web',
      'ROI digital',
      'inovação empresarial'
    ],
    'Programação e IA': [
      'programação para iniciantes',
      'desenvolvimento web para leigos',
      'HTML CSS JavaScript básico',
      'dicas de programação',
      'aprender a programar',
      'web development fácil',
      'tutorial programação simples'
    ],
    'Cuidados Felinos': [
      'cuidados com gatos',
      'saúde felina',
      'dicas para gatos',
      'bem-estar animal',
      'pets saudáveis',
      'amor felino'
    ],
    'Tech Aleatório': [
      'tutoriais técnicos',
      'SEO otimização',
      'marketing digital',
      'tendências tech',
      'ferramentas tech',
      'melhores práticas desenvolvimento',
      'inovações tecnológicas',
      'frameworks modernos'
    ]
  }
  
  return keywordsByTheme[theme]
}

/**
 * Verifica se o dia atual é um dia de publicação de blog
 */
export function isBlogPostDay(date: Date = new Date()): boolean {
  const dayOfWeek = date.getDay()
  // Terça (2), Quinta (4), Sábado (6), Domingo (0)
  return dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6 || dayOfWeek === 0
}

/**
 * Retorna informações sobre o cronograma de posts
 */
export function getBlogScheduleInfo() {
  const currentTheme = getCurrentBlogTheme()
  const isPostDay = isBlogPostDay()
  const nextTheme = getNextScheduledTheme()
  
  return {
    currentTheme,
    isPostDay,
    schedule: {
      tuesday: 'Automação e Negócios',
      thursday: 'Programação e IA (Dicas para Leigos)',
      saturday: 'Cuidados Felinos (Gatinhos)',
      sunday: 'Tech Aleatório'
    }
  }
}