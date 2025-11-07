/**
 * Gerador de posts usando DALL-E 3 + Canvas (OpenAI)
 * Estratégia: DALL-E 3 gera fundo limpo + Canvas adiciona texto perfeito
 * API: https://platform.openai.com/docs/guides/images
 */

import OpenAI from 'openai'
import { addTextOverlay } from './image-text-overlay'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface DallEGenerationRequest {
  nicho: string
  tema: string
  palavrasChave?: string[]
  estilo?: string
  coresPrincipais?: string[]
}

/**
 * Determina o tipo de conteúdo baseado no nicho e tema
 */
function determinarTipoConteudo(nicho: string, tema: string): { tipo: 'COMERCIAL' | 'EDUCATIVO'; descricao: string } {
  const nichoLower = nicho.toLowerCase()
  const temaLower = tema.toLowerCase()
  
  // Nichos comerciais específicos - foco em vender serviços
  const nichosComerciais = [
    'advogado', 'advogados', 'jurídico', 'direito',
    'médico', 'médicos', 'clínica', 'consultório', 'saúde',
    'dentista', 'dentistas', 'odontologia', 'odontológico',
    'contador', 'contadores', 'contabilidade', 'contábil',
    'arquiteto', 'arquitetos', 'arquitetura',
    'engenheiro', 'engenheiros', 'engenharia',
    'psicólogo', 'psicólogos', 'psicologia', 'terapia',
    'nutricionista', 'nutrição',
    'veterinário', 'veterinária', 'pet',
    'imobiliária', 'imobiliário', 'corretor',
    'restaurante', 'bar', 'lanchonete', 'food service',
    'academia', 'personal trainer', 'fitness',
    'salão', 'barbearia', 'estética',
    'loja', 'e-commerce', 'varejo', 'comércio'
  ]
  
  // Temas educativos - foco em educar e informar
  const temasEducativos = [
    'programação', 'código', 'desenvolvimento', 'dev',
    'tutorial', 'como fazer', 'passo a passo', 'guia',
    'dica', 'dicas', 'truque', 'truques',
    'novidade', 'novidades', 'notícia', 'notícias',
    'tecnologia', 'tech', 'inovação',
    'inteligência artificial', 'ia', 'machine learning',
    'javascript', 'python', 'react', 'node',
    'framework', 'biblioteca', 'ferramenta',
    'carreira', 'profissional', 'mercado',
    'conceito', 'fundamento', 'básico'
  ]
  
  // Verifica se é nicho comercial
  const isNichoComercial = nichosComerciais.some(n => nichoLower.includes(n))
  
  // Verifica se é tema educativo
  const isTemaEducativo = temasEducativos.some(t => temaLower.includes(t))
  
  if (isNichoComercial && !isTemaEducativo) {
    return {
      tipo: 'COMERCIAL',
      descricao: 'Conteúdo focado em vendas e conversão para nicho específico'
    }
  } else {
    return {
      tipo: 'EDUCATIVO',
      descricao: 'Conteúdo informativo e educacional sobre tecnologia/programação'
    }
  }
}

export async function generatePostWithLeonardo(request: DallEGenerationRequest) {
  console.log('🎨 [DALLE-LIB] === INICIANDO GERAÇÃO COM DALL-E 3 ===')
  console.log('🎨 [DALLE-LIB] Request:', request)
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('🎨 [DALLE-LIB] ❌ OPENAI_API_KEY não configurada')
    throw new Error('OPENAI_API_KEY não configurada. Adicione ao .env.local')
  }
  
  console.log('🎨 [DALLE-LIB] ✓ API Key configurada')

  // 1. Gerar conteúdo com GPT-4
  console.log('🎨 [DALLE-LIB] Gerando conteúdo com GPT-4...')
  
  // Determinar tipo de conteúdo baseado no nicho
  const tipoConteudo = determinarTipoConteudo(request.nicho, request.tema)
  
  const contentPrompt = `
Crie conteúdo EM PORTUGUÊS BRASILEIRO para um post do Instagram sobre:

NICHO: ${request.nicho}
TEMA: ${request.tema}
PALAVRAS-CHAVE: ${request.palavrasChave?.join(', ') || 'tecnologia, inovação'}
TIPO DE CONTEÚDO: ${tipoConteudo.tipo}

${tipoConteudo.tipo === 'COMERCIAL' ? `
===== CONTEÚDO COMERCIAL =====
OBJETIVO: Vender automações/serviços para um nicho específico

ESTRUTURA DA CAPTION:
1. Gancho comercial forte (dor específica do nicho)
2. Apresentar solução (automação/IA)
3. Benefícios tangíveis (tempo economizado, aumento de produtividade)
4. Prova social se possível
5. CTA para vendas: "Entre em contato pelo site: https://catbytes.site 📲"
6. Tom: Persuasivo, profissional, focado em ROI

