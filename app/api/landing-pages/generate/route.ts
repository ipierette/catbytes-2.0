import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { NICHES, COLOR_THEMES } from '@/lib/landing-pages-constants'
import { autoSubmitLandingPage } from '@/lib/google-indexing'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GenerateRequest {
  niche: string
  problem: string
  solution: string
  cta_text: string
  theme_color: string
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json()
    const { niche, problem, solution, cta_text, theme_color } = body

    // Validação
    if (!niche || !problem || !solution || !cta_text || !theme_color) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar configuração de tema
    const theme = COLOR_THEMES[theme_color as keyof typeof COLOR_THEMES]
    if (!theme) {
      return NextResponse.json(
        { error: 'Tema de cor inválido' },
        { status: 400 }
      )
    }

    // 1. Gerar conteúdo com GPT-4
    console.log('🤖 Gerando conteúdo com GPT-4...')
    const contentResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em copywriting para landing pages de conversão.
Crie conteúdo persuasivo e profissional para capturar leads qualificados.
Retorne APENAS um JSON válido sem markdown, sem comentários, sem quebras de linha dentro das strings.

CRÍTICO PARA IMAGE_PROMPT: 
O DALL-E 3 tende a gerar imagens com aparência de videogame/CGI/3D render (pele lisa demais, iluminação perfeita, ambiente sintético).
Você DEVE combater isso explicitamente no prompt mencionando:
- Modelo de câmera específico (Canon 5D Mark IV, Nikon D850, Sony A7R)
- Configurações técnicas (ISO 800-1600, f/2.8, grain visível)
- Imperfeições naturais (poros de pele, linhas de expressão, flyaways no cabelo)
- Idade realista (30-45 anos, não modelos jovens perfeitos)
- UMA fonte de luz principal (janela, softbox) - NÃO múltiplas luzes
- Edição sutil em Lightroom (NÃO filtros pesados)
Comece SEMPRE o image_prompt com "Real photograph shot on [camera] of..."
NUNCA use palavras que sugiram CGI: "perfect", "flawless", "smooth", "rendered", "digital art", "illustration".`
        },
        {
          role: 'user',
          content: `Crie uma landing page para:
- Nicho: ${niche}
- Problema: ${problem}
- Solução: ${solution}
- CTA: ${cta_text}

Retorne um JSON com:
{
  "headline": "Título principal impactante (máx 60 caracteres)",
  "subheadline": "Subtítulo complementar (máx 120 caracteres)",
  "benefits": ["benefício 1", "benefício 2", "benefício 3", "benefício 4"],
  "social_proof": "Texto de prova social",
  "urgency": "Texto de urgência/escassez",
  "image_prompt": "Prompt FOTOGRÁFICO REALISTA para DALL-E 3. Descreva UMA FOTOGRAFIA REAL tirada com câmera DSLR profissional. SE INCLUIR PESSOAS: especifique 'fotografia real de pessoa de [idade] anos, pele com textura natural visível, shot com Canon/Nikon, ISO 800 com grain visível, iluminação natural de janela'. MENCIONE SEMPRE: sensor grain, textura de pele com poros, imperfeições naturais, iluminação de UMA fonte principal. PROIBIDO: '3D render', 'ilustração', 'perfeito', 'smooth skin', 'cartoon', 'digital art', qualquer texto/logo. OBRIGATÓRIO: Começar com 'Real photograph shot on [camera model]' e mencionar características técnicas de fotografia real (ISO, grain, chromatic aberration, natural bokeh)."
}`
        }
      ],
      temperature: 0.8,
    })

    const contentText = contentResponse.choices[0].message.content || '{}'
    const content = JSON.parse(contentText)

    // 2. Gerar imagem com DALL-E 3
    console.log('🎨 Gerando imagem com DALL-E 3...')
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `REAL PHOTOGRAPHY ONLY - NO CGI - NO 3D RENDERS - NO VIDEO GAME GRAPHICS:

${content.image_prompt}

� CRITICAL ANTI-CGI RULES:
This MUST be a real photograph taken with a DSLR camera by a human photographer.
NOT computer graphics, NOT 3D render, NOT video game character, NOT AI-generated synthetic face.

📸 AUTHENTIC PHOTOGRAPHY CHARACTERISTICS:
✅ Shot on: Canon 5D Mark IV / Nikon D850 / Sony A7R (real DSLR sensor grain)
✅ Lens: 85mm f/1.4 prime (natural depth of field, NOT perfectly blurred background)
✅ ISO: 400-1600 (visible sensor noise/grain in shadows - this proves it's real)
✅ Lighting: ONE main light source (window/softbox) + natural reflections (NOT video game multiple light sources)
✅ White balance: Slightly warm (3200-5600K) with subtle color cast (NOT perfectly neutral)

REAL HUMAN SKIN (NOT 3D RENDERED):
✅ Visible skin texture: Pores, fine lines, slight redness, natural imperfections
✅ Uneven skin tone: Slight color variations (NOT uniform airbrushed game character skin)
✅ Natural shadows: Under eyes, nose, neck (NOT soft ambient occlusion from 3D software)
✅ Hair: Individual strands, flyaways, natural shine (NOT perfectly modeled 3D hair)
✅ Eyes: Asymmetric catchlights from real light, NOT perfect specular reflections
✅ Age: 28-45 years old with natural aging signs (slight wrinkles, expression lines)

ENVIRONMENT REALISM:
✅ Real location: Office, outdoor, cafe (with natural clutter, imperfect surfaces)
✅ Background: Slightly out of focus from real lens (f/2.8), NOT gaussian blur filter
✅ Lighting falloff: Natural inverse square law (NOT video game fake ambient light)
✅ Imperfections: Lens flare, chromatic aberration, slight vignetting (camera artifacts)

POST-PROCESSING (LIKE LIGHTROOM, NOT PHOTOSHOP FILTERS):
- Exposure: +0.5 stop, slight shadow lift
- Contrast: Gentle S-curve (NOT HDR tone mapping)
- Color: Warm highlights (+300K), cool shadows (-200K) - split toning
- Sharpening: Eyes only, NOT entire image
- Grain: Add subtle film grain texture (proves it's not CGI)

❌ INSTANTLY REJECTED IF IMAGE HAS:
❌ Perfectly smooth skin (video game/Sims character look)
❌ Too-perfect lighting (3D render ambient occlusion glow)
❌ Symmetrical face/environment (CGI perfection)
❌ Overly saturated colors (game engine look)
❌ Plastic/waxy skin texture
❌ Rim lighting on hair (3D shader effect)
❌ Perfect bokeh circles (synthetic)
❌ No grain/noise (too clean = CGI)

🎯 STYLE REFERENCE: 
Corporate headshot by Peter Hurley (2020s professional photography)
NOT: Unreal Engine 5 character, The Sims 4, GTA V avatar, Pixar render

PHOTOGRAPHER MINDSET: "I'm shooting professional LinkedIn headshots with natural light in a real office. Subject is a real human, age 30-40, professionally dressed, genuine expression."

Industry context: ${niche}`,
      size: '1792x1024',
      quality: 'hd',
      n: 1,
    })

    const heroImageUrl = imageResponse.data?.[0]?.url || ''

    // 2.5. Fazer upload da imagem para Supabase Storage (blog-images bucket)
    console.log('📤 Fazendo upload da imagem para Supabase...')
    let permanentImageUrl = heroImageUrl // fallback para URL temporária
    
    try {
      // Baixar imagem temporária do OpenAI
      const imageRes = await fetch(heroImageUrl)
      const imageBlob = await imageRes.blob()
      const arrayBuffer = await imageBlob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Nome único para arquivo
      const fileName = `landing-page-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
      
      // Upload para Supabase
      const { supabase: supabaseAdmin } = await import('@/lib/supabase')
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('blog-images')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '31536000', // 1 ano
        })
      
      if (uploadError) {
        console.error('⚠️ Erro no upload da imagem:', uploadError)
        // Continua com URL temporária se upload falhar
      } else {
        // URL pública permanente
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('blog-images')
          .getPublicUrl(fileName)
        
        permanentImageUrl = publicUrl
        console.log('✅ Imagem salva permanentemente:', permanentImageUrl)
      }
    } catch (error) {
      console.error('⚠️ Erro ao salvar imagem no Supabase:', error)
      // Continua com URL temporária se houver erro
    }

    // 3. Gerar HTML completo
    console.log('📄 Gerando HTML completo...')
    const htmlResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um desenvolvedor front-end especialista em criar landing pages de alta conversão.
