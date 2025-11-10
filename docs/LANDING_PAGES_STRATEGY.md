# 🎯 Estratégia de Landing Pages Isca - Guia Completo

## ⏱️ **TEMPO DE DEPLOY RECOMENDADO:**

### **Estratégia Otimizada: 30-60 dias por campanha**

#### Por quê?

1. **SEO Precisa de Tempo:**
   - Google leva ~7-14 dias para indexar
   - Ranking começa a aparecer em ~21-30 dias
   - Autoridade da página cresce em ~45-60 dias

2. **Dados para Análise:**
   - Mínimo 30 dias para ter dados estatísticos válidos
   - Identificar padrões de tráfego
   - A/B testing precisa de volume

3. **ROI:**
   - Custo de criação: $0.07
   - Custo de manter no ar: $0
   - Cada lead pode valer $500-5000 (automação)
   - Vale manter no ar enquanto converter

---

## 📊 **CRONOGRAMA SUGERIDO:**

### **Semana 1-2: Aquecimento**
- Google indexa a página
- Primeiros visitantes orgânicos
- Configurar ads (Google/Facebook) se aplicável
- **Ação:** Monitorar erros, ajustar copy se necessário

### **Semana 3-4: Tração Inicial**
- SEO começa a funcionar
- Primeiros leads qualificados
- Analisar taxa de conversão
- **Ação:** Otimizar headline se conversão < 2%

### **Semana 5-8: Pico de Performance**
- Melhor período de conversão
- Dados suficientes para decisões
- ROI mais alto
- **Ação:** Escalar tráfego pago se ROI positivo

### **Semana 9-12: Maturidade**
- Tráfego orgânico estabilizado
- Leads consistentes
- **Decisão:** Manter, pausar ou renovar?

---

## 🔄 **ESTRATÉGIAS DE REAPROVEITEMENT:**

### **Opção 1: Arquivar e Relançar (Recomendado)**

**Como funciona:**
1. Após 60 dias, mude status para "archived"
2. Mantenha o repositório GitHub (privado)
3. Delete o deploy da Vercel (libera slot)
4. Dados históricos ficam no Supabase

**Quando relançar:**
- Sazonalidade do nicho (ex: academia em janeiro)
- Nova campanha de ads
- Atualização da oferta
- Teste A/B com novo copy

**Como relançar:**
1. Vá no admin → Landing Pages
2. Filtro: "Arquivadas"
3. Botão: "Relançar" → Deploy automático
4. Mesma URL ou nova (você escolhe)

### **Opção 2: Rotação Automática (Avançado)**

Criar sistema que:
- Mantém 10 LPs ativas por vez
- A cada 30 dias, arquiva a mais antiga
- Lança uma nova automaticamente
- Ciclo contínuo de testes

---

## 🎯 **SEO DAS LANDING PAGES:**

### **Nível: Intermediário-Avançado**

**O que está incluído:**

✅ **Meta Tags Otimizadas:**
- Title com palavra-chave principal
- Description persuasiva (150-160 chars)
- Keywords relevantes ao nicho

✅ **Open Graph Completo:**
- og:title, og:description, og:image
- Compartilhamento bonito no WhatsApp/LinkedIn

✅ **Schema.org JSON-LD:**
- LocalBusiness ou Service
- Google entende o tipo de negócio
- Rich snippets nos resultados

✅ **Performance:**
- HTML inline (sem CSS/JS externos)
- Imagens otimizadas (DALL-E já gera leve)
- Load time < 2s

✅ **Mobile-First:**
- 100% responsivo
- Google prioriza mobile

**O que NÃO está incluído (mas pode adicionar):**

⏳ **Backlinks:**
- Você precisa criar manualmente
- Compartilhar em redes sociais
- Diretórios de negócios

⏳ **Conteúdo Rico:**
- LPs são curtas (foco em conversão)
- Sem blog posts integrados
- Sem FAQ extenso

⏳ **Velocidade Premium:**
- Não usa CDN dedicado
- Vercel já é rápido (suficiente)

---

## 📈 **TRACKING E ANALYTICS:**

### **O que é rastreado automaticamente:**

✅ **Por Landing Page:**
- Visualizações (pageviews)
- Leads capturados
- Taxa de conversão (%)
- Status (draft/published/archived)

✅ **Por Lead:**
- Nome, email, telefone, empresa, mensagem
- **De qual página veio** (`landing_page_id` na tabela)
- UTM params (campanha, fonte, mídia)
- Device (mobile/desktop)
- Navegador, IP, país, cidade
- Referrer (de onde veio)
- Data/hora exata