CALL-TO-ACTION: Direcionar para VENDAS/CONTATO no catbytes.site
` : `
===== CONTEÚDO INFORMATIVO/EDUCATIVO =====
OBJETIVO: Educar, informar sobre tecnologia/programação

ESTRUTURA DA CAPTION:
1. Gancho educativo (curiosidade, novidade tecnológica)
2. Explicação didática do conceito
3. Dicas práticas e aplicáveis
4. Valor educacional claro
5. CTA educativo: "Mais conteúdo como este no blog: https://catbytes.site 📚"
6. CTA newsletter: "Assine nossa newsletter para receber dicas semanais! 💌"
7. Tom: Didático, acessível, inspirador

CALL-TO-ACTION: Direcionar para CONTEÚDO/NEWSLETTER no catbytes.site
`}

Gere um JSON com:
{
  "titulo": "Título impactante EM PORTUGUÊS (máx 50 caracteres)",
  "textoImagem": "Texto principal EM PORTUGUÊS para aparecer na imagem (máx 100 caracteres, SIMPLES e DIRETO)",
  "caption": "Legenda completa EM PORTUGUÊS do post (250-400 caracteres, com emojis e call-to-action ${tipoConteudo.tipo === 'COMERCIAL' ? 'comercial' : 'educativo'})",
  "pontosVisuais": ["3-4 elementos visuais/ícones específicos do tema que devem aparecer"],
  "cta": "Call to action final EM PORTUGUÊS",
  "tipoConteudo": "${tipoConteudo.tipo}"
}

IMPORTANTE: 
- TODO o conteúdo DEVE ser em PORTUGUÊS BRASILEIRO
- O texto da imagem deve ser CURTO e IMPACTANTE (máximo 8 palavras)
- Caption deve ter o tom apropriado: ${tipoConteudo.tipo === 'COMERCIAL' ? 'comercial/vendas' : 'educativo/informativo'}
- Audiência brasileira
- CTA deve levar a catbytes.site com objetivo claro
`

  console.log('🎨 [DALLE-LIB] Chamando GPT-4...')
  const contentResponse = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Você é um especialista em marketing digital brasileiro. Você sabe distinguir quando criar conteúdo COMERCIAL (para vender serviços) vs EDUCATIVO (para educar e engajar). 
        
COMERCIAL: Nichos específicos (advogados, médicos, dentistas, contadores, etc) - Tom persuasivo, foco em vender
EDUCATIVO: Tecnologia, programação, IA, novidades tech - Tom didático, foco em educar

Sempre gera conteúdo em PORTUGUÊS BRASILEIRO com texto SIMPLES e CURTO para imagens.`
      },
      { role: 'user', content: contentPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4 // REDUZIDO para texto mais preciso
  })

  const content = JSON.parse(contentResponse.choices[0].message.content!)
  console.log('🎨 [DALLE-LIB] ✓ Conteúdo gerado:', content)

  // 2. Gerar imagem com DALL-E 3
  console.log('🎨 [DALLE-LIB] Construindo prompt para DALL-E 3...')
  const imagePrompt = buildDallePrompt(request, content)
  console.log('🎨 [DALLE-LIB] Prompt completo:', imagePrompt)

  console.log('🎨 [DALLE-LIB] Chamando DALL-E 3 API...')
  
  const dalleResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: imagePrompt,
    n: 1,
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid'
  })

  if (!dalleResponse.data || dalleResponse.data.length === 0) {
    throw new Error('Nenhuma imagem retornada pela API')
  }

  const imageUrl = dalleResponse.data[0].url
  if (!imageUrl) {
    throw new Error('URL da imagem não encontrada')
  }
  
  console.log('🎨 [DALLE-LIB] ✅ Imagem gerada com sucesso!')

  // 3. Adicionar texto via Canvas (perfeito em português!)
  console.log('🎨 [DALLE-LIB] Adicionando texto via Canvas...')
  
  const textoSimples = content.textoImagem
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .slice(0, 2)
    .join('\n')

  const finalImageDataUrl = await addTextOverlay({
    text: textoSimples,
    imageUrl,
    fontSize: 60,
    fontFamily: 'Inter, system-ui, sans-serif',
    textColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'center',
    maxWidth: 800
  })

  console.log('🎨 [DALLE-LIB] ✅ Texto adicionado com sucesso!')

  // Converter data URL para base64 puro
  const imageBase64 = finalImageDataUrl.split(',')[1]

  console.log('🎨 [DALLE-LIB] ✅ GERAÇÃO COMPLETA COM TEXTO PERFEITO!')

  return {
    imageUrl: finalImageDataUrl, // Retorna data URL com texto
    imageBase64,
    titulo: content.titulo,
    textoImagem: content.textoImagem,
    caption: content.caption,
    prompt: imagePrompt
  }
}

function buildDallePrompt(
  request: DallEGenerationRequest,
  content: any
): string {
  const cores = request.coresPrincipais?.join(', ') || 'cores vibrantes modernas'
  
  // Determinar tipo de conteúdo
  const tipoConteudo = determinarTipoConteudo(request.nicho, request.tema)

  // Contexto visual específico por nicho
  const contextoVisual = gerarContextoVisual(request.nicho, request.tema, tipoConteudo.tipo)

  // Construir prompt SEM TEXTO (será adicionado via Canvas depois)
  const visualElements = content.pontosVisuais?.slice(0, 3).join(', ') || 'ícones relevantes'
  
  // ESTRATÉGIA NOVA: Gerar imagem limpa SEM texto, adicionar texto depois com Canvas
  return `Crie um design profissional de FUNDO para post de Instagram sobre ${request.tema}.

