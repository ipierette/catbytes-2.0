# 📝 CatBytes AI Blog - Guia Completo

## 🎯 Visão Geral

Sistema de blog totalmente automatizado com IA para geração de tráfego orgânico através de conteúdo SEO-otimizado. Posts são criados automaticamente 3x por semana usando GPT-4 + DALL-E 3.

---

## ✨ Funcionalidades Implementadas

### 🤖 Automação Completa
- ✅ Geração automática de conteúdo com GPT-4 Turbo
- ✅ Criação de imagens de capa com DALL-E 3
- ✅ Agendamento via Vercel Cron (Terça, Quinta, Sábado às 10h BRT)
- ✅ Limite automático de 30 posts (remove os mais antigos)
- ✅ SEO otimizado (meta tags, keywords, slugs)

### 📱 Interface Moderna
- ✅ Página de blog responsiva com paginação
- ✅ Cards de post com animações
- ✅ Modal full-screen para leitura
- ✅ Seção "Posts Recentes" na homepage
- ✅ Compartilhamento social (FB, Twitter, LinkedIn, WhatsApp)
- ✅ Dark mode completo

### 🔧 Infraestrutura
- ✅ Supabase para armazenamento
- ✅ API Routes Next.js
- ✅ Type safety com TypeScript
- ✅ Edge runtime para performance
- ✅ Caching inteligente

---

## 📦 Instalação

### 1. Instalar Dependências

```bash
# Execute o script de instalação
bash install-blog-deps.sh

# Ou instale manualmente:
npm install @supabase/supabase-js openai marked slugify date-fns
```

### 2. Configurar Supabase

Siga o guia detalhado: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

Resumo:
1. Crie projeto no Supabase
2. Execute `supabase/schema.sql` no SQL Editor
3. Copie credenciais (URL, anon key, service key)
4. Adicione ao `.env.local`

### 3. Configurar Variáveis de Ambiente

Copie o exemplo e preencha:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# OpenAI
OPENAI_API_KEY=sk-...

# Vercel Cron (produção)
CRON_SECRET=seu_secret_aleatorio_aqui

# WhatsApp (opcional)
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

### 4. Testar Localmente

```bash
# Iniciar dev server
npm run dev

# Visitar
http://localhost:3000/pt-BR/blog
```

---

## 🚀 Uso

### Gerar Post Manualmente

#### Via API (desenvolvimento)

```bash
curl -X POST http://localhost:3000/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Como chatbots com IA transformam atendimento",
    "category": "Inteligência Artificial"
  }'
```

#### Via Navegador

Acesse (somente em dev):
```
http://localhost:3000/api/blog/generate
```

### Ver Posts

- **Blog completo**: `/pt-BR/blog` ou `/en-US/blog`
- **Homepage**: Seção "Posts Recentes" (2 últimos posts)

### Automação em Produção

Após deploy no Vercel:

1. O cron job roda automaticamente
2. Schedule: Terças, Quintas, Sábados às 13:00 UTC (10:00 BRT)
3. Monitore em: Vercel Dashboard > Deployments > Functions > Cron Jobs

Para testar o cron:

```bash
curl https://seu-site.vercel.app/api/blog/cron \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## 📊 Estrutura do Banco

### Tabela: `blog_posts`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Primary key |
| `title` | TEXT | Título do post |
| `slug` | TEXT | URL-friendly (único) |
| `excerpt` | TEXT | Resumo (150-200 chars) |
| `content` | TEXT | Conteúdo em Markdown |
| `cover_image_url` | TEXT | URL da imagem DALL-E |
| `keywords` | TEXT[] | Array de palavras-chave SEO |
| `seo_title` | TEXT | Meta title otimizado |
| `seo_description` | TEXT | Meta description |
| `published` | BOOLEAN | Publicado ou rascunho |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Última atualização |
| `views` | INTEGER | Contador de visualizações |
| `category` | TEXT | Categoria do post |
| `tags` | TEXT[] | Tags relacionadas |

---

## 🎨 Customização

### Alterar Tópicos de Geração

Edite: `types/blog.ts`

```typescript
export const BLOG_TOPICS = [
  'Seu novo tópico aqui',
  'Outro tópico interessante',
  // ...
] as const
```

### Alterar Keywords SEO

Edite: `types/blog.ts`

```typescript
export const SEO_KEYWORDS = [
  'sua keyword',
  'outra keyword',
  // ...
] as const
```

### Customizar Prompt de Geração

Edite: `app/api/blog/generate/route.ts`

Procure por `contentPrompt` e ajuste as instruções.

### Alterar Frequência do Cron

Edite: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/blog/cron",
      "schedule": "0 10 * * 1,3,5"  // Segunda, Quarta, Sexta às 10h UTC
    }
  ]
}
```

