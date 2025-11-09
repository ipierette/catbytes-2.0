# 📝 Guia para Criar Artigos Manuais - CatBytes Blog

## 🎯 Divisão Proporcional Inteligente

O sistema utiliza **auto-cálculo de posicionamento** baseado no total de parágrafos do artigo.

### 📐 Como Funciona

O algoritmo analisa seu conteúdo e divide proporcionalmente:

- **Introdução:** 30% do total de parágrafos
- **Texto do Meio:** 40% do total de parágrafos  
- **Conteúdo Final:** 30% do total de parágrafos

**Exemplo com 10 parágrafos:**
```
Parágrafos 1-3:   Introdução (30%)
Parágrafos 4-7:   Texto do Meio com Imagem 1 (40%)
Parágrafos 8-10:  Final com Imagem 2 (30%)
```

**Exemplo com 20 parágrafos:**
```
Parágrafos 1-6:    Introdução (30%)
Parágrafos 7-14:   Texto do Meio com Imagem 1 (40%)
Parágrafos 15-20:  Final com Imagem 2 (30%)
```

**Vantagens:**
- ✅ Adapta-se automaticamente a qualquer tamanho de artigo
- ✅ Imagens sempre bem distribuídas visualmente
- ✅ Proporção equilibrada entre seções
- ✅ Você não precisa contar parágrafos manualmente

---

## 🎯 Estrutura Obrigatória

Todo artigo manual deve seguir **exatamente** este formato para garantir uma apresentação visual perfeita.

---

## 📋 Template de Artigo

### 📝 **Formatação Markdown com Estilos Automáticos**

O sistema aplica **automaticamente** tamanhos e negritos aos títulos:

#### **Hierarquia de Títulos:**

```markdown
# Título Nível 1
- Tamanho: 4xl (muito grande)
- Negrito: Automático
- Uso: Raramente usado (apenas título principal se necessário)

## Título Nível 2  
- Tamanho: 3xl (grande)
- Negrito: Automático  
- Uso: Seções principais do artigo
- Exemplo: "## Introdução", "## Como Funciona", "## Conclusão"

### Título Nível 3
- Tamanho: 2xl (médio-grande)
- Negrito: Automático
- Uso: Subseções dentro de uma seção principal
- Exemplo: "### Benefícios da IA", "### Passo a Passo"
```

**💡 Dica:** Você NÃO precisa usar `**texto**` para deixar títulos em negrito - o sistema já faz isso automaticamente!

#### **Formatação de Texto:**

```markdown
**texto em negrito** - para destacar palavras importantes no parágrafo

*texto em itálico* - para ênfase suave

[texto do link](https://url.com) - links aparecem em roxo/rosa

- Item de lista
- Outro item
```

#### **Parágrafos:**
- Tamanho: lg (confortável para leitura)
- Espaçamento: relaxado entre linhas
- Primeira letra da introdução: Capital letter automática (dropcap)

---

### 1️⃣ **Exemplo de Estrutura Completa**

```markdown
## Introdução

Primeiro parágrafo com contexto geral. A primeira letra terá o efeito de capital letter (dropcap) automaticamente em ROXO (modo claro) ou ROSA (modo escuro).

Segundo parágrafo complementando a introdução.

Terceiro parágrafo finalizando o contexto inicial.

## 1. Primeira Seção Principal

Texto explicativo da primeira seção com no mínimo 2 parágrafos.

Segundo parágrafo da primeira seção com mais detalhes.

### Subseção Importante

Detalhamento de um ponto específico dentro da seção.

## 2. Segunda Seção Principal

Conteúdo da segunda seção bem desenvolvido.

Detalhamento adicional com exemplos práticos usando **palavras em negrito** para destaque.

Terceiro parágrafo com conclusão da seção.

## 3. Terceira Seção

Desenvolvimento da terceira seção do artigo.

Explicação complementar com *ênfase em itálico* quando necessário.

## Conclusão

Parágrafo final resumindo os pontos principais do artigo.

Fechamento com call-to-action ou reflexão final.
```

---

### 1️⃣ **Estrutura do Markdown (LEGADO - DEPRECATED)**

