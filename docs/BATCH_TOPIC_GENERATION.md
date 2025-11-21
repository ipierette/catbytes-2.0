# 📝 Guia de Geração de Tópicos em Lote

> Sistema de geração inteligente de tópicos de blog com validação automática de similaridade para evitar duplicatas e tópicos similares.

---

## 🎯 Visão Geral

O sistema de **geração em lote de tópicos** permite criar múltiplos tópicos únicos de uma vez, com validação automática para garantir que nenhum tópico similar ou duplicado seja adicionado ao pool.

### **Recursos Principais**

- ✅ **Geração em lote** (10-100 tópicos por vez)
- ✅ **Validação de duplicatas** (detecção de tópicos idênticos)
- ✅ **Validação de similaridade** (detecção de tópicos muito similares)
- ✅ **Contexto customizável** (direcione a IA com instruções específicas)
- ✅ **Interface visual** no dashboard admin
- ✅ **Copy-paste direto** para types/blog.ts

---

## 📍 Como Usar

### **1. Acesse o Dashboard Admin**

Navegue para: `https://catbytes.site/admin/dashboard`

### **2. Localize a Seção "Pool de Tópicos"**

Role até a seção "📊 Pool de Tópicos" no dashboard.

### **3. Configure a Geração**

**Categoria**: Escolha uma das 4 categorias:
- Automação e Negócios
- Programação e IA
- Cuidados Felinos
- Tech Aleatório

**Quantidade**: Defina quantos tópicos gerar (10-100)

**Contexto Adicional** (opcional): Instrua a IA com direcionamento específico:
```
Exemplo 1: "Foque em startups de tecnologia, evite tópicos muito técnicos"
Exemplo 2: "Tópicos para iniciantes, linguagem simples"
Exemplo 3: "Enfoque em tendências de 2025, IA generativa"
```

### **4. Gere os Tópicos**

Clique em **"Gerar X Tópicos Únicos"**

A IA irá:
1. Buscar todos os tópicos já existentes na categoria
2. Gerar novos tópicos com GPT-4o-mini
3. Validar cada tópico contra os existentes
4. Filtrar duplicatas e similares (>75% de similaridade)
5. Retornar apenas tópicos únicos e válidos

### **5. Revise os Resultados**

Você verá 3 métricas principais:

- **Validados** 🟢: Tópicos únicos e aprovados
- **Similares** 🟡: Tópicos muito parecidos (filtrados)
- **Duplicatas** 🔴: Tópicos idênticos (filtrados)

### **6. Copie para o Código**

Clique em **"📋 Copiar para types/blog.ts"**

Os tópicos serão copiados formatados:
```typescript
  'Tópico 1',
  'Tópico 2',
  'Tópico 3',
  // ...
```

### **7. Adicione ao Código**

1. Abra `types/blog.ts`
2. Localize a array `BLOG_TOPICS[categoria]`
3. Cole os novos tópicos dentro da array
4. Salve o arquivo

Exemplo:
```typescript
export const BLOG_TOPICS = {
  'Automação e Negócios': [
    // ... tópicos existentes
    'Por que toda empresa precisa de automação em 2025',
    'Como um site profissional aumenta sua credibilidade',
    // ... COLE OS NOVOS TÓPICOS AQUI
    'E-commerce: como vender mais com automação de marketing',
    'CRM inteligente: gestão de clientes com IA',
    // ...
  ],
}
```

### **8. Faça Commit**

```bash
git add types/blog.ts
git commit -m "feat(topics): adiciona 30 novos tópicos de Automação e Negócios"
git push origin main
```

---

## 🔍 Como Funciona a Validação de Similaridade

### **Algoritmos Utilizados**

O sistema usa 3 algoritmos complementares para detectar similaridade:

#### **1. Jaccard Similarity (50% do peso)**
Compara palavras únicas entre os tópicos.

```
Exemplo:
Novo:      "Como criar chatbots inteligentes com IA"
Existente: "Como desenvolver chatbots com inteligência artificial"

Palavras novo:      {como, criar, chatbots, inteligentes, com, ia}
Palavras existente: {como, desenvolver, chatbots, com, inteligência, artificial}

Interseção: {como, chatbots, com} = 3
União: {como, criar, chatbots, inteligentes, com, ia, desenvolver, inteligência, artificial} = 9

Jaccard = 3/9 = 0.33
```

#### **2. Longest Common Substring (25% do peso)**
Encontra a maior substring contínua compartilhada.

```
Novo:      "SEO para iniciantes"
Existente: "SEO para pequenas empresas"

LCS: "SEO para " = 9 caracteres
Score: 9 / max(19, 27) = 0.33
```

#### **3. Levenshtein Distance (25% do peso)**
Calcula o número mínimo de edições (inserir, deletar, substituir) para transformar uma string em outra.

```
Novo:      "Chatbots"
Existente: "Chatbot"

Distance: 1 (remover 's')
Normalized: 1 - (1/8) = 0.875
```

### **Score Final**

```typescript
Score = (Jaccard × 0.5) + (LCS × 0.25) + (Levenshtein × 0.25)
```

**Threshold**: 0.75 (75%)

