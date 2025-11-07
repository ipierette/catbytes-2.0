# 🚀 Guia Rápido - Aplicar Migration e Usar Novas Funcionalidades

## 📦 Passo 1: Aplicar Migration no Supabase

### Opção A: Via Supabase Dashboard (RECOMENDADO)
1. Acesse https://supabase.com/dashboard/project/SEU_PROJETO
2. Vá em **Database** → **SQL Editor**
3. Clique em **New query**
4. Copie TODO o conteúdo de: `supabase/migrations/20251107_add_advanced_seo_and_soft_delete.sql`
5. Cole no editor SQL
6. Clique em **Run** (botão verde no canto inferior direito)
7. Aguarde confirmação: "Success. No rows returned"

### Opção B: Via Supabase CLI
```bash
cd /Users/Izadora1/Desktop/programacao/projetos/catbytes-2.0
supabase db push
```

---

## ✅ Passo 2: Verificar se Migration foi Aplicada

Execute este SQL no Supabase para verificar:

```sql
-- Verificar se os novos campos existem
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
  AND column_name IN (
    'meta_description', 
    'canonical_url', 
    'status', 
    'deleted_at', 
    'scheduled_at'
  );

-- Resultado esperado: 5 linhas (uma para cada campo)
```

Se retornar 5 linhas, a migration foi aplicada com sucesso! ✅

---

## 🎨 Passo 3: Usar a API de Edição de Posts

### Exemplo 1: Editar Título e SEO
```typescript
const response = await fetch('/api/blog/edit', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Envia o cookie admin_token
  body: JSON.stringify({
    postId: 'ID_DO_POST_AQUI',
    title: 'Novo Título Otimizado para SEO',
    meta_description: 'Descrição atrativa de 120 caracteres que aparecerá no Google para melhorar o CTR e rankeamento orgânico',
    canonical_url: 'https://catbytes.site/blog/novo-titulo-otimizado'
  })
})

const data = await response.json()
console.log(data.post) // Post atualizado
```

### Exemplo 2: Mudar Status para Rascunho
```typescript
const response = await fetch('/api/blog/edit', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    postId: 'ID_DO_POST_AQUI',
    status: 'draft' // Tira do ar imediatamente
  })
})
```

### Exemplo 3: Agendar Publicação
```typescript
const response = await fetch('/api/blog/edit', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    postId: 'ID_DO_POST_AQUI',
    status: 'scheduled',
    scheduled_at: '2025-11-10T10:00:00Z' // Publicar em 10/11/2025 às 10h UTC
  })
})
```

---

## 📸 Passo 4: Fazer Upload Manual de Imagens

### Exemplo em JavaScript (Frontend)
```typescript
const handleImageUpload = async (file: File, postId?: string) => {
  const formData = new FormData()
  formData.append('image', file)
  
  if (postId) {
    formData.append('postId', postId) // Atualiza post automaticamente
  }
  
  formData.append('fileName', 'minha-imagem-personalizada')

  const response = await fetch('/api/blog/upload-image', {
    method: 'POST',
    credentials: 'include',
    body: formData
  })

  const data = await response.json()
  
  if (data.success) {
    console.log('Imagem URL:', data.imageUrl)
    // Exemplo: https://supabase.../blog-covers/minha-imagem-1234567890.webp
  }
}

// Uso em um input file
<input 
  type="file" 
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file, 'POST_ID_OPCIONAL')
  }}
/>
```

### Exemplo com cURL (Terminal)
```bash
# Upload simples
curl -X POST http://localhost:3000/api/blog/upload-image \
  -H "Cookie: admin_token=SEU_TOKEN_JWT" \
  -F "image=@/Users/Izadora1/Desktop/minha-foto.jpg"

# Upload e atualiza post
curl -X POST http://localhost:3000/api/blog/upload-image \
  -H "Cookie: admin_token=SEU_TOKEN_JWT" \
  -F "image=@/Users/Izadora1/Desktop/minha-foto.jpg" \
  -F "postId=abc-123-def" \
  -F "fileName=capa-personalizada"
```

---

## 🔍 Passo 5: Ver Posts no Admin com Botão de Edição