IMPORTANTE: NÃO incluir texto, palavras ou letras na imagem. Apenas elementos visuais.

Contexto Visual: ${contextoVisual}

Especificações:
- Paleta: ${cores}
- Elementos: ${visualElements}
- Estilo: ${tipoConteudo.tipo === 'COMERCIAL' ? 'Corporativo elegante' : 'Tech moderno'}
- Composição: Deixe espaço central amplo para texto ser adicionado depois
- Fundo: Gradiente suave ou cor sólida que permita contraste com texto
- Formato: 1024x1024 quadrado
- Qualidade: Profissional, limpo, minimalista

DO NOT include any text, words, letters, or typography.
Create a clean background image only.
Professional Instagram post background without text.`
}

/**
 * Gera contexto visual específico baseado no nicho e tema
 */
function gerarContextoVisual(nicho: string, tema: string, tipo: 'COMERCIAL' | 'EDUCATIVO'): string {
  const nichoLower = nicho.toLowerCase()
  const temaLower = tema.toLowerCase()
  
  // Contextos visuais específicos por nicho (comercial)
  if (tipo === 'COMERCIAL') {
    if (nichoLower.includes('advogado') || nichoLower.includes('jurídico')) {
      return 'Ambiente profissional de escritório de advocacia, elementos de justiça modernos (balança estilizada, documentos digitais), paleta azul marinho e dourado'
    }
    if (nichoLower.includes('médico') || nichoLower.includes('saúde') || nichoLower.includes('clínica')) {
      return 'Ambiente clínico moderno e acolhedor, elementos de saúde digital (tablet médico, prontuário eletrônico), paleta azul claro e branco'
    }
    if (nichoLower.includes('dentista') || nichoLower.includes('odonto')) {
      return 'Consultório odontológico clean e moderno, tecnologia dental, paleta azul e branco com toques de verde menta'
    }
    if (nichoLower.includes('contador') || nichoLower.includes('contab')) {
      return 'Escritório contábil organizado, gráficos financeiros modernos, calculadora digital, paleta azul escuro e verde'
    }
    if (nichoLower.includes('arquitet') || nichoLower.includes('engenh')) {
      return 'Prancheta digital, projetos 3D, blueprints modernos, paleta cinza e laranja'
    }
    if (nichoLower.includes('restaurante') || nichoLower.includes('food')) {
      return 'Ambiente gastronômico profissional, elementos de pedido digital, delivery tech, paleta quente (vermelho, laranja, amarelo)'
    }
    if (nichoLower.includes('loja') || nichoLower.includes('varejo') || nichoLower.includes('commerce')) {
      return 'Loja moderna, sistema de gestão digital, paleta vibrante e comercial'
    }
    
    // Genérico comercial
    return 'Ambiente profissional e empresarial moderno, elementos de produtividade e tecnologia, paleta corporativa elegante'
  }
  
  // Contextos visuais para conteúdo educativo/tech
  if (temaLower.includes('programação') || temaLower.includes('código') || temaLower.includes('dev')) {
    return 'Ambiente de desenvolvimento moderno, tela de código elegante, editor dark theme, símbolos de programação estilizados'
  }
  if (temaLower.includes('ia') || temaLower.includes('inteligência artificial') || temaLower.includes('machine learning')) {
    return 'Elementos de IA futuristas mas elegantes, neural networks abstratas, circuitos digitais modernos, paleta azul e roxo'
  }
  if (temaLower.includes('javascript') || temaLower.includes('react') || temaLower.includes('node')) {
    return 'Logo do framework/linguagem estilizado, elementos de código web, interface moderna, paleta da tecnologia específica'
  }
  if (temaLower.includes('python')) {
    return 'Elementos Python elegantes, gráficos de data science, notebooks, paleta azul e amarelo'
  }
  if (temaLower.includes('tutorial') || temaLower.includes('dica')) {
    return 'Layout didático step-by-step, ícones de ensino modernos, setas e elementos guia, paleta educativa'
  }
  if (temaLower.includes('carreira') || temaLower.includes('profissional')) {
    return 'Crescimento profissional visualizado, gráfico de evolução, símbolos de sucesso tech, paleta inspiradora'
  }
  
  // Genérico educativo/tech
  return 'Ambiente tech moderno e inspirador, elementos de inovação e aprendizado, paleta gradiente tech (azul, roxo, ciano)'
}
