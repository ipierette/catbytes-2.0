# 🔒 Guia Completo: Configuração do reCAPTCHA v3

> **Objetivo:** Proteger os formulários das landing pages contra bots e spam usando Google reCAPTCHA v3

---

## 📋 Índice

1. [O que é reCAPTCHA v3?](#o-que-é-recaptcha-v3)
2. [Passo a passo: Obter chaves](#passo-a-passo-obter-chaves)
3. [Configurar no projeto](#configurar-no-projeto)
4. [Implementar validação backend](#implementar-validação-backend)
5. [Testar configuração](#testar-configuração)
6. [Troubleshooting](#troubleshooting)
7. [Best practices](#best-practices)

---

## 1️⃣ O que é reCAPTCHA v3?

### Diferenças entre versões:

| Versão | Experiência | Funcionamento | Uso recomendado |
|--------|------------|---------------|-----------------|
| **v2 (Checkbox)** | Usuário clica "Não sou um robô" | Desafios visuais (imagens) | Sites com pouco tráfego |
| **v2 (Invisible)** | Sem interação (na maioria) | Desafios quando suspeito | E-commerce, login |
| **v3** ⭐ | **Totalmente invisível** | **Score 0.0-1.0** | **Landing pages, formulários** |

### Por que v3 para landing pages?

- ✅ **Invisível:** Não interrompe conversão
- ✅ **Score-based:** Decide servidor-side (0.0 = bot, 1.0 = humano)
- ✅ **Analytics:** Google Admin mostra estatísticas de requisições
- ✅ **Flexível:** Você define threshold (ex: aceitar ≥ 0.5)

---

## 2️⃣ Passo a passo: Obter chaves

### Etapa 1: Acessar Google reCAPTCHA Admin

1. Acesse: **https://www.google.com/recaptcha/admin**
2. Faça login com sua conta Google (use a mesma do projeto)

### Etapa 2: Registrar novo site

Clique em **"+" (Adicionar site)**

**Formulário de registro:**

```
┌─────────────────────────────────────────────────────┐
│ Criar novo site reCAPTCHA                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Label (nome interno):                               │
│ ┌─────────────────────────────────────────────┐    │
│ │ CATBytes Landing Pages                       │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ Tipo de reCAPTCHA:                                  │
│ ○ reCAPTCHA v2                                      │
│ ● reCAPTCHA v3 ← SELECIONAR ESTE                    │
│                                                     │
│ Domínios (um por linha):                            │
│ ┌─────────────────────────────────────────────┐    │
│ │ catbytes.site                                │    │
│ │ localhost                                    │    │
│ │ *.vercel.app                                 │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ Proprietários (emails Google):                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ ipierette2@gmail.com                         │    │
│ └─────────────────────────────────────────────┘    │
│                                                     │
│ ☑ Aceitar os Termos de Serviço do reCAPTCHA        │
│ ☑ Enviar alertas aos proprietários              │
│                                                     │
│ [ Enviar ]                                          │
└─────────────────────────────────────────────────────┘
```

### Etapa 3: Copiar as chaves

Após submeter, você verá:

```
┌────────────────────────────────────────────────────┐
│ ✅ Site registrado com sucesso!                     │
├────────────────────────────────────────────────────┤
│                                                    │
│ 🔑 SITE KEY (pública - usar no frontend):          │
│ ┌──────────────────────────────────────────────┐  │
│ │ 6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  │  │
│ └──────────────────────────────────────────────┘  │
│ [📋 Copiar]                                        │
│                                                    │
│ 🔐 SECRET KEY (privada - usar no backend):         │
│ ┌──────────────────────────────────────────────┐  │
│ │ 6LfYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY  │  │
│ └──────────────────────────────────────────────┘  │
│ [📋 Copiar]                                        │
│                                                    │
│ ⚠️ IMPORTANTE: Mantenha a SECRET KEY segura!       │
│    Nunca exponha no frontend ou commit no Git.    │
└────────────────────────────────────────────────────┘
```

**💡 Dica:** Salve temporariamente em um arquivo de texto seguro.

---

## 3️⃣ Configurar no projeto

### Etapa 1: Adicionar chaves no `.env.local`

Abra o arquivo `.env.local` na raiz do projeto:

```bash
# Abrir no VS Code
code .env.local
```

Adicione as variáveis:

```bash
# ============================================
# Google reCAPTCHA v3
# ============================================
# Site Key (pública - usada no HTML gerado)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Secret Key (privada - validação backend)
RECAPTCHA_SECRET_KEY=6LfYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

**⚠️ Lembrete:**
- `NEXT_PUBLIC_*` → Exposta no frontend (OK para site key)
- `RECAPTCHA_SECRET_KEY` → Apenas servidor (NUNCA expor)

### Etapa 2: Reiniciar servidor Next.js

```bash
# Parar servidor (Ctrl+C) e reiniciar
npm run dev
```

### Etapa 3: Atualizar geração de HTML

O sistema **já está configurado** para incluir reCAPTCHA no HTML gerado. Mas você pode atualizar para usar a chave real:

Abra `app/api/landing-pages/generate/route.ts` e localize:

```typescript
SEGURANÇA & PRIVACIDADE:
- reCAPTCHA v3 (site key: 6LfDummy_SiteKey_ForPlaceholder) // ← MUDAR
```

Mude para:

```typescript
SEGURANÇA & PRIVACIDADE:
- reCAPTCHA v3 (site key: ${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfDummy'})
```

**Ou ainda melhor:** Deixe o prompt genérico e faça um replace no HTML final:

```typescript
// Após gerar HTML com GPT-4
const htmlContent = htmlResponse.choices[0].message.content || ''

// Replace da chave dummy pela real
const finalHtml = htmlContent.replace(
  '6LfDummy_SiteKey_ForPlaceholder',
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LfDummy'
)
```

---

## 4️⃣ Implementar validação backend

### Etapa 1: Criar função de validação

Crie o arquivo `lib/recaptcha-validator.ts`:

```typescript
/**
 * Valida token do reCAPTCHA v3 com Google API
 * 
 * @param token - Token recebido do frontend
 * @param expectedAction - Ação esperada (ex: 'submit_lead')
 * @param minimumScore - Score mínimo aceito (0.0-1.0, padrão 0.5)
 * @returns Promise<{ success: boolean, score: number, message?: string }>
 */
export async function validateRecaptchaToken(
  token: string,
  expectedAction: string = 'submit',
  minimumScore: number = 0.5
): Promise<{ success: boolean; score: number; message?: string }> {
  
  const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

  if (!SECRET_KEY) {
    console.warn('⚠️ RECAPTCHA_SECRET_KEY não configurada, pulando validação')
    return { success: true, score: 1.0, message: 'Validação desabilitada' }
  }

  try {
    // 1. Chamar API do Google
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: SECRET_KEY,
        response: token,
      }),
    })

    const data = await response.json()

    // 2. Verificar resposta
    if (!data.success) {
      return {
        success: false,
        score: 0,
        message: `reCAPTCHA falhou: ${data['error-codes']?.join(', ') || 'unknown'}`,
      }
    }

    // 3. Verificar ação
    if (data.action !== expectedAction) {
      return {
        success: false,
        score: data.score || 0,
        message: `Ação inválida: esperado "${expectedAction}", recebido "${data.action}"`,
      }
    }

    // 4. Verificar score
    const score = data.score || 0
    if (score < minimumScore) {
      return {
        success: false,
        score,
        message: `Score muito baixo: ${score} (mínimo: ${minimumScore})`,
      }
    }

    // ✅ Tudo OK
    return {
      success: true,
      score,
    }

  } catch (error: any) {
    console.error('❌ Erro ao validar reCAPTCHA:', error)
    return {
      success: false,
      score: 0,
      message: `Erro na validação: ${error.message}`,
    }
  }
}
```

### Etapa 2: Usar no endpoint de submit

Abra `app/api/landing-pages/submit/route.ts` e adicione:

```typescript
import { validateRecaptchaToken } from '@/lib/recaptcha-validator'

interface SubmitRequest {
  // ... campos existentes
  recaptchaToken?: string // ← ADICIONAR
}

export async function POST(req: NextRequest) {
  try {
    const body: SubmitRequest = await req.json()

    // ... validações existentes (honeypot, rate limit, email)

    // 6. Validar reCAPTCHA (ADICIONAR ANTES DE SALVAR)
    if (body.recaptchaToken) {
      const recaptchaResult = await validateRecaptchaToken(
        body.recaptchaToken,
        'submit_lead',
        0.5 // Score mínimo
      )

      if (!recaptchaResult.success) {
        console.warn(`🤖 reCAPTCHA falhou: ${recaptchaResult.message}`)
        return NextResponse.json(
          { 
            error: 'Falha na verificação de segurança. Tente novamente.',
            details: recaptchaResult.message
          },
          { status: 400 }
        )
      }

      console.log(`✅ reCAPTCHA validado: score ${recaptchaResult.score}`)
    }

    // ... continuar com salvamento do lead
  } catch (error: any) {
    // ...
  }
}
```

### Etapa 3: HTML gerado precisa enviar token

O GPT-4 já foi instruído a incluir reCAPTCHA no HTML. Certifique-se de que o JavaScript do formulário faz:

```javascript
// No HTML gerado, o formulário deve ter:
<script src="https://www.google.com/recaptcha/api.js?render=SUA_SITE_KEY"></script>

<script>
async function handleSubmit(e) {
  e.preventDefault()
  
  // 1. Executar reCAPTCHA
  const token = await grecaptcha.execute('SUA_SITE_KEY', { action: 'submit_lead' })
  
  // 2. Capturar dados do form
  const formData = new FormData(e.target)
  
  // 3. Adicionar token e URL
  const data = {
    ...Object.fromEntries(formData),
    recaptchaToken: token,
    landingPageUrl: window.location.href
  }
  
  // 4. Enviar POST
  const response = await fetch('/api/landing-pages/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  // ... resto do código
}
</script>
```

**💡 Nota:** Isso já está no prompt do GPT-4, mas revise os HTMLs gerados.

---

## 5️⃣ Testar configuração

### Teste 1: Verificar chave no HTML

1. Gere uma nova landing page
2. Abra o preview (`/lp/[slug]`)
3. Inspecione o código-fonte (Ctrl+U)
4. Busque por: `https://www.google.com/recaptcha/api.js?render=`
5. Confirme que a site key **não é** `6LfDummy`

```html
<!-- Deve aparecer sua chave real: -->
<script src="https://www.google.com/recaptcha/api.js?render=6LfXXXXXXXXXXXXXXXXXXXXXXXXX"></script>
```

### Teste 2: Verificar requisições no Google Admin

1. Acesse: **https://www.google.com/recaptcha/admin**
2. Selecione seu site
3. Vá para a aba **"Analytics"**
4. Você verá gráficos de:
   - Total de requisições
   - Distribuição de scores
   - Ações executadas

**Exemplo:**
```
┌──────────────────────────────────────┐
│ Últimas 24 horas                     │
├──────────────────────────────────────┤
│ Total: 47 requisições                │
│                                      │
│ Score 0.0-0.3 (bots): ▓▓░░░ 4 (8%)   │
│ Score 0.3-0.7 (suspeito): ▓▓▓░░ 9 (19%) │
│ Score 0.7-1.0 (humano): ▓▓▓▓▓ 34 (72%)  │
└──────────────────────────────────────┘
```

### Teste 3: Simular submissão

1. Abra uma landing page publicada
2. Preencha o formulário
3. Envie
4. Verifique:
   - ✅ Sem erros no console
   - ✅ Badge reCAPTCHA aparece no canto inferior direito
   - ✅ Lead salvo no banco com sucesso

### Teste 4: Validar score baixo

Para testar bloqueio de bots, você pode:

**Opção A: Ajustar threshold temporariamente**

```typescript
// lib/recaptcha-validator.ts
const recaptchaResult = await validateRecaptchaToken(
  body.recaptchaToken,
  'submit_lead',
  0.9 // ← Elevar para 0.9 (quase impossível passar)
)
```

**Opção B: Usar ferramenta de teste Google**

1. Acesse: https://www.google.com/recaptcha/admin/site/YOUR_SITE_KEY/settings
2. Vá para **"Advanced Settings"**
3. Ative **"Test Mode"**
4. Use chaves de teste:
   - Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
   - Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

---

## 6️⃣ Troubleshooting

### Erro: "Invalid site key"

**Causa:** Site key errada ou domínio não autorizado

**Solução:**
1. Acesse Google reCAPTCHA Admin
2. Vá em **Settings** do seu site
3. Adicione domínio na lista:
   ```
   localhost
   catbytes.site
   *.vercel.app
   ```

---

### Erro: "Timeout or duplicate"

**Causa:** Token expirou (válido por 2 minutos)

**Solução:** Gerar novo token a cada submit:

```javascript
// NÃO fazer:
const token = await grecaptcha.execute(...) // ← Só 1 vez
// ... esperar 5 minutos
await fetch(...) // ❌ Token expirado

// FAZER:
async function handleSubmit(e) {
  e.preventDefault()
  const token = await grecaptcha.execute(...) // ← Gerar aqui
  await fetch(...) // ✅ Imediato
}
```

---

### Erro: "Score muito baixo"

**Causa:** Google identificou comportamento de bot

**Situações comuns:**
- VPN/Proxy ativo
- Browser sem cookies
- Automação (Selenium, Puppeteer)
- Padrões suspeitos (submit muito rápido)

**Soluções:**
1. **Ajustar threshold:**
   ```typescript
   // Para tráfego de qualidade, use 0.5
   // Para aceitar mais leads (risco maior), use 0.3
   minimumScore: 0.5
   ```

2. **Implementar fallback:**
   ```typescript
   if (score < 0.5 && score >= 0.3) {
     // Enviar email para aprovação manual
     await sendManualApprovalEmail(lead)
   }
   ```

3. **Logs detalhados:**
   ```typescript
   console.log(`reCAPTCHA: score=${score}, action=${action}, hostname=${hostname}`)
   ```

---

### Erro: Badge não aparece

**Causa:** Script não carregado ou site key inválida

**Solução:**
1. Inspecionar console do browser (F12)
2. Verificar se há erros de carregamento
3. Confirmar que `<script src="https://www.google.com/recaptcha/api.js?render=...">` está no HTML

---

### Badge aparece mas bloqueia conteúdo

**Causa:** Badge padrão aparece no canto inferior direito

**Solução (opcional):** Personalizar posição com CSS:

```css
.grecaptcha-badge {
  visibility: hidden;
}

/* Adicionar texto manual */
.recaptcha-terms {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 10px;
}
```

```html
<p class="recaptcha-terms">
  Este site é protegido por reCAPTCHA e aplicam-se a 
  <a href="https://policies.google.com/privacy">Política de Privacidade</a> e 
  <a href="https://policies.google.com/terms">Termos de Serviço</a> do Google.
</p>
```

---

## 7️⃣ Best Practices

### 🔒 Segurança

1. **NUNCA commitar chaves no Git:**
   ```bash
   # .gitignore (já configurado)
   .env.local
   .env*.local
   ```

2. **Usar variáveis de ambiente no Vercel:**
   ```bash
   # Dashboard Vercel → Settings → Environment Variables
   RECAPTCHA_SECRET_KEY=6LfYYYYYYYYYYYYYYYYYYYYYYYYY
   ```

3. **Rotacionar chaves periodicamente:**
   - Gerar novas chaves a cada 6 meses
   - Atualizar em todos os ambientes (dev, prod)

---

### 📊 Monitoramento

1. **Configurar alertas no Google Admin:**
   - Acesse **Settings** → **Alerts**
   - Ative: "Suspicious traffic detected"
   - Ative: "Daily summary"

2. **Logs estruturados:**
   ```typescript
   console.log(JSON.stringify({
     event: 'recaptcha_validation',
     score: recaptchaResult.score,
     action: 'submit_lead',
     timestamp: new Date().toISOString(),
     user_agent: req.headers.get('user-agent'),
   }))
   ```

3. **Dashboards:**
   - Integrar com Google Analytics
   - Criar dashboard Supabase com scores

---

### 🎯 Otimização de conversão

1. **Threshold adaptativo:**
   ```typescript
   // Horário comercial: mais rígido
   const isBusinessHours = new Date().getHours() >= 9 && new Date().getHours() <= 18
   const threshold = isBusinessHours ? 0.5 : 0.3
   ```

2. **Fallback para scores médios:**
   ```typescript
   if (score >= 0.3 && score < 0.5) {
     // Salvar como "pending_review"
     await supabase.from('landing_page_leads').insert({
       ...leadData,
       status: 'pending_review',
       recaptcha_score: score,
     })
     
     // Notificar admin
     await sendAdminNotification(`Lead suspeito: score ${score}`)
   }
   ```

3. **A/B testing:**
   - Testar threshold 0.3 vs 0.5
   - Comparar taxa de conversão vs qualidade de leads

---

### 🌍 Multi-domínio

Se você tem múltiplos projetos:

**Opção 1: Uma chave por domínio**
```
catbytes.site → Site A
clientexyz.com → Site B
```

**Opção 2: Chave compartilhada com wildcard**
```
Domínios:
*.vercel.app
*.catbytes.site
localhost
```

**Recomendação:** Opção 2 para simplificar gestão.

---

## 📚 Recursos adicionais

- **Documentação oficial:** https://developers.google.com/recaptcha/docs/v3
- **FAQ Google:** https://developers.google.com/recaptcha/docs/faq
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/recaptcha
- **Admin Console:** https://www.google.com/recaptcha/admin

---

## ✅ Checklist final

Antes de lançar em produção:

- [ ] Chaves configuradas em `.env.local`
- [ ] Chaves configuradas no Vercel
- [ ] HTML gerado inclui site key correta
- [ ] Backend valida token antes de salvar lead
- [ ] Testado com submissões reais
- [ ] Google Admin mostra requisições
- [ ] Threshold ajustado conforme nicho
- [ ] Logs implementados
- [ ] Fallback para scores médios (opcional)
- [ ] Alertas configurados no Google Admin

---

## 🎓 Conclusão

O reCAPTCHA v3 é **invisível** para usuários legítimos e **eficaz** contra bots. Principais vantagens:

- ✅ **Zero friction:** Não interrompe conversão
- ✅ **Score adaptável:** Você decide o threshold
- ✅ **Analytics:** Visão completa no Google Admin
- ✅ **Fácil integração:** Script + validação backend

**Próximo passo:** Execute a migration SQL e implemente a validação backend! 🚀