- Score >= 0.75: **Tópico REJEITADO** (muito similar)
- Score < 0.75: **Tópico APROVADO** (único)

---

## 📊 Exemplos de Validação

### ✅ **Aprovado** (Score: 0.32)

```
Novo:      "Como automatizar vendas com chatbots"
Existente: "Integração de CRM com WhatsApp Business"

Score: 0.32 < 0.75 ✓
Razão: Palavras diferentes, contextos distintos
```

### ❌ **Rejeitado** (Score: 0.89)

```
Novo:      "Como criar um site profissional com Next.js"
Existente: "Como desenvolver um site profissional usando Next.js"

Score: 0.89 > 0.75 ✗
Razão: Mesma ideia, apenas palavras sinônimas (criar vs desenvolver)
```

### ❌ **Rejeitado** (Score: 1.0)

```
Novo:      "ChatGPT vs Claude: qual IA escolher"
Existente: "ChatGPT vs Claude: qual IA escolher"

Score: 1.0 > 0.75 ✗
Razão: Duplicata exata
```

---

## 🛠️ API Endpoints

### **POST /api/topics/batch-generate**

Gera múltiplos tópicos com validação.

**Request Body**:
```json
{
  "category": "Programação e IA",
  "count": 30,
  "prompt": "Foque em IA generativa e LLMs" // opcional
}
```

**Response**:
```json
{
  "success": true,
  "category": "Programação e IA",
  "validated": 28,
  "duplicates": 1,
  "similar": 1,
  "topics": [
    "Claude vs ChatGPT vs Gemini: qual IA escolher em 2025",
    "Prompts para programadores: otimize seu código com IA",
    // ... mais 26 tópicos
  ],
  "details": {
    "duplicates": ["Next.js vs Remix: qual escolher"],
    "similar": [
      {
        "new": "React Server Components explicado",
        "existing": "React Server Components: o futuro do React",
        "similarity": 0.82
      }
    ]
  },
  "message": "28 tópicos únicos gerados. 1 duplicata e 1 similar foram filtrados."
}
```

### **POST /api/topics/validate-similarity**

Valida um único tópico antes de adicionar.

**Request Body**:
```json
{
  "category": "Tech Aleatório",
  "topic": "Notion para produtividade empresarial",
  "threshold": 0.75 // opcional
}
```

**Response (Válido)**:
```json
{
  "valid": true,
  "message": "Tópico único e válido",
  "similarity": 0.42,
  "topSimilar": [
    {
      "topic": "Ferramentas de produtividade para devs",
      "similarity": 0.42
    }
  ]
}
```

**Response (Inválido - Similar)**:
```json
{
  "valid": false,
  "reason": "similar",
  "message": "Tópico muito similar a um existente (83% de similaridade)",
  "match": {
    "topic": "Notion: organize sua vida e trabalho",
    "similarity": 0.83,
    "usedAt": "2024-11-15T10:30:00Z"
  }
}
```

---

## 🎨 Interface Visual

O componente `BatchTopicGenerator` fornece:

- **Seleção de categoria** (dropdown)
- **Configuração de quantidade** (slider/input)
- **Prompt customizado** (textarea)
- **Botão de geração** com loading state
- **Resultados visuais** com cards coloridos:
  - 🟢 Validados (verde)
  - 🟡 Similares (amarelo)
  - 🔴 Duplicatas (vermelho)
- **Lista de tópicos aprovados** com scroll
- **Detalhes de filtrados** (expandível)
- **Botão copy-to-clipboard** formatado
- **Instruções passo-a-passo**

---

## ⚠️ Boas Práticas

### **DO** ✅

- Gere tópicos em lotes de 30-50 para balancear qualidade e diversidade
- Use contexto adicional para direcionar a IA quando necessário
- Revise os tópicos gerados antes de adicionar ao código
- Mantenha consistência no estilo de escrita dos tópicos
- Faça commit após adicionar novos tópicos

### **DON'T** ❌

- Não gere mais de 100 tópicos de uma vez (qualidade diminui)
- Não ignore tópicos similares filtrados sem revisar
- Não adicione tópicos manualmente sem validar similaridade
- Não misture estilos de escrita (perguntas + statements)
- Não repita palavras-chave excessivamente

---

## 🚀 Roadmap Futuro

- [ ] **Embeddings com OpenAI**: Usar embeddings para similaridade semântica mais precisa
- [ ] **Sugestões de melhoria**: IA sugere como melhorar tópicos similares
- [ ] **Histórico de gerações**: Rastrear todas as gerações em lote
- [ ] **Aprovação em massa**: Adicionar tópicos direto ao código via API
- [ ] **Análise de tendências**: Sugerir tópicos baseados em trends do Google
- [ ] **A/B testing**: Testar quais tópicos geram mais engajamento

---

## 📞 Suporte

Se encontrar problemas ou tiver sugestões:

1. Verifique os logs do console no navegador
2. Confira se OpenAI API key está configurada
3. Valide se Supabase está acessível
4. Abra um issue no GitHub com detalhes

---

**Desenvolvido com 💜 por Izadora Cury Pierette**
