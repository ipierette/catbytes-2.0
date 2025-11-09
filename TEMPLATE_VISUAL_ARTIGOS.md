# 🎨 Template Visual - Artigos CatBytes

## 📐 Layout Único Definitivo

Este é o **ÚNICO LAYOUT** que existe agora para artigos manuais. Simples, bonito e sempre consistente.

---

## ✅ Como Funciona

### **Estrutura Fixa:**

```
┌─────────────────────────────────────────┐
│   1. CAPA HERO (300-400px altura)       │
│   [Imagem de capa obrigatória]          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   2. HEADER DO ARTIGO                   │
│   • Título                              │
│   • Data, Views, Autor                  │
│   • Tags                                │
└─────────────────────────────────────────┘

┌──────────────────────┬──────────────────┐
│   3. INTRODUÇÃO      │  💡 DESTAQUE     │
│   (2/3 da largura)   │  (1/3 largura)   │
│   [Capital letter]   │  [Highlight box] │
└──────────────────────┴──────────────────┘

┌─────────────────┬────────────────────────┐
│  4. IMAGEM 1    │   TEXTO DO MEIO        │
│  (se existir)   │   (Parágrafos 4-6)     │
└─────────────────┴────────────────────────┘

┌──────────────────┬──────────────────────┐
│  📌 SAIBA MAIS   │   5. IMAGEM 2        │
│  [Highlight box] │   (se existir)       │
└──────────────────┴──────────────────────┘

┌─────────────────────────────────────────┐
│   6. RESTANTE DO CONTEÚDO               │
│   (Centralizado, 4xl max-width)         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   7. COMPARTILHAR                       │
│   [Instagram, Twitter, LinkedIn, WhatsApp]
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   8. CTA FINAL                          │
│   "Entre em Contato"                    │
└─────────────────────────────────────────┘
```

---

## 🎯 Regras de Ouro

### ✅ **SEMPRE incluir:**
1. **Imagem de capa** (1920x1080px recomendado)
2. **Texto em destaque** (campo `highlight`)
3. **2 imagens no corpo** (1200x800px cada)
4. **Conteúdo dividido em parágrafos** (mínimo 8-10 parágrafos)

### ✅ **O que acontece automaticamente:**
- ✨ Capital letter (dropcap) na primeira letra
- 📦 Caixa "💡 Destaque" aparece no topo
- 📦 Caixa "📌 Saiba Mais" aparece na segunda imagem
- 🎨 Layout responsivo em mobile
- 📏 Espaçamento profissional
- 🌈 Gradientes e sombras modernas

### ❌ **NÃO fazer:**
- Deixar o campo `highlight` vazio
- Usar menos de 2 imagens (ideal: SEMPRE 2)
- Parágrafos muito curtos (mínimo 2-3 linhas)
- HTML direto no markdown

---

## 📝 Exemplo de Markdown Perfeito

```markdown
# Como criar um chatbot com IA que realmente entende seus clientes

## Introdução

Nos últimos anos, os chatbots com inteligência artificial deixaram de ser uma curiosidade para se tornarem parte essencial da comunicação digital. Hoje, eles são usados em lojas online, clínicas, escritórios e até portfólios de desenvolvedores.

Este artigo mostra como criar o seu próprio chatbot com IA, do planejamento à implementação, abordando ferramentas, APIs e boas práticas para oferecer uma experiência natural e eficiente.

Vamos explorar desde a escolha da plataforma até a personalização da personalidade do bot.

---

## 1. Escolhendo a IA certa

Antes de escrever uma linha de código, é fundamental definir o tipo de inteligência artificial que seu bot usará.

Existem duas abordagens principais: modelos prontos como ChatGPT (OpenAI), Gemini (Google) e Claude (Anthropic), que são ideais para quem busca praticidade.

Também temos frameworks abertos como Rasa, Botpress e LangChain, que oferecem mais controle e personalização.

![Fluxograma de criação de chatbot com IA](URL_IMAGEM_1)

## 2. Conectando o chatbot ao seu site

Para integrar o chatbot ao seu site em React, Next.js ou Node.js, é possível usar a API da OpenAI como ponto de partida.

Esse código cria uma interação inicial entre o usuário e o modelo de IA. A partir daí, é possível aprimorar o bot com memória de contexto.

Personalidades ajustáveis e respostas automatizadas via plataformas como n8n ou Supabase Functions completam a experiência.

## 3. Dando personalidade ao seu bot

Um bom chatbot não é apenas técnico — ele deve soar humano, coerente e empático.

Para isso, é essencial definir uma identidade de comunicação que seja coerente com a marca.

Dicas incluem estabelecer um tom de voz condizente com o público e adicionar mensagens de boas-vindas.

![Interface de chatbot moderno conversando](URL_IMAGEM_2)

## 4. Testando e aprimorando

Nenhum chatbot nasce perfeito. O sucesso depende de testes contínuos e aprendizado baseado no comportamento real dos usuários.

Boas práticas incluem analisar conversas reais para identificar falhas de compreensão.

Adicione novas intenções e exemplos ao modelo de linguagem conforme necessário.

## Conclusão

Criar um chatbot com IA é mais do que programar respostas automáticas — é desenvolver uma experiência de comunicação.

Com as ferramentas certas, é possível unir tecnologia e empatia, transformando interações simples em conexões inteligentes.
```

---

## 🎨 Resultado Visual

### **Desktop:**
- Introdução (2 colunas) + Box de destaque (1 coluna)
- Imagem 1 (50%) + Texto do meio (50%)
- Imagem 2 (66%) + Box "Saiba Mais" (33%)
- Conteúdo final centralizado

### **Mobile:**
- Tudo empilhado verticalmente
- Caixas de destaque aparecem ANTES das imagens
- Imagens em tamanho reduzido (h-64)
- Texto centralizado e justificado

---

## 💡 Dica de Criação

### **Processo em 5 Passos:**

1. **Escreva o conteúdo** completo no Word/Google Docs
2. **Divida em seções** (Introdução, 4 seções principais, Conclusão)
3. **Escolha as imagens** (1 capa + 2 corpo)
4. **Extraia uma frase de destaque** (1-2 linhas impactantes)
5. **Cole no Admin** e publique

### **Checklist Antes de Publicar:**

- [ ] Capa está em 1920x1080px?
- [ ] Texto em destaque está preenchido?
- [ ] Existem 2 imagens no markdown?
- [ ] Conteúdo tem pelo menos 8 parágrafos?
- [ ] Tags estão corretas?
- [ ] Preview está bonito?

---

## 🚀 Publicar

Acesse: `/admin` → **Novo Post** → Preencha → **Salvar**

**Pronto!** Seu artigo estará com:
- ✅ Layout profissional de revista
- ✅ Capital letter automática
- ✅ Caixas de destaque coloridas
- ✅ Imagens perfeitamente posicionadas
- ✅ Responsivo em mobile
- ✅ SEO otimizado

---

**Atualizado:** 9 de novembro de 2025  
**Layout:** Único e Definitivo
