# 🔍 SEO Checklist - CatBytes

## ✅ **Correções Aplicadas no Código**

### 1. **robots.txt** - CORRIGIDO ✅
- ❌ Antes: `Sitemap: https://catbytes.netlify.app/sitemap.xml`
- ✅ Agora: `Sitemap: https://catbytes.site/sitemap.xml`
- ➕ Adicionado bloqueio: `/api/` e `/admin/`

### 2. **sitemap.xml** - ATUALIZADO ✅
- ❌ Antes: URLs para `catbytes.netlify.app`
- ✅ Agora: URLs para `catbytes.site`
- ➕ Adicionado: páginas de blog (`/pt-BR/blog`, `/en-US/blog`)
- ➕ Atualizado: `lastmod` para 2025-11-07

### 3. **app/sitemap.ts** - MELHORADO ✅
- ❌ Antes: `baseUrl = 'https://catbytes.com'`
- ✅ Agora: `baseUrl = 'https://catbytes.site'`
- ➕ Adicionado: **Busca automática de posts do Supabase**
- ➕ Agora inclui: Todos os posts publicados com slugs individuais
- ➕ Metadata: `changeFrequency` e `priority` otimizadas

### 4. **app/layout.tsx** - CORRIGIDO ✅
- ❌ Antes: `metadataBase: new URL('https://catbytes.com')`
- ✅ Agora: `metadataBase: new URL('https://catbytes.site')`
- ➕ Adicionado: **JSON-LD Structured Data (Schema.org Person)**
- ➕ Inclui: `name`, `jobTitle`, `url`, `sameAs`, `knowsAbout`

### 5. **components/blog/BlogPostSchema.tsx** - CRIADO ✅
- ✅ Novo componente para adicionar **Schema.org BlogPosting** em cada artigo
- ✅ Inclui: `headline`, `datePublished`, `author`, `publisher`, `image`
- ✅ Melhora: Indexação de artigos individuais no Google

---

## 🚀 **Próximos Passos no Google Search Console**

