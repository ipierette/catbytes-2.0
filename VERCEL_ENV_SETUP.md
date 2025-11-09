# Configuração de Variáveis de Ambiente na Vercel

## ⚠️ Problema: Páginas de artigos do blog não carregam em produção

### Causa
As páginas podem não estar carregando porque:
1. Variáveis de ambiente não configuradas na Vercel
2. Edge Runtime incompatível com algumas operações
3. `NEXT_PUBLIC_SITE_URL` não definida

### Solução Aplicada

1. **Mudança de Edge Runtime para Node.js Runtime**
   - Alterado em `/app/api/blog/posts/[slug]/route.ts`
   - Node.js Runtime é mais estável e compatível com Supabase

2. **Adição de VERCEL_URL automática**
   - Agora usa `VERCEL_URL` automaticamente quando disponível
   - Fallback para `NEXT_PUBLIC_SITE_URL` e `localhost`

3. **Force Dynamic Rendering**
   - Páginas são geradas dinamicamente em vez de estaticamente
   - Evita problemas durante o build

## 📋 Variáveis de Ambiente Necessárias na Vercel

Certifique-se de que as seguintes variáveis estão configuradas no **Vercel Dashboard**:

### Production, Preview e Development

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lbjekucdxgouwgegpdhi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>

# Site URL (use o domínio de produção)
NEXT_PUBLIC_SITE_URL=https://catbytes.site

# OpenAI (para geração de conteúdo)
OPENAI_API_KEY=<sua_openai_key>

# GitHub (para stats)
GITHUB_TOKEN=<seu_github_token>

# Admin (para acesso ao painel)
ADMIN_PASSWORD=<sua_senha_admin>
```

## 🔧 Passos para Configurar na Vercel

1. Acesse https://vercel.com/seu-usuario/catbytes-2-0/settings/environment-variables
2. Adicione cada variável acima
3. Marque os ambientes: **Production**, **Preview**, **Development**
4. Clique em "Save"
5. Faça um novo deploy ou redeploy

## ✅ Verificação

Após configurar, teste:
1. Acesse uma página de artigo: `https://catbytes.site/pt-BR/blog/[slug]`
2. Verifique os logs no Vercel Dashboard
3. Teste com diferentes slugs de artigos

## 🐛 Debug

Se ainda não funcionar, verifique:
1. **Logs da Vercel**: https://vercel.com/seu-usuario/catbytes-2-0/logs
2. **Build logs**: Procure por erros relacionados a `getPost` ou `generateStaticParams`
3. **Runtime logs**: Procure por erros de API ou Supabase

## 📝 Notas Importantes

- A variável `VERCEL_URL` é automática (não precisa configurar)
- `NEXT_PUBLIC_*` são variáveis expostas no client-side
- Variáveis sem `NEXT_PUBLIC_` são server-side only
