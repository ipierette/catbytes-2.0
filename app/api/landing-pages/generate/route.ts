import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { NICHES, COLOR_THEMES } from '@/lib/landing-pages-constants'
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
Retorne APENAS um JSON válido sem markdown, sem comentários, sem quebras de linha dentro das strings.`
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
  "image_prompt": "Prompt FOTOGRÁFICO ULTRA-DETALHADO para DALL-E 3. Descreva uma cena FOTORREALISTA de revista de publicidade profissional relacionada ao nicho. SE INCLUIR PESSOAS: especifique que devem ser fotografias reais de modelos humanos, com textura de pele natural, expressões autênticas, iluminação de estúdio profissional. PROIBIDO: ilustrações, cartoons, 3D, arte digital, anime. CRÍTICO: ZERO texto, palavras, letras, números, logos ou tipografia na imagem. Apenas fotografia pura estilo editorial comercial."
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
      prompt: `ULTRA-REALISTIC COMMERCIAL PHOTOGRAPHY - MAGAZINE EDITORIAL QUALITY:

${content.image_prompt}

PHOTOGRAPHIC TECHNICAL REQUIREMENTS:
📷 Camera Setup: Professional full-frame DSLR (Canon EOS R5/Sony A7IV)
🔍 Lens: 50mm f/1.4 OR 85mm f/1.2 prime lens for cinematic bokeh
💡 Lighting: Professional studio setup OR natural golden hour (soft, flattering light)
🎬 Resolution: 8K RAW, tack-sharp focus, crystal clear details
🎨 Style: High-end advertising photography (Apple/Nike/Vogue quality)
✨ Post-processing: Subtle color grading, natural tones, minimal retouching

IF PEOPLE ARE IN THE IMAGE - CRITICAL HUMAN REALISM RULES:
✅ MUST BE: Real human beings photographed with professional camera
✅ Skin: Natural texture with visible pores, subtle imperfections, realistic complexion
✅ Eyes: Crystal clear with natural catchlights, realistic iris details
✅ Hair: Natural flow and texture (not plasticky or too perfect)
✅ Expression: Genuine, authentic emotions (not forced smiles)
✅ Pose: Professional model poses but natural body language
✅ Diversity: Real-looking diverse people (age, ethnicity varies naturally)
✅ Clothing: Real fabric wrinkles, realistic textures
✅ Context: Natural interaction with environment

❌ ABSOLUTELY FORBIDDEN - INSTANT REJECTION:
❌ 3D renders, CGI, digital art, illustrations, paintings, cartoons
❌ AI-generated "uncanny valley" faces (overly smooth/perfect skin)
❌ Anime, manga, graphic design, vector art
❌ Generic stock photo poses (too staged/fake)
❌ Perfect symmetrical faces (unrealistic beauty standards)

🚫 ZERO TEXT RULE - MANDATORY:
❌ NO text, letters, words, numbers, signs, labels, logos, typography
❌ NO watermarks, captions, UI elements, buttons, symbols
❌ NO characters or writing in ANY language
✅ ONLY: Pure photographic scene

VERIFICATION CHECKLIST:
□ Could this image appear in Vogue, GQ, or Fortune magazine?
□ Do people look like real humans you'd see on the street?
□ Is the lighting natural and professional?
□ Zero text or graphics visible?
□ Shot on professional camera equipment?

If ANY checkbox is NO → Image must be regenerated.

Context: ${niche} industry, professional business setting, premium quality.`,
      size: '1792x1024',
      quality: 'hd',
      n: 1,
    })

    const heroImageUrl = imageResponse.data?.[0]?.url || ''

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
          content: `Use este TEMPLATE FIXO e preencha apenas os marcadores [CONTEÚDO]:

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[HEADLINE]</title>
  <meta name="description" content="[SUBHEADLINE]">
  <meta property="og:title" content="[HEADLINE]">
  <meta property="og:description" content="[SUBHEADLINE]">
  <meta property="og:image" content="${heroImageUrl}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      color: #1a202c;
      line-height: 1.6;
    }
    
    /* Header - Oculto visualmente, presente para SEO */
    header {
      position: absolute;
      left: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      padding: 4rem 2rem;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('${heroImageUrl}') center/cover no-repeat;
      opacity: 0.15;
      z-index: 0;
    }
    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    .hero-content h1 {
      font-size: 3.5rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1.5rem;
      line-height: 1.1;
    }
    .hero-content p {
      font-size: 1.5rem;
      color: rgba(255,255,255,0.95);
      margin-bottom: 2rem;
    }
    .hero-image {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .hero-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    /* CTA Buttons */
    .cta-button {
      display: inline-block;
      padding: 1.25rem 3rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      background: linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%);
      border: none;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
      text-decoration: none;
    }
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px -5px rgba(0,0,0,0.4);
    }
    
    /* Benefits Section */
    .benefits {
      padding: 6rem 2rem;
      background: #f7fafc;
    }
    .benefits-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .benefits h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 4rem;
      color: #1a202c;
    }
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2.5rem;
    }
    .benefit-card {
      background: white;
      padding: 2.5rem;
      border-radius: 15px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .benefit-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15);
    }
    .benefit-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }
    .benefit-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #2d3748;
    }
    .benefit-card p {
      color: #4a5568;
      line-height: 1.7;
    }
    
    /* Social Proof */
    .social-proof {
      padding: 4rem 2rem;
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      text-align: center;
      color: white;
    }
    .social-proof h3 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .social-proof p {
      font-size: 1.25rem;
      opacity: 0.95;
    }
    
    /* Footer */
    footer {
      padding: 2rem;
      background: #1a202c;
      text-align: center;
    }
    footer img {
      height: 40px;
      opacity: 0.7;
      margin-bottom: 0.5rem;
    }
    footer p {
      color: #a0aec0;
      font-size: 0.9rem;
    }
    
    /* Modal */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .modal.active {
      display: flex;
    }
    .modal-content {
      background: white;
      padding: 3rem;
      border-radius: 20px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }
    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      font-size: 2rem;
      cursor: pointer;
      color: #718096;
      background: none;
      border: none;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s;
    }
    .modal-close:hover {
      background: #f7fafc;
      color: #1a202c;
    }
    .modal h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #1a202c;
    }
    .modal p {
      color: #4a5568;
      margin-bottom: 2rem;
    }
    form label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2d3748;
      font-size: 0.95rem;
    }
    form input, form textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      margin-bottom: 1.25rem;
      transition: border 0.3s;
      background: #ffffff;
      color: #1a202c;
    }
    form input:focus, form textarea:focus {
      outline: none;
      border-color: ${theme.primary};
    }
    form input::placeholder, form textarea::placeholder {
      color: #a0aec0;
    }
    form textarea {
      resize: vertical;
      min-height: 120px;
    }
    form button {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }
    form button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
    }
    .security-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      color: #718096;
      font-size: 0.875rem;
    }
    .honeypot {
      position: absolute;
      left: -9999px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .hero-content h1 {
        font-size: 2.5rem;
      }
      .hero-content p {
        font-size: 1.25rem;
      }
      .benefits h2 {
        font-size: 2rem;
      }
      .modal-content {
        padding: 2rem;
      }
    }
  </style>