```markdown
# Título Principal do Artigo

## Introdução

Primeiro parágrafo com contexto geral. A primeira letra terá o efeito de capital letter (dropcap) automaticamente.

Segundo parágrafo complementando a introdução.

Terceiro parágrafo finalizando o contexto inicial.

---

## 1. Primeira Seção Principal

Texto explicativo da primeira seção com no mínimo 2 parágrafos.

Segundo parágrafo da primeira seção com mais detalhes.

## 2. Segunda Seção Principal

Conteúdo da segunda seção bem desenvolvido.

Detalhamento adicional com exemplos práticos.

Terceiro parágrafo com conclusão da seção.

---

## 3. Terceira Seção

Desenvolvimento da terceira seção do artigo.

Explicação complementar com informações relevantes.

## 4. Quarta Seção

Texto explicativo da quarta seção.

Detalhamento adicional importante.

---

## Conclusão

Parágrafo final resumindo os pontos principais do artigo.

Fechamento com call-to-action ou reflexão final.
```

---

## 🖼️ **Imagens Obrigatórias**

Para cada artigo, você **DEVE** fornecer:

### **1. Imagem de Capa**
- **Dimensão recomendada:** 1920x1080px (16:9)
- **Formato:** JPG ou PNG
- **Uso:** Aparece no topo do artigo como hero image
- **Estilo:** Deve representar o tema central do artigo

### **2. Imagem do Corpo 1**
- **Dimensão recomendada:** 1200x800px (3:2)
- **Formato:** JPG ou PNG
- **Posição:** Após a introdução, ao lado do texto
- **Estilo:** Complementa visualmente a primeira metade do artigo

### **3. Imagem do Corpo 2**
- **Dimensão recomendada:** 1200x800px (3:2)
- **Formato:** JPG ou PNG
- **Posição:** Na segunda metade do artigo
- **Estilo:** Ilustra conceitos da segunda parte do conteúdo

---

## 💎 **Texto em Destaque (Highlight)**

Ao criar o post no admin, preencha o campo **"Texto em Destaque"** com uma frase impactante de 1-2 linhas que:

- Resume a mensagem principal do artigo
- Chama atenção visualmente
- Aparece em uma **caixa colorida** lateral

**Exemplo:**
> "Chatbots com IA aumentam em 40% a satisfação do cliente e reduzem custos de suporte"

---

## 🎨 **Layout Automático**

O sistema aplica **automaticamente** o seguinte layout quando você segue o template:

### ✅ **Com 2+ Imagens (Layout Revista Completa)**

```
┌─────────────────────────────────────┐
│   CAPA HERO (altura 300-400px)      │
└─────────────────────────────────────┘

┌─────────────────────┬───────────────┐
│   Introdução (2/3)  │ 💡 Destaque   │
│   [Capital Letter]  │   (1/3)       │
└─────────────────────┴───────────────┘

┌──────────────┬────────────────────────┐
│  Imagem 1    │   Texto do Meio        │
│  (1/2)       │   (1/2)                │
└──────────────┴────────────────────────┘

┌─────────────────────┬───────────────┐
│   Imagem 2          │ 📌 Saiba Mais │
│   Grande (2/3)      │   (1/3)       │
└─────────────────────┴───────────────┘

┌─────────────────────────────────────┐
│   Restante do Conteúdo              │
│   (Texto completo centralizado)     │
└─────────────────────────────────────┘
```

### ✅ **Com 1 Imagem (Layout Revista Simples)**

```
┌─────────────────────────────────────┐
│   CAPA HERO                         │
└─────────────────────────────────────┘

┌─────────────────────┬───────────────┐
│   Introdução (2/3)  │ 📌 Destaque   │
└─────────────────────┴───────────────┘

┌─────────────────────────────────────┐
│   IMAGEM DESTACADA                  │
│   (moldura com rotação)             │
└─────────────────────────────────────┘

┌─────────────────────┬───────────────┐
│   Continuação (2/3) │ ℹ️ Info Box   │
└─────────────────────┴───────────────┘
```

### ✅ **Sem Imagens Extras (Layout Simples)**

```
┌─────────────────────────────────────┐
│   CAPA HERO                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Conteúdo Completo Centralizado    │
│   [Capital Letter no início]        │
└─────────────────────────────────────┘
```

---

## 🔧 **Como Criar um Artigo - Passo a Passo**

### **Via Admin Panel:**