### **Consultas úteis no Supabase:**

```sql
-- Leads de uma LP específica
SELECT * FROM landing_page_leads 
WHERE landing_page_id = 'uuid-da-lp'
ORDER BY created_at DESC;

-- Top 5 LPs por conversão
SELECT 
  lp.title,
  lp.views_count,
  lp.leads_count,
  lp.conversion_rate
FROM landing_pages lp
WHERE lp.status = 'published'
ORDER BY lp.conversion_rate DESC
LIMIT 5;

-- Leads por nicho
SELECT 
  lp.niche,
  COUNT(lpl.*) as total_leads
FROM landing_page_leads lpl
JOIN landing_pages lp ON lpl.landing_page_id = lp.id
GROUP BY lp.niche
ORDER BY total_leads DESC;

-- Performance por fonte de tráfego
SELECT 
  utm_source,
  COUNT(*) as leads,
  AVG(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100 as conversion_pct
FROM landing_page_leads
WHERE utm_source IS NOT NULL
GROUP BY utm_source
ORDER BY leads DESC;
```

---

## 🔐 **SEGURANÇA E PROTEÇÃO DE DADOS:**

### **O que está implementado:**

✅ **reCAPTCHA v3:**
- Invisible (não incomoda usuário)
- Score de humanidade (0-1)
- Bloqueia bots automaticamente

✅ **Badge de Segurança:**
- "🔒 Seus dados estão protegidos"
- Visível perto do formulário
- Aumenta confiança do lead

✅ **6 Camadas de Proteção:**
1. Rate limiting (5/hora por IP)
2. Honeypot (campo invisível)
3. Email validation (regex)
4. reCAPTCHA v3 (anti-bot)
5. Input sanitization (SQL injection)
6. HTTPS obrigatório (Vercel)

✅ **Texto de Privacidade:**
- "Seus dados estão protegidos por reCAPTCHA e criptografia SSL"
- "Não compartilhamos suas informações"
- "Usamos apenas para entrar em contato"

---

## 🎨 **ESTRATÉGIA DE NICHOS:**

### **12 Nichos Disponíveis:**

| Nicho | Problema Comum | Melhor Época | Conversão Esperada |
|-------|----------------|--------------|-------------------|
| 🏥 Consultório | Agendamentos | Ano todo | 3-5% |
| 💪 Academia | Retenção alunos | Jan-Mar | 4-6% |
| 💇 Salão | Confirmações | Ano todo | 2-4% |
| 🍽️ Restaurante | Reservas | Ano todo | 2-3% |
| ⚖️ Advogado | Captação clientes | Ano todo | 1-3% |
| 📊 Contabilidade | Novos clientes | Abr-Mai | 2-4% |
| 🐾 Pet Shop | Agendamentos | Ano todo | 3-5% |
| 🏠 Imobiliária | Leads | Ano todo | 1-2% |
| 📚 Escola | Matrículas | Nov-Fev | 3-6% |
| 🛍️ E-commerce | Carrinhos abandonados | Nov-Dez | 2-4% |
| 📱 Marketing | Novos clientes | Ano todo | 2-3% |
| 💼 Outros | Variado | Variado | 2-4% |

---

## 💡 **RECOMENDAÇÕES FINAIS:**

### **Tempo de Deploy por Nicho:**

**Sazonais (45-60 dias):**
- Academia (Jan-Mar, Set)
- Escola (Nov-Fev)
- E-commerce (Nov-Dez)

**Perenes (30-45 dias):**
- Consultório
- Salão
- Pet Shop
- Restaurante
- Advogado

**Testes Rápidos (15-30 dias):**
- Validação de nicho
- A/B testing de copy
- Testes de mercado

### **Quando Arquivar:**

❌ **Arquive se:**
- 0 leads em 30 dias
- Conversão < 0.5%
- Nicho saturado
- Mudança de estratégia

✅ **Mantenha se:**
- Pelo menos 1 lead/semana
- Conversão > 2%
- ROI positivo
- Tráfego orgânico crescendo

### **Quando Relançar:**

🔄 **Relance se:**
- Nova sazonalidade
- Atualização da oferta
- Teste A/B de headline
- Campanha de ads planejada

---

## 🚀 **PRÓXIMOS PASSOS:**

1. **Criar primeira LP** de teste em nicho conhecido
2. **Deploy por 30 dias** mínimo
3. **Analisar métricas** (views, leads, conversão)
4. **Decidir:** manter, pausar ou otimizar
5. **Repetir** com novos nichos

**Meta:** 5-10 landing pages rodando simultaneamente, com rotação estratégica a cada 60 dias.