Formato cron: `minuto hora dia-do-mês mês dia-da-semana`

---

## 🔐 Segurança

### Proteção do Cron Endpoint

O endpoint `/api/blog/cron` é protegido por Bearer token:

```typescript
// app/api/blog/cron/route.ts
const authHeader = request.headers.get('authorization')
const cronSecret = process.env.CRON_SECRET

if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**IMPORTANTE**: Configure `CRON_SECRET` em produção!

### Row Level Security (RLS)

Supabase RLS ativado:
- ✅ Leitura pública de posts publicados
- ✅ Apenas service role pode criar/editar/deletar

---

## 📈 Monitoramento

### Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Functions** > **Cron Jobs**
4. Veja logs e histórico de execuções

### Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Table Editor** > `blog_posts`
4. Monitore posts criados
5. Veja logs em `blog_generation_log`

### Logs de Geração

```sql
-- Ver últimas gerações
SELECT * FROM blog_generation_log
ORDER BY created_at DESC
LIMIT 10;

-- Ver posts criados hoje
SELECT title, created_at, views
FROM blog_posts
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### Post não foi gerado no cron

1. Verifique logs no Vercel Dashboard
2. Confirme que `CRON_SECRET` está configurado
3. Teste manualmente: `curl` no endpoint `/api/blog/cron`

### Erro "OpenAI API key not configured"

Adicione `OPENAI_API_KEY` ao `.env.local` e no Vercel

### Erro "Supabase admin client not configured"

Adicione `SUPABASE_SERVICE_ROLE_KEY` ao `.env.local` e no Vercel

### Imagens não aparecem

1. DALL-E 3 retorna URLs temporárias
2. Considere fazer upload para Supabase Storage (opcional)
3. Ou salvar base64 no banco (não recomendado - consome muito espaço)

### Posts não aparecem na homepage

1. Verifique se `published = true` no banco
2. Confira se há posts criados: `SELECT COUNT(*) FROM blog_posts;`
3. Limpe cache do Next.js: `rm -rf .next`

---

## 💰 Custos Estimados

### OpenAI (por post)
- GPT-4 Turbo: ~$0.10 - $0.20
- DALL-E 3: ~$0.04 - $0.08
- **Total por post**: ~$0.14 - $0.28

### Automação (3x/semana)
- **Por mês**: ~12 posts = $1.68 - $3.36/mês

### Supabase
- Plano Free: até 500MB (suficiente para ~1000 posts)
- Custo: **$0/mês** (no plano free)

### Vercel
- Cron Jobs: Inclusos no plano Hobby
- Custo: **$0/mês** (ou $20/mês se Pro)

**TOTAL ESTIMADO**: ~$2-4/mês

---

## 🎯 Estratégia de SEO

### Keywords Alvo
- automação com IA
- chatbots personalizados
- aplicações web inteligentes
- serviços digitais
- desenvolvimento web com IA

### Estrutura de Conteúdo
1. Título impactante (50-60 chars)
2. Introdução clara (problema + solução)
3. Conteúdo escaneável (listas, subtítulos)
4. Exemplos práticos
5. CTA ao final

### Link Building
- Compartilhamento social facilitado
- Links internos para contato
- URLs amigáveis (slugs)

---

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🤝 Contribuindo

Se encontrar bugs ou tiver sugestões:

1. Verifique os logs (Vercel + Supabase)
2. Teste localmente
3. Documente o problema
4. Implemente a solução
5. Commit com mensagem descritiva

---

## 📜 Licença

Este projeto é parte do portfolio CatBytes.

---

**🐱 Dúvidas?** Entre em contato via WhatsApp (botão flutuante no site) ou email!
