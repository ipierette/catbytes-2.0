# 🎨 Preview de Emails - Guia Rápido

## Como visualizar os templates antes de enviar

Agora você pode ver como os emails ficam **antes de enviar para assinantes!**

---

## 🚀 Acesse no Navegador

Abra seu navegador e acesse uma destas URLs:

### 📧 Email de Boas-Vindas

```
http://localhost:3000/api/email-preview?template=welcome&locale=pt-BR
http://localhost:3000/api/email-preview?template=welcome&locale=en-US
```

### 🚀 Email de Novo Post

```
http://localhost:3000/api/email-preview?template=new-post&locale=pt-BR
http://localhost:3000/api/email-preview?template=new-post&locale=en-US
```

### 🏠 Página Principal (lista todos)

```
http://localhost:3000/api/email-preview
```

---

## 🎯 Workflow de Edição

1. **Abra o template que quer editar:**
   - `lib/email-templates/welcome-email.ts` (boas-vindas)
   - `lib/email-templates/new-post-email.ts` (novo post)

2. **Faça suas alterações** (cores, tamanhos, textos, etc)

3. **Salve o arquivo** (Cmd+S / Ctrl+S)

4. **Abra/Recarregue o preview no navegador** (F5)

5. **Veja as mudanças imediatamente!**

---

## 🔧 Parâmetros da URL

| Parâmetro | Valores | Descrição |
|-----------|---------|-----------|
| `template` | `welcome`, `new-post` | Qual email visualizar |
| `locale` | `pt-BR`, `en-US` | Idioma do email |

**Exemplos:**
```
?template=welcome&locale=pt-BR    → Boas-vindas em português
?template=new-post&locale=en-US   → Novo post em inglês
```

---

## 💡 Dicas

### Testar em diferentes tamanhos

1. **Desktop:** Navegador normal
2. **Mobile:** 
   - Chrome: F12 → Toggle device toolbar
   - Firefox: F12 → Responsive Design Mode
   - Safari: Develop → Enter Responsive Design Mode

### Testar cores do tema

O preview usa as **mesmas cores** que serão enviadas por email, então você vê exatamente como vai ficar!

### Ver código fonte

- Clique direito → "Ver código-fonte" para ver o HTML gerado
- Útil para debug

---

## 🐛 Problemas Comuns

### Preview não atualiza?

**Solução 1:** Hard refresh
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

**Solução 2:** Limpar cache
- Chrome: DevTools (F12) → Network → Disable cache

**Solução 3:** Reiniciar servidor
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

### Imagens não aparecem?

Verifique se o servidor está rodando:
```bash
lsof -ti:3000 && echo "✅ Servidor OK" || echo "❌ Iniciar com 'npm run dev'"
```

---

## 📱 Como Testar em Email Real

Se quiser testar como fica **em um cliente de email real** (Gmail, Outlook, etc):

### Opção 1: Script de teste
```bash
node scripts/test-newsletter-email.js
```

### Opção 2: Se inscrever na newsletter
1. Acesse: http://localhost:3000
2. Inscreva-se na newsletter
3. Verifique seu email (ipierette2@gmail.com)

---

## 🎨 Alterações Aplicadas

### ✅ Email de Boas-Vindas
- ✨ **Corrigido:** Logo desenvolvedora não está mais distorcida
- 🎯 Ambas as logos com **80px de altura** (proporção mantida)
- 📐 Usamos `<table>` ao invés de `flex` (compatibilidade email)

### ✅ Email de Novo Post
- 🔼 **Aumentado:** Logo CatBytes de 80px → **100px**
- 🌑 **Corrigido:** Footer agora tem **fundo escuro** (#1a1a2e)
- ✨ Logo desenvolvedora **80px** em fundo escuro (visível!)
- 🎨 Gradiente escuro no footer combina com header

---

## 📊 Comparação Antes/Depois

### Email de Boas-Vindas

**Antes:**
```css
height: 100px  /* Logo desenvolvedora distorcida */
display: flex  /* Não funciona em email */
```

**Depois:**
```css
height: 80px   /* Ambas iguais, não distorce */
<table>        /* Compatível com email */
```

### Email de Novo Post

**Antes:**
```css
/* Header */
logo: 80px           /* Muito pequena */

/* Footer */
background: #f9fafb /* Fundo claro, logo sumia */
logo: 60px          /* Muito pequena */
```

**Depois:**
```css
/* Header */
logo: 100px          /* Maior, mais visível */

/* Footer */
background: #1a1a2e  /* Fundo ESCURO */
logo: 80px           /* Maior */
```

---

## 🚀 Próximos Passos

Agora você pode:

1. **Visualizar** todos os emails no navegador
2. **Editar** os templates facilmente
3. **Testar** antes de gerar posts reais
4. **Iterar** rapidamente até ficar perfeito

**Acesse agora:**
👉 http://localhost:3000/api/email-preview

---

**Última atualização:** 3 de novembro de 2025  
**Mantido por:** Equipe CatBytes 🐱
