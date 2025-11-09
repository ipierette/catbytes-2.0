# 📝 Guia Completo: Como Escrever Artigos Manuais

Este guia mostra **exatamente** como criar artigos bonitos e organizados no CatBytes.

---

## 🎨 Estrutura Visual do Template

O template possui **3 layouts diferentes** que se adaptam automaticamente ao número de imagens:

### ✅ Layout 1: COM 2 IMAGENS (Revista Completa)
```
┌─────────────────────────────────────────┐
│         CAPA (imagem de destaque)       │
└─────────────────────────────────────────┘

┌──────────────────┬──────────────┐
│  INTRODUÇÃO      │  💡 DESTAQUE │
│  (2/3 largura)   │  (caixa rosa)│
└──────────────────┴──────────────┘

┌──────────────┬──────────────────┐
│  IMAGEM 1    │  TEXTO MEIO      │
│  (metade)    │  (metade)        │
└──────────────┴──────────────────┘

┌──────────────────┬──────────────┐
│  IMAGEM 2        │  📌 SAIBA +  │
│  (grande)        │  (caixa roxa)│
└──────────────────┴──────────────┘

┌─────────────────────────────────┐
│  CONCLUSÃO                      │
│  (largura total)                │
└─────────────────────────────────┘
```

### ✅ Layout 2: COM 1 IMAGEM (Revista Simples)
```
┌─────────────────────────────────────────┐
│         CAPA (imagem de destaque)       │
└─────────────────────────────────────────┘

┌──────────────────┬──────────────┐
│  INTRODUÇÃO      │  📌 DESTAQUE │
│  (2/3 largura)   │  (caixa roxa)│
└──────────────────┴──────────────┘

┌─────────────────────────────────┐
│       IMAGEM 1                  │
│   (centralizada, moldura)       │
└─────────────────────────────────┘

┌──────────────────┬──────────────┐
│  CONCLUSÃO       │  📊 INFO     │
│  (2/3 largura)   │  (stats)     │
└──────────────────┴──────────────┘
```

### ✅ Layout 3: SEM IMAGENS (Minimalista)
```
┌─────────────────────────────────────────┐
│         CAPA (imagem de destaque)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────┐
│  CONTEÚDO COMPLETO              │
│  (centralizado, max 4xl)        │
│  ✨ Letra Capital ativa         │
└─────────────────────────────────┘
```

---

## 📐 Como Dividir o Conteúdo

O sistema divide automaticamente seu texto em **3 seções** usando `---`:

```markdown
Sua introdução aqui.
Este é o primeiro parágrafo com letra capital.

Mais texto introdutório...

---

Aqui começa a parte do meio.
Explicações, exemplos, detalhes.

---

Conclusão e chamada para ação.
Reflexões finais.
```

### ⚠️ Regras Importantes:

1. **Sempre use `---`** para dividir as seções (exatamente 3 hífens)
2. **Primeira seção** = Introdução (aparece ao lado da caixa de destaque)
3. **Segunda seção** = Meio (aparece ao lado da imagem 1, se houver)
4. **Terceira seção** = Conclusão (aparece após todas as imagens)

---

## 🖼️ Como Preparar as Imagens

### Imagem de Capa (obrigatória)
- **Tamanho recomendado:** 1200x630px (16:9)
- **Peso máximo:** 5MB
- **Formato:** JPG, PNG ou WebP
- **Conteúdo:** Deve representar o tema principal do artigo

### Imagens de Conteúdo (0 a 2)
- **Tamanho recomendado:** 800x600px ou maior
- **Peso máximo:** 5MB cada
- **Formato:** JPG, PNG ou WebP
- **Função:**
  - **Imagem 1:** Ilustra conceitos da seção do meio
  - **Imagem 2:** Reforça a conclusão ou mostra exemplos

---

## ✍️ Template Pronto para Copiar