</head>
<body>
  <!-- Header SEO (visualmente oculto) -->
  <header>
    <img src="https://catbytes.site/images/logo-desenvolvedora.webp" alt="[HEADLINE] - powered by CATBytes AI">
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-container">
      <div class="hero-content">
        <h1>[HEADLINE]</h1>
        <p>[SUBHEADLINE]</p>
        <button class="cta-button" onclick="openModal()">[CTA_TEXT]</button>
      </div>
      <div class="hero-image">
        <img src="${heroImageUrl}" alt="[HEADLINE]" loading="eager">
      </div>
    </div>
  </section>

  <!-- Benefits Section -->
  <section class="benefits">
    <div class="benefits-container">
      <h2>Por que escolher nossa solução?</h2>
      <div class="benefits-grid">
        [BENEFITS_CARDS]
      </div>
    </div>
  </section>

  <!-- Social Proof -->
  <section class="social-proof">
    <h3>[SOCIAL_PROOF_TITLE]</h3>
    <p>[SOCIAL_PROOF_TEXT]</p>
    <button class="cta-button" onclick="openModal()" style="margin-top: 2rem;">[CTA_TEXT]</button>
  </section>

  <!-- Footer -->
  <footer>
    <img src="https://catbytes.site/images/logo-desenvolvedora.webp" alt="CATBytes AI">
    <p>powered by CATBytes AI</p>
  </footer>

  <!-- Modal do Formulário -->
  <div class="modal" id="leadModal">
    <div class="modal-content">
      <button class="modal-close" onclick="closeModal()">&times;</button>
      <h2>Solicite uma Demonstração</h2>
      <p>Preencha o formulário e entraremos em contato em breve!</p>
      
      <form id="leadForm" onsubmit="submitForm(event)">
        <input type="text" class="honeypot" name="website" tabindex="-1">
        
        <label for="name">Nome completo *</label>
        <input type="text" id="name" name="name" required placeholder="Seu nome">
        
        <label for="email">E-mail *</label>
        <input type="email" id="email" name="email" required placeholder="seu@email.com">
        
        <label for="phone">Telefone</label>
        <input type="tel" id="phone" name="phone" placeholder="(00) 00000-0000">
        
        <label for="message">Mensagem</label>
        <textarea id="message" name="message" placeholder="Como podemos ajudar?"></textarea>
        
        <button type="submit">Enviar Solicitação</button>
        
        <div class="security-badge">
          🔒 Seus dados estão protegidos por criptografia SSL
        </div>
      </form>
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
    
    async function submitForm(e) {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;
      
      const formData = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value || '',
        message: form.message.value || '',
        honeypot: form.website.value,
        landingPageSlug: window.location.pathname.split('/').pop(),
        landingPageUrl: window.location.href,
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
        referrer: document.referrer
      };
      
      try {
        const response = await fetch('/api/landing-pages/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          alert('✅ Obrigado! Entraremos em contato em breve.');
          form.reset();
          closeModal();
        } else {
          throw new Error('Erro ao enviar');
        }
      } catch (error) {
        alert('❌ Erro ao enviar. Tente novamente.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
    
    // Fechar modal ao clicar fora
    document.getElementById('leadModal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });
  </script>
</body>
</html>

AGORA PREENCHA OS MARCADORES COM O CONTEÚDO:

AGORA PREENCHA OS MARCADORES COM O CONTEÚDO:

[HEADLINE] = ${content.headline}
[SUBHEADLINE] = ${content.subheadline}
[CTA_TEXT] = ${cta_text}
[SOCIAL_PROOF_TITLE] = ${content.social_proof.split('.')[0]}
[SOCIAL_PROOF_TEXT] = ${content.social_proof}

[BENEFITS_CARDS] = Crie 3-4 cards de benefícios baseados em: ${content.benefits.join(', ')}
Cada card deve ter:
<div class="benefit-card">
  <div class="benefit-icon">[EMOJI]</div>
  <h3>[TÍTULO DO BENEFÍCIO]</h3>
  <p>[DESCRIÇÃO]</p>
</div>

REGRAS CRÍTICAS:
1. Use EXATAMENTE o template fornecido
2. Não adicione header/footer do site
3. Não mude cores/estrutura
4. Mantenha o modal do formulário intacto
5. Retorne HTML completo e válido`
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
