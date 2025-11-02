# 🗄️ Configuração do Supabase para Blog Automatizado

Este guia mostra como configurar o Supabase para o sistema de blog automatizado com IA do CatBytes.

## 📋 Pré-requisitos

- Conta no Supabase (gratuita): https://supabase.com
- Node.js e npm instalados
- Projeto CatBytes clonado localmente

---

## 🚀 Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `catbytes-blog` (ou nome de sua preferência)
   - **Database Password**: Escolha uma senha forte (guarde-a!)
   - **Region**: Escolha a região mais próxima (South America para BR)
   - **Pricing Plan**: Free (suficiente para começar)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser criado

---

## 🗃️ Passo 2: Criar Tabelas do Blog

### Opção A: Via SQL Editor (Recomendado)

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New Query"**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql` deste projeto
4. Cole no editor SQL
5. Clique em **"Run"** (ou pressione Cmd/Ctrl + Enter)
6. Verifique se apareceu a mensagem de sucesso ✅

### Opção B: Via Interface (Mais demorado)

1. Vá em **Database** → **Tables**
2. Clique em **"Create a new table"**
3. Siga a estrutura definida no `schema.sql`

---

## 🔑 Passo 3: Obter Credenciais

### 3.1 URL e Anon Key (Públicas)

1. No dashboard, vá em **Settings** → **API**
2. Você verá:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...` (chave pública)

### 3.2 Service Role Key (Privada - NUNCA EXPONHA!)

1. Na mesma página **Settings** → **API**
2. Role para baixo até **service_role**
3. Clique em **"Reveal"** para ver a chave
4. ⚠️ **IMPORTANTE**: Esta chave tem acesso total ao banco!

---

## 🔧 Passo 4: Configurar Variáveis de Ambiente

1. Na raiz do projeto, copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

2. Edite `.env.local` e adicione as credenciais do Supabase:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...sua-service-key
```

3. **NUNCA** commite o arquivo `.env.local` ao Git!

---

## 📊 Passo 5: Verificar Tabelas

1. Vá em **Database** → **Tables**
2. Você deve ver:
   - ✅ `blog_posts` - Tabela principal de posts
   - ✅ `blog_generation_log` - Log de gerações

3. Clique em `blog_posts` para ver a estrutura:
   - `id` (UUID, Primary Key)
   - `title` (TEXT)
   - `slug` (TEXT, Unique)
   - `excerpt` (TEXT)
   - `content` (TEXT)
   - `cover_image_url` (TEXT)
   - `keywords` (TEXT[])
   - E outros campos...

---

## 🔒 Passo 6: Configurar Row Level Security (RLS)

As policies já foram criadas pelo SQL, mas vamos verificar:

1. Vá em **Authentication** → **Policies**
2. Selecione a tabela `blog_posts`
3. Deve haver 2 policies:
   - ✅ **"Anyone can read published posts"** - Leitura pública
   - ✅ **"Service role has full access"** - Acesso admin via API

Se não aparecerem, rode novamente o `schema.sql`.

---

## 🧪 Passo 7: Testar Conexão

### Via Código (Recomendado)

Crie um arquivo de teste: `test-supabase.js`

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('count')

  if (error) {
    console.error('❌ Erro:', error.message)
  } else {
    console.log('✅ Conectado ao Supabase!')
    console.log('📊 Posts no banco:', data)
  }
}

test()
```

Execute:
```bash
node test-supabase.js
```

---

## 🌐 Passo 8: Configurar no Vercel (Produção)

### Via Dashboard Vercel

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as 3 variáveis:

| Nome | Valor | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Production, Preview, Development |

4. Clique em **"Save"**
5. Faça um novo deploy para aplicar:
```bash
git commit --allow-empty -m "Trigger deploy with Supabase env vars"
git push
```

### Via Vercel CLI (Alternativa)

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## 📈 Passo 9: Monitorar Uso

1. No Supabase, vá em **Settings** → **Usage**
2. Monitore:
   - **Database size**: Limite de 500MB no plano free
   - **API requests**: 500k/mês no plano free
   - **Storage**: 1GB no plano free

3. Para o blog com 30 posts, o uso estimado é:
   - Database: ~50MB
   - API requests: ~10k/mês (com cache)
   - Storage: Não usado (imagens no OpenAI)

---

## 🔍 Troubleshooting

### Erro: "relation 'blog_posts' does not exist"

**Solução**: Execute o `schema.sql` novamente no SQL Editor

### Erro: "Invalid API key"

**Solução**: Verifique se copiou as chaves corretamente do Supabase

### Erro: "row level security policy violation"

**Solução**: Verifique se as policies estão ativas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'blog_posts';
```

### Posts não aparecem na API

**Solução**: Verifique se o campo `published` está `true`:
```sql
UPDATE blog_posts SET published = true WHERE published = false;
```

---

## 📚 Recursos Úteis

- [Documentação Oficial do Supabase](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo está configurado:

- [ ] Projeto criado no Supabase
- [ ] Tabelas criadas via `schema.sql`
- [ ] Variáveis de ambiente configuradas localmente (`.env.local`)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Conexão testada com sucesso
- [ ] RLS policies ativas e funcionando
- [ ] Monitoramento de uso configurado

---

## 🎉 Próximos Passos

Agora que o Supabase está configurado, você pode:

1. ✅ Testar a criação de posts via API
2. ✅ Configurar o cron job para automação
3. ✅ Visualizar posts no blog
4. ✅ Monitorar analytics no Supabase Dashboard

---

**🐱 Dúvidas?** Abra uma issue no repositório ou consulte a documentação oficial do Supabase!