```markdown
# [Título Principal do Artigo]

Primeiro parágrafo com introdução clara e objetiva. Este parágrafo terá a **letra capital** automaticamente aplicada.

Continue a introdução explicando o contexto, problema ou oportunidade que o artigo aborda.

Adicione mais 1-2 parágrafos para contextualizar bem o leitor.

---

## Desenvolvimento do Tema

Aqui você desenvolve as ideias principais:

- **Tópico 1:** Explicação detalhada
- **Tópico 2:** Exemplos práticos
- **Tópico 3:** Casos de uso

Você pode usar listas, **negritos**, *itálicos* e até código:

```js
const exemplo = "Use blocos de código quando necessário"
```

Continue desenvolvendo o raciocínio de forma lógica e progressiva.

---

## Conclusão

Recapitule os pontos principais do artigo de forma concisa.

Ofereça próximos passos ou reflexões finais para o leitor.

Finalize com uma chamada para ação ou mensagem inspiradora.
```

---

## 📊 Campos Obrigatórios no Editor

Ao criar um artigo manual, preencha:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Título** | Título principal (50-70 caracteres) | "Como criar um chatbot com IA que realmente entende seus clientes" |
| **Resumo** | Descrição curta (120-160 caracteres) | "Aprenda a criar chatbots inteligentes que oferecem experiências naturais e eficientes" |
| **Tags** | Separadas por vírgula (3-5 tags) | `IA, chatbot, automação, desenvolvimento, UX` |
| **Destaque** | Citação marcante (1-2 frases) | "Criar um chatbot com IA é desenvolver uma experiência de comunicação, unindo tecnologia e empatia." |
| **Conteúdo** | Markdown completo com `---` | (Use o template acima) |

---

## 🎯 Checklist de Qualidade

Antes de publicar, verifique:

- [ ] **Título:** Claro, objetivo e com até 70 caracteres
- [ ] **Resumo:** Conciso e atrativo (120-160 caracteres)
- [ ] **Destaque:** Frase impactante que aparecerá na caixa colorida
- [ ] **Tags:** 3 a 5 tags relevantes (sem #)
- [ ] **Divisões:** Conteúdo dividido com `---` (3 seções)
- [ ] **Letra Capital:** Primeiro parágrafo suficientemente longo
- [ ] **Imagens:** Capa + 0-2 imagens de conteúdo (máx 5MB cada)
- [ ] **Markdown:** Formatação correta (títulos, listas, negritos)
- [ ] **Ortografia:** Texto revisado e sem erros

---

## 🎨 Dicas de Estilo

### ✅ Faça:
- Use parágrafos curtos (2-4 linhas)
- Alterne entre texto corrido e listas
- Destaque palavras-chave em **negrito**
- Use subtítulos (##) para organizar
- Escreva de forma objetiva e clara

### ❌ Evite:
- Parágrafos muito longos (>5 linhas)
- Blocos de texto sem quebras
- Excesso de formatação
- Texto genérico ou vago
- Títulos muito extensos

---

## 🚀 Exemplo Completo Real

Veja o arquivo `artigo-chatbot-IA.md` na raiz do projeto como referência de um artigo bem estruturado.

### Estrutura do exemplo:
1. **Introdução** (3 parágrafos) → Aparece ao lado da caixa "💡 Destaque"
2. **4 Seções numeradas** (1-4) → Desenvolvimento com exemplos e código
3. **Conclusão** (2 parágrafos) → Fechamento com call-to-action

---

## 🛠️ Solução de Problemas

### "A caixa de destaque não aparece"
✅ **Solução:** Preencha o campo "Destaque" no editor. Se estiver vazio, a caixa não renderiza.

### "As imagens ficam muito grandes"
✅ **Solução:** O sistema ajusta automaticamente. Use imagens com proporção 4:3 ou 16:9.

### "A letra capital não aparece"
✅ **Solução:** O primeiro parágrafo deve ter pelo menos 100 caracteres para a letra capital ficar bonita.

### "O layout ficou quebrado"
✅ **Solução:** Certifique-se de usar `---` (exatamente 3 hífens) entre as seções.

---

## 💡 Próximos Passos

1. Copie o **Template Pronto** acima
2. Substitua pelo seu conteúdo
3. Prepare 3 imagens (capa + 2 de conteúdo)
4. Preencha todos os campos no editor
5. Clique em "Publicar" e veja o resultado!

---

**Última atualização:** 9 de novembro de 2025  
**Versão:** 2.0 (Template Definitivo)