1. Acesse: `/admin`
2. Clique em **"Novo Post"**
3. Preencha os campos:

| Campo | Descrição | Obrigatório |
|-------|-----------|-------------|
| **Título** | Título principal do artigo | ✅ |
| **Categoria** | Desenvolvimento, Design, IA, etc. | ✅ |
| **Imagem de Capa** | URL da capa (1920x1080) | ✅ |
| **Conteúdo** | Markdown seguindo o template acima | ✅ |
| **Texto em Destaque** | Frase impactante para caixa lateral | ✅ |
| **Tags** | Palavras-chave separadas por vírgula | ✅ |

4. **Cole as URLs das imagens do corpo no Markdown:**

```markdown
![Descrição da imagem 1](URL_IMAGEM_1)

![Descrição da imagem 2](URL_IMAGEM_2)
```

5. Clique em **"Salvar Post"**

---

## ✨ **Recursos Automáticos**

Ao seguir este guia, seu artigo terá **automaticamente**:

✅ **Capital letter (dropcap)** na primeira letra  
✅ **Caixa de destaque colorida** com o highlight  
✅ **Layout em grid responsivo** (revista)  
✅ **Imagens posicionadas perfeitamente**  
✅ **Tipografia otimizada** (Georgia para texto)  
✅ **Espaçamento profissional**  
✅ **Gradientes e sombras modernas**  

---

## 🚫 **O Que NÃO Fazer**

❌ **Não use HTML direto** no markdown  
❌ **Não coloque imagens fora do padrão** (sempre 2 imagens ou nenhuma)  
❌ **Não deixe o campo "Destaque" vazio** (sempre preencha)  
❌ **Não use parágrafos muito curtos** (mínimo 2-3 linhas)  
❌ **Não misture estilos** (siga o template)  

---

## 📦 **Exemplo Prático Completo**

### **Dados do Formulário:**

```
Título: Como criar um chatbot com IA que realmente entende seus clientes
Categoria: Desenvolvimento
Autor: Izadora Pierette
Imagem de Capa: https://exemplo.com/capa-chatbot.jpg
Texto em Destaque: Chatbots inteligentes aumentam em 40% a satisfação do cliente e reduzem custos operacionais
Tags: chatbot, IA, automação, desenvolvimento
```

### **Conteúdo Markdown:**

```markdown
# Como criar um chatbot com IA que realmente entende seus clientes

## Introdução

Nos últimos anos, os chatbots com inteligência artificial deixaram de ser uma curiosidade para se tornarem parte essencial da comunicação digital. Hoje, eles são usados em lojas online, clínicas, escritórios e até portfólios de desenvolvedores.

Este artigo mostra como criar o seu próprio chatbot com IA, do planejamento à implementação, abordando ferramentas, APIs e boas práticas para oferecer uma experiência natural e eficiente.

---

## 1. Escolhendo a IA certa

Antes de escrever uma linha de código, é fundamental definir o tipo de inteligência artificial que seu bot usará.

Existem duas abordagens principais: modelos prontos como ChatGPT e frameworks abertos como Rasa.

![Fluxograma de criação de chatbot](https://exemplo.com/imagem1.jpg)

## 2. Conectando o chatbot ao seu site

Para integrar o chatbot ao seu site em React ou Next.js, é possível usar a API da OpenAI como ponto de partida.

Esse código cria uma interação inicial entre o usuário e o modelo de IA.

![Interface de chatbot moderno](https://exemplo.com/imagem2.jpg)

## Conclusão

Criar um chatbot com IA é mais do que programar respostas automáticas — é desenvolver uma experiência de comunicação.
```

---

## 🎯 **Resultado Final**

Ao seguir este guia, seus artigos terão:

🎨 **Visual profissional** de revista digital  
📱 **Responsividade perfeita** em mobile  
🎭 **Hierarquia visual clara** com dropcap  
💎 **Destaques em caixas coloridas**  
🖼️ **Imagens integradas harmoniosamente**  
✍️ **Tipografia elegante** e legível  

---

## 📞 **Precisa de Ajuda?**

Se tiver dúvidas sobre:
- Como hospedar imagens
- Formatar markdown específico
- Adicionar elementos especiais

Entre em contato ou consulte a documentação do Next.js.

---

**Última atualização:** 9 de novembro de 2025