Crie um HTML moderno, clean e profissional usando o TEMPLATE FIXO fornecido.
Você DEVE preencher apenas o conteúdo (textos e imagem), mantendo 100% da estrutura do template.`
        },
        {
          role: 'user',
          content: `Preencha os marcadores [CONTEÚDO] neste template. Retorne APENAS o HTML final, sem \`\`\`html:

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[HEADLINE]</title>
  <meta name="description" content="[SUBHEADLINE]">
  <meta property="og:title" content="[HEADLINE]">
  <meta property="og:description" content="[SUBHEADLINE]">
  <meta property="og:image" content="${permanentImageUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #1e293b;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Header SEO */
    header {
      position: absolute;
      left: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
    
    /* Hero Section */
    .hero {
      min-height: 90vh;
      display: flex;
      align-items: center;
      background: #f8fafc;
      padding: 4rem 2rem;
      position: relative;
    }
    .hero-container {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 5rem;
      align-items: center;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      background: ${theme.primary}12;
      color: ${theme.primary};
      border-radius: 50px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    
    .hero-content h1 {
      font-size: 3.75rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1.5rem;
      line-height: 1.1;
      letter-spacing: -0.025em;
    }
    .hero-content h1 .highlight {
      color: ${theme.primary};
    }
    .hero-content p {
      font-size: 1.25rem;
      color: #475569;
      margin-bottom: 2.5rem;
      line-height: 1.7;
      max-width: 540px;
    }
    
    .stats {
      display: flex;
      gap: 3rem;
      margin-top: 3rem;
      padding-top: 2.5rem;
      border-top: 1px solid #e2e8f0;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-number {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }
    
    .hero-image {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px -15px rgba(0,0,0,0.12);
      position: relative;
      border: 1px solid #e2e8f0;
    }
    .hero-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .image-badge {
      position: absolute;
      bottom: 2rem;
      left: 2rem;
      background: white;
      padding: 1.25rem 1.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid #e2e8f0;
    }
    .image-badge-icon {
      width: 52px;
      height: 52px;
      background: ${theme.primary}10;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .image-badge-text h4 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1;
    }
    .image-badge-text p {
      font-size: 0.875rem;
      color: #64748b;
    }
    
    .cta-group {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.125rem 2.25rem;
      font-size: 1.0625rem;
      font-weight: 600;
      color: #ffffff;
      background: ${theme.primary};
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px ${theme.primary}35;
      text-decoration: none;
      font-family: inherit;
    }
    .cta-button:hover {
      filter: brightness(1.08);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${theme.primary}40;
    }
    .cta-secondary {
      padding: 1.125rem 1.75rem;
      font-size: 1rem;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }
    .cta-secondary:hover {
      color: #334155;
    }
    
    /* Benefits Section */
    .benefits {
      padding: 6rem 2rem;
      background: white;
    }
    .benefits-container {
      max-width: 1280px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      max-width: 720px;
      margin: 0 auto 4.5rem;
    }
    .section-badge {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      background: ${theme.primary}08;
      color: ${theme.primary};
      border-radius: 50px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .section-header h2 {
      font-size: 2.75rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1.25rem;
      letter-spacing: -0.025em;
    }
    .section-header p {
      font-size: 1.1875rem;
      color: #64748b;
    }
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .benefit-card {
      padding: 2.25rem;
      background: #f8fafc;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      transition: all 0.25s;
    }
    .benefit-card:hover {
      border-color: ${theme.primary}40;
      box-shadow: 0 12px 36px -8px ${theme.primary}15;
      transform: translateY(-4px);
      background: white;
    }
    .benefit-icon {
      width: 60px;
      height: 60px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.875rem;
      margin-bottom: 1.75rem;
    }
    .benefit-card h3 {
      font-size: 1.3125rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.875rem;
    }
    .benefit-card p {
      color: #64748b;
      line-height: 1.7;
    }
    
    /* How It Works */
    .how-it-works {
      padding: 6rem 2rem;
      background: #f8fafc;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3rem;
      max-width: 1280px;
      margin: 4rem auto 0;
    }
    .step-card {
      text-align: center;
    }
    .step-number {
      width: 68px;
      height: 68px;
      background: ${theme.primary};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.875rem;
      font-weight: 800;
      margin: 0 auto 1.75rem;
      box-shadow: 0 8px 24px ${theme.primary}35;
    }
    .step-card h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.875rem;
    }
    .step-card p {
      color: #64748b;
      line-height: 1.7;
    }
    
    /* CTA Final */
    .cta-section {
      padding: 6rem 2rem;
      background: #0f172a;
      text-align: center;
      color: white;
    }
    .cta-section-content {
      max-width: 820px;
      margin: 0 auto;
    }
    .cta-section h2 {
      font-size: 3.25rem;
      font-weight: 800;
      margin-bottom: 1.75rem;
      letter-spacing: -0.025em;
    }
    .cta-section p {
      font-size: 1.3125rem;
      color: #cbd5e1;
      margin-bottom: 2.75rem;
    }
    .cta-section .cta-button {
      font-size: 1.1875rem;
      padding: 1.375rem 2.75rem;
    }
    
    /* Footer */
    .footer {
      padding: 2.5rem;
      text-align: center;
      background: white;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      color: #94a3b8;
      font-size: 0.875rem;
    }
    .footer a {
      color: ${theme.primary};
      text-decoration: none;
      font-weight: 600;
    }
    
    /* Modal */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.75);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      backdrop-filter: blur(12px);
    }
    .modal.active {
      display: flex;
    }
    .modal-content {
      background: white;
      border-radius: 28px;
      max-width: 620px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 25px 70px -15px rgba(0,0,0,0.35);
    }
    .modal-close {
      position: absolute;
      top: 1.75rem;
      right: 1.75rem;
      background: #f1f5f9;
      border: none;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 10;
      color: #64748b;
    }
    .modal-close:hover {
      background: #e2e8f0;
      color: #334155;
    }
    
    .ebook-banner {
      background: ${theme.primary};
      color: white;
      padding: 3rem 2.5rem;
      text-align: center;
      border-radius: 28px 28px 0 0;
    }
    .ebook-icon {
      font-size: 4.5rem;
      margin-bottom: 1.25rem;
      display: block;
    }
    .ebook-banner h3 {
      font-size: 1.875rem;
      font-weight: 800;
      margin-bottom: 0.625rem;
    }
    .ebook-banner p {
      font-size: 1.0625rem;
      opacity: 0.95;
    }
    
    .modal-body {
      padding: 2.75rem 2.5rem;
    }
    .modal-body h2 {
      font-size: 1.875rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1rem;
    }
    .modal-body > p {
      color: #64748b;
      margin-bottom: 2.25rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.625rem;
      font-size: 0.875rem;
    }
    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.9375rem 1.125rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.2s;
      color: #1e293b;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: ${theme.primary};
      box-shadow: 0 0 0 3px ${theme.primary}12;
    }
    .form-group textarea {
      resize: vertical;
      min-height: 130px;
    }
    .submit-button {
      width: 100%;
      padding: 1.1875rem;
      background: ${theme.primary};
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px ${theme.primary}35;
      font-family: inherit;
    }
    .submit-button:hover {
      filter: brightness(1.08);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${theme.primary}40;
    }
    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .success-message {
      display: none;
      text-align: center;
      padding: 3.5rem 2.5rem;
    }
    .success-message.active {
      display: block;
    }
    .success-icon {
      font-size: 4.5rem;
      margin-bottom: 1.25rem;
    }
    .success-message h3 {
      font-size: 2.125rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1.25rem;
    }
    .success-message p {
      color: #64748b;
      font-size: 1.0625rem;
      line-height: 1.7;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .hero {
        padding: 3rem 1.5rem;
      }
      .hero-container {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
      .hero-content h1 {
        font-size: 2.75rem;
      }
      .stats {
        gap: 2rem;
        flex-wrap: wrap;
      }
      .steps-grid {
        grid-template-columns: 1fr;
      }
      .cta-group {
        flex-direction: column;
        width: 100%;
      }
      .cta-button {
        width: 100%;
        justify-content: center;
      }
      .cta-section h2 {
        font-size: 2.25rem;
      }
      .section-header h2 {
        font-size: 2.25rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>[HEADLINE]</h1>
    <nav>
      <a href="/">Início</a>
      <a href="#beneficios">Benefícios</a>
      <a href="#como-funciona">Como Funciona</a>
    </nav>
  </header>

  <section class="hero">
    <div class="hero-container">
      <div class="hero-content">
        <span class="badge">🎯 [NICHO]</span>
        <h1>[HEADLINE_WITH_HIGHLIGHT]</h1>
        <p>[SUBHEADLINE]</p>
        
        <div class="cta-group">
          <button class="cta-button" onclick="openModal()">
            🎁 [CTA_TEXT]
          </button>
          <a href="#como-funciona" class="cta-secondary">
            Ver Demonstração →
          </a>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-number">[STAT_1_NUMBER]</div>
            <div class="stat-label">[STAT_1_LABEL]</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">[STAT_2_NUMBER]</div>
            <div class="stat-label">[STAT_2_LABEL]</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">[STAT_3_NUMBER]</div>
            <div class="stat-label">[STAT_3_LABEL]</div>
          </div>
        </div>
      </div>
      
      <div class="hero-image">
        <img src="${heroImageUrl}" alt="[HEADLINE]">
        <div class="image-badge">
          <div class="image-badge-icon">[BADGE_ICON]</div>
          <div class="image-badge-text">
            <h4>[BADGE_NUMBER]</h4>
            <p>[BADGE_LABEL]</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="benefits" id="beneficios">
    <div class="benefits-container">
      <div class="section-header">
        <span class="section-badge">Por que escolher?</span>
        <h2>Tudo que você precisa em uma única plataforma</h2>
        <p>Recursos poderosos que simplificam sua rotina e melhoram resultados.</p>
      </div>
      
      <div class="benefits-grid">
        [BENEFITS_CARDS]
      </div>
    </div>
  </section>

  <section class="how-it-works" id="como-funciona">
    <div class="benefits-container">
      <div class="section-header">
        <span class="section-badge">Como funciona?</span>
        <h2>Em 3 passos simples você começa</h2>
        <p>Um processo descomplicado que transforma sua rotina.</p>
      </div>
      
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3>[STEP_1_TITLE]</h3>
          <p>[STEP_1_DESC]</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h3>[STEP_2_TITLE]</h3>
          <p>[STEP_2_DESC]</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h3>[STEP_3_TITLE]</h3>
          <p>[STEP_3_DESC]</p>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="cta-section-content">
      <h2>Pronto para transformar [AREA_NEGOCIO]?</h2>
      <p>Junte-se a milhares de profissionais que já melhoraram seus resultados.</p>
      <button class="cta-button" onclick="openModal()">
        🎁 Baixar E-book + Agendar Demonstração
      </button>
    </div>
  </section>

  <footer class="footer">
    <p>powered by <a href="https://catbytes.site">CATBytes AI</a></p>
  </footer>

  <div class="modal" id="leadModal">
    <div class="modal-content">
      <button class="modal-close" onclick="closeModal()">×</button>
      
      <div class="ebook-banner">
        <span class="ebook-icon">🎁</span>
        <h3>Bônus Exclusivo!</h3>
        <p>Receba grátis nosso e-book "100 Dicas de Presença Online"</p>
      </div>
      
      <div class="modal-body">
        <div id="formContainer">
          <h2>[CTA_TEXT]</h2>
          <p>Preencha e receba o e-book + informações sobre [SOLUCAO]</p>
          
          <form id="leadForm" onsubmit="submitForm(event)">
            <input type="hidden" name="hp" value="">
            
            <div class="form-group">
              <label>Nome Completo</label>
              <input type="text" name="name" required placeholder="Digite seu nome">
            </div>
            
            <div class="form-group">
              <label>E-mail <span style="color: #64748b; font-weight: 400;">(enviaremos o e-book)</span></label>
              <input type="email" name="email" required placeholder="seu@email.com">
            </div>
            
            <div class="form-group">
              <label>Telefone/WhatsApp</label>
              <input type="tel" name="phone" required placeholder="(00) 00000-0000">
            </div>
            
            <div class="form-group">
              <label>Como podemos ajudar?</label>
              <textarea name="message" required placeholder="Conte sua necessidade..."></textarea>
            </div>
            
            <button type="submit" class="submit-button" id="submitBtn">
              🎁 Receber E-book Grátis + Contato
            </button>
          </form>
        </div>
        
        <div class="success-message" id="successMessage">
          <span class="success-icon">✅</span>
          <h3>Sucesso!</h3>
          <p><strong>Verifique seu email:</strong><br><br>
          📚 E-book "100 Dicas de Presença Online"<br>
          📋 Informações sobre [SOLUCAO]<br><br>
          Nossa equipe entrará em contato em breve!</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    function openModal() {
      document.getElementById('leadModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
      document.getElementById('leadModal').classList.remove('active');
      document.body.style.overflow = 'auto';
    }
    
    document.getElementById('leadModal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });
    
    async function submitForm(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        hp: formData.get('hp'),
        slug: window.location.pathname.split('/').pop()
      };
      
      try {
        const response = await fetch('/api/landing-pages/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          document.getElementById('formContainer').style.display = 'none';
          document.getElementById('successMessage').classList.add('active');
        } else {
          alert('Erro ao enviar. Tente novamente.');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      } catch (error) {
        alert('Erro ao enviar. Tente novamente.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  </script>
</body>
</html>

INSTRUÇÕES DE PREENCHIMENTO:

[NICHO] = ${niche}
[HEADLINE_WITH_HIGHLIGHT] = ${content.headline} (use <span class="highlight">palavra-chave</span> em 1-2 palavras importantes)
[SUBHEADLINE] = ${content.subheadline}
[CTA_TEXT] = ${cta_text}
[AREA_NEGOCIO] = sua rotina/negócio no nicho ${niche}
[SOLUCAO] = ${solution}

ESTATÍSTICAS (números impactantes):
[STAT_1_NUMBER] = Ex: "2.500+" (clientes, projetos, horas economizadas)
[STAT_1_LABEL] = Ex: "Clientes Atendidos"
[STAT_2_NUMBER] = Ex: "98%" (satisfação, aprovação, conversão)
[STAT_2_LABEL] = Ex: "Taxa de Satisfação"
[STAT_3_NUMBER] = Ex: "24h" (tempo resposta, suporte, entrega)
[STAT_3_LABEL] = Ex: "Suporte Ativo"

BADGE FLUTUANTE NA IMAGEM:
[BADGE_ICON] = � ou ⭐ ou 💎
[BADGE_NUMBER] = Ex: "15 anos" ou "#1 em SP" ou "5.0⭐"
[BADGE_LABEL] = Ex: "de experiência" ou "no mercado" ou "avaliação"

PASSOS (Como Funciona):
[STEP_1_TITLE] = Ex: "Preencha o Formulário"
[STEP_1_DESC] = Descreva primeira ação (1-2 linhas)
[STEP_2_TITLE] = Ex: "Receba Consultoria"
[STEP_2_DESC] = Descreva segunda ação (1-2 linhas)
[STEP_3_TITLE] = Ex: "Veja Resultados"
[STEP_3_DESC] = Descreva terceira ação (1-2 linhas)

BENEFÍCIOS:
[BENEFITS_CARDS] = Crie 4 cards baseados em: ${content.benefits.join(', ')}
Formato EXATO para cada card:
<div class="benefit-card">
  <div class="benefit-icon">[EMOJI]</div>
  <h3>[TÍTULO_2-4_PALAVRAS]</h3>
  <p>[DESCRIÇÃO_1-2_LINHAS]</p>
</div>

Emojis recomendados: 🚀 💎 ⚡ 🎯 📈 ✨ 🔥 💰 🎨 🔒

REGRAS CRÍTICAS:
1. Retorne HTML puro sem \`\`\`html ou explicações
2. Use fonte Inter (já incluída)
3. Cores sutis (#f8fafc background, #0f172a texto)
4. SEM gradientes em backgrounds
5. Números reais e convincentes nas stats
6. Highlight em 1-2 palavras-chave do headline
7. Badge na imagem deve ser relevante ao nicho
8. E-book mencionado no CTA e modal
9. Design profissional moderno (SaaS style)`
        }
      ],
      temperature: 0.7,
    })

    const htmlContent = htmlResponse.choices[0].message.content || ''

    // 4. Gerar slug único
    const slug = `${niche}-${Date.now()}`
    const title = content.headline.substring(0, 100)

    // 5. Salvar no banco
    const supabase = createClient()
    const { data: landingPage, error: dbError } = await supabase
      .from('landing_pages')
      .insert({
        title,
        slug,
        niche,
        problem,
        solution,
        cta_text,
        theme_color,
        headline: content.headline,
        subheadline: content.subheadline,
        benefits: content.benefits,
        hero_image_url: heroImageUrl,
        html_content: htmlContent,
        status: 'draft',
        deploy_status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('❌ Erro ao salvar no banco:', dbError)
      return NextResponse.json(
        { error: 'Erro ao salvar landing page', details: dbError.message },
        { status: 500 }
      )
    }

    console.log('✅ Landing page gerada com sucesso!')

    // Auto-submit to Google Indexing API
    try {
      console.log('[LP Generate] Submitting landing page to Google Indexing API...')
      const indexingResult = await autoSubmitLandingPage(slug)
      
      if (indexingResult.success) {
        console.log('[LP Generate] ✅ Landing page submitted to Google for indexing!')
      } else {
        console.warn('[LP Generate] ⚠️ Google indexing failed:', indexingResult.error)
      }
    } catch (indexError) {
      console.error('[LP Generate] ❌ Error submitting to Google Indexing API:', indexError)
      // Don't fail LP creation if indexing fails
    }

    return NextResponse.json({
      success: true,
      landingPage: {
        id: landingPage.id,
        slug: landingPage.slug,
        title: landingPage.title,
        headline: content.headline,
        subheadline: content.subheadline,
        heroImageUrl,
        previewUrl: `/lp/${slug}`, // Preview local
      },
      cost: {
        gpt4: 0.03, // ~$0.03 por página
        dalle3: 0.04, // $0.04 por imagem
        total: 0.07,
      }
    })

  } catch (error: any) {
    console.error('❌ Erro ao gerar landing page:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao gerar landing page', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