### Atualizar Página Admin (Já implementado!)
O botão **"Editar"** já foi adicionado aos cards de posts em `components/blog/post-card.tsx`.

Para usar no admin, basta passar a prop `onEdit`:

```tsx
// Em app/admin/blog/page.tsx
<PostCard
  post={post}
  onClick={() => {/* abrir modal de leitura */}}
  onEdit={() => {
    // Abrir modal de edição com dados do post
    setEditingPost(post)
    setPreviewModalOpen(true)
  }}
  onDelete={() => handleDeletePost(post.id)}
  onTranslate={() => handleTranslatePost(post.id)}
/>
```

---

## 📊 Passo 6: Usar Soft Delete

### Soft Delete (Mover para "Lixeira")
```typescript
const softDeletePost = async (postId: string) => {
  await fetch('/api/blog/edit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      postId,
      deleted_at: new Date().toISOString() // Marca como deletado
    })
  })
}
```

### Restaurar Post
```typescript
const restorePost = async (postId: string) => {
  await fetch('/api/blog/edit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      postId,
      deleted_at: null // Remove marca de deleção
    })
  })
}
```

### Buscar Posts Deletados (SQL)
```sql
-- Ver todos os posts deletados
SELECT * FROM blog_posts
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- Ver posts ativos (view automática)
SELECT * FROM blog_posts_active
ORDER BY created_at DESC;
```

---

## 🔒 Passo 7: Verificar Autenticação

As APIs requerem autenticação via cookie JWT. Certifique-se de estar logado como admin:

```typescript
// Fazer login no admin
const login = await fetch('/api/admin/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  })
})

// O cookie admin_token será definido automaticamente
```

---

## 🧪 Passo 8: Testar Tudo

### Checklist de Testes
- [ ] Migration aplicada no Supabase
- [ ] Campos novos visíveis no Supabase Table Editor
- [ ] Login admin funcionando
- [ ] Editar título de um post via API
- [ ] Adicionar meta_description via API
- [ ] Upload de imagem PNG funcionando
- [ ] Upload de imagem JPEG funcionando
- [ ] Botão "Editar" aparece nos cards (admin)
- [ ] Modal de edição abre ao clicar em "Editar"
- [ ] Soft delete funcionando
- [ ] Posts agendados aparecem corretamente

---

## ⚠️ Troubleshooting

### Erro: "Module has no exported member 'verifyApiKey'"
✅ **RESOLVIDO** - Já foi corrigido para usar `verifyAdminCookie`

### Erro: "Supabase admin not configured"
- Verifique se `.env.local` tem:
  - `SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta`
  - `NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co`

### Erro: "Unauthorized - Invalid API Key"
- As APIs agora usam autenticação JWT via cookie
- Faça login no admin antes de chamar as APIs

### Erro: "Validation errors"
- Meta description: deve ter 50-160 caracteres
- Título: deve ter 10-200 caracteres
- Excerpt: deve ter 50-500 caracteres
- Content: deve ter mínimo 300 caracteres

### Migration falhou
- Verifique se há dados antigos conflitantes
- Execute a migration em um ambiente de testes primeiro
- Faça backup do banco antes de aplicar

---

## 📚 Recursos Adicionais

### Documentação Criada
- `BLOG_IMPROVEMENTS_IMPLEMENTATION.md` - Documentação completa
- `BACKEND_ADMIN_BLOG_ANALYSIS.md` - Análise original
- `supabase/migrations/20251107_add_advanced_seo_and_soft_delete.sql` - Migration SQL

### Arquivos Modificados
- `types/blog.ts` - Types atualizados
- `components/blog/post-card.tsx` - Botão de edição
- `app/api/blog/edit/route.ts` - API de edição
- `app/api/blog/upload-image/route.ts` - API de upload

---

## 🎉 Pronto!

Agora você tem:
- ✅ SEO avançado (meta description, canonical URL)
- ✅ Edição completa de posts
- ✅ Upload manual de imagens
- ✅ Soft delete (lixeira)
- ✅ Posts agendados
- ✅ Botão de edição no admin

**Próximas melhorias:** Ver `BACKEND_ADMIN_BLOG_ANALYSIS.md` para roadmap completo

---

**Última atualização:** 07/11/2025 23:50
