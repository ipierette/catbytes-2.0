# Configuração do Token do GitHub

Este guia explica como configurar o token do GitHub para melhorar os stats dinâmicos do portfolio.

## Por que usar um token?

**Sem token:**
- ❌ Limite de 60 requisições/hora
- ❌ Contagem de commits é apenas estimativa
- ❌ Dados podem ficar desatualizados

**Com token:**
- ✅ Limite de 5.000 requisições/hora
- ✅ Acesso a dados mais precisos
- ✅ Melhor performance e cache

## Passo a Passo

### 1. Criar o Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Configure:
   - **Note**: `CatBytes Portfolio Stats`
   - **Expiration**: `No expiration` (ou escolha um período)
   - **Scopes**: Selecione apenas:
     - ✅ `public_repo` (para repositórios públicos)
4. Clique em **"Generate token"**
5. **IMPORTANTE**: Copie o token imediatamente (ele aparece apenas uma vez!)

### 2. Configurar no Projeto

1. Na raiz do projeto, crie o arquivo `.env.local`:

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local
```

2. Edite `.env.local` e adicione seu token:

```bash
GITHUB_TOKEN=ghp_seu_token_aqui
```

3. Salve o arquivo

### 3. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Reinicie
npm run dev
```

## Verificação

Abra o console do navegador (F12) e procure por logs como:

```
[API] Fetching GitHub stats... { hasToken: true }
[API] GitHub stats fetched successfully: { ... }
```

Se aparecer `hasToken: true`, o token está configurado corretamente! ✅

## Segurança

⚠️ **NUNCA** commite o arquivo `.env.local` ao Git!
- O arquivo `.env.local` já está no `.gitignore`
- O token é usado apenas no servidor (API route)
- Nunca é exposto ao cliente/navegador

## Arquivos Criados

- ✅ `/app/api/github-stats/route.ts` - API route segura
- ✅ `/.env.local.example` - Template de configuração
- ✅ `/components/ui/github-stats.tsx` - Componente atualizado

## Troubleshooting

**Token não funciona?**
- Verifique se copiou o token completo
- Certifique-se que o scope `public_repo` está selecionado
- Reinicie o servidor de desenvolvimento

**Ainda vê dados antigos?**
- Limpe o cache: `rm -rf .next`
- Faça hard refresh no navegador: `Ctrl+Shift+R`

## Deployment (Vercel/Netlify)

Adicione a variável de ambiente no dashboard do seu provider:

**Vercel:**
1. Settings → Environment Variables
2. Adicione: `GITHUB_TOKEN` = `seu_token`

**Netlify:**
1. Site settings → Environment variables
2. Adicione: `GITHUB_TOKEN` = `seu_token`