### **Passo 1: Verificar Propriedade do Domínio**
1. Acesse: [Google Search Console](https://search.google.com/search-console)
2. Clique em **"Adicionar Propriedade"**
3. Escolha **"Domínio"** (não "Prefixo do URL")
4. Digite: `catbytes.site`
5. Copie o registro TXT DNS fornecido
6. Adicione no seu provedor de domínio (ex: GoDaddy, Namecheap, Cloudflare)
7. Aguarde verificação (pode levar 24-48h)

### **Passo 2: Submeter Sitemap**
1. No Search Console, vá em **"Sitemaps"** (menu lateral)
2. Digite: `https://catbytes.site/sitemap.xml`
3. Clique em **"Enviar"**
4. Status deve mudar para **"Sucesso"** após algumas horas

### **Passo 3: Solicitar Indexação Manual**
1. No Search Console, vá em **"Inspeção de URL"** (topo da página)
2. Digite URLs importantes:
   - `https://catbytes.site/`
   - `https://catbytes.site/pt-BR`
   - `https://catbytes.site/en-US`
   - `https://catbytes.site/pt-BR/blog`
3. Se aparecer "URL não está no Google", clique em **"Solicitar indexação"**
4. Repita para cada URL importante

### **Passo 4: Verificar se o domínio atual está correto**
1. Verifique qual URL você usa em produção:
   - Se for `catbytes-portfolio.vercel.app` → Configure domínio customizado no Vercel
   - Se for `catbytes.site` → Certifique-se de que o DNS aponta corretamente
2. No Vercel (se aplicável):
   - Vá em **Settings → Domains**
   - Adicione `catbytes.site` como domínio customizado
   - Configure DNS conforme instruções do Vercel

---

## ⏱️ **Tempo Esperado de Indexação**

| Ação | Tempo Estimado |
|------|----------------|
| Verificação de propriedade | 24-48 horas |
| Primeira indexação (homepage) | 2-7 dias |
| Indexação completa do sitemap | 1-4 semanas |
| Aparecer nas buscas | 2-6 semanas |

**⚠️ IMPORTANTE:** Sites novos podem levar até **4-6 semanas** para aparecerem nas buscas. Isso é normal!

---

## 🔎 **Como Testar se Está Funcionando**

### **Teste 1: Inspeção de URL**
```
https://search.google.com/search-console
→ Inspeção de URL
→ Digite: https://catbytes.site
→ Deve mostrar: "URL está no Google"
```

### **Teste 2: Busca no Google**
```
site:catbytes.site
```
- ✅ Se aparecer resultados: Site está indexado!
- ❌ Se não aparecer: Aguarde mais tempo ou verifique erros no Search Console

### **Teste 3: Busca pelo Nome**
```
Izadora Cury Pierette
```
- Após 2-4 semanas, seu site deve aparecer nos primeiros resultados

---

## 📊 **Checklist de Validação**

### **No Código** ✅
- [x] `robots.txt` aponta para `https://catbytes.site/sitemap.xml`
- [x] `sitemap.xml` usa URLs `catbytes.site`
- [x] `app/sitemap.ts` busca posts do Supabase
- [x] `app/layout.tsx` tem `metadataBase` correto
- [x] JSON-LD Schema.org adicionado (Person)
- [x] Componente `BlogPostSchema.tsx` criado

### **No Google Search Console** 🔲
- [ ] Propriedade `catbytes.site` verificada
- [ ] Sitemap `https://catbytes.site/sitemap.xml` submetido
- [ ] Homepage indexada (busca: `site:catbytes.site`)
- [ ] Posts de blog indexados
- [ ] Nenhum erro de cobertura reportado

### **No Vercel/DNS** 🔲
- [ ] Domínio `catbytes.site` configurado
- [ ] DNS A/CNAME apontando corretamente
- [ ] HTTPS funcionando (SSL)
- [ ] `.env.local` usando `NEXT_PUBLIC_SITE_URL="https://catbytes.site"`

---

## 🛠️ **Comandos Úteis**

### **Testar robots.txt localmente:**
```bash
curl https://catbytes.site/robots.txt
```

### **Testar sitemap.xml:**
```bash
curl https://catbytes.site/sitemap.xml
```

### **Validar Schema.org:**
1. Acesse: https://validator.schema.org/
2. Cole o HTML da sua página
3. Verifique se não há erros

---

## 📝 **Notas Importantes**

1. **Domínio Principal:** Certifique-se de que `catbytes.site` é seu domínio oficial
2. **Redirects:** Se ainda usa `catbytes-portfolio.vercel.app`, configure redirect 301 para `catbytes.site`
3. **Social Media:** Atualize links em Instagram, LinkedIn, GitHub para `https://catbytes.site`
4. **Analytics:** Configure Google Analytics 4 para acompanhar tráfego

---

## 🆘 **Problemas Comuns**

### **"URL não está no Google" após 2 semanas**
- Verifique se o sitemap foi aceito sem erros
- Certifique-se de que `robots.txt` não bloqueia Google
- Solicite indexação manual novamente

### **"Erro de DNS" no Search Console**
- Verifique se DNS aponta para servidor correto
- Aguarde propagação DNS (24-48h)

### **"Sitemap não pode ser lido"**
- Teste acesso direto: `https://catbytes.site/sitemap.xml`
- Verifique se retorna XML válido (não erro 404)

---

## ✨ **Melhorias Futuras**

1. **Adicionar BlogPostSchema nos posts:**
   - Importe `BlogPostSchema` em páginas de blog
   - Passe dados do post como props

2. **Google Analytics 4:**
   - Configure GA4 para métricas avançadas
   - Conecte com Search Console

3. **Backlinks:**
   - Compartilhe seu site em redes sociais
   - Adicione link no GitHub profile
   - Registre em diretórios de desenvolvedores

4. **Performance:**
   - Use ferramentas: PageSpeed Insights, Lighthouse
   - Otimize imagens (WebP, lazy loading)

---

## 📞 **Recursos de Ajuda**

- **Google Search Console:** https://search.google.com/search-console
- **Schema.org Validator:** https://validator.schema.org/
- **Rich Results Test:** https://search.google.com/test/rich-results
- **PageSpeed Insights:** https://pagespeed.web.dev/

---

**Última atualização:** 07/11/2025
**Status:** ✅ Código corrigido - Aguardando submissão no Google Search Console
