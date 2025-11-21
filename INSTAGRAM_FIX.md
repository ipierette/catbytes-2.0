# 🔧 FIX: Instagram 400 + Topics Crash

## 🐛 Problemas Identificados

### 1. ❌ Instagram SmartGenerate - Erro 400
```
POST /rest/v1/instagram_posts 400 (Bad Request)
Error: Apenas 0 de 1 foram salvos
```

**Causa:** Status `'draft'` e `'scheduled'` não existem no constraint do banco.

**Constraint atual:**
```sql
CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'failed'))
```

**Código tenta usar:**
- `'draft'` → Salvar rascunho
- `'scheduled'` → Agendar publicação

---

### 2. ❌ Topics Page - Crash ao abrir
```
Uncaught TypeError: Cannot read properties of undefined (reading 'map')
```

**Causa:** `data.topics` pode ser `undefined` se API retornar erro.

**Código original:**
```tsx
if (data.success) {
  setTopics(data.topics) // ❌ data.topics pode ser undefined
}
```

---

## ✅ Correções Aplicadas

### Fix 1: Topics Page (✅ Deployed)
```tsx
// ANTES:
if (data.success) {
  setTopics(data.topics)
  setTotalPages(data.pagination.totalPages)
  setTotalTopics(data.pagination.total)
} else {
  toast.error('Erro ao buscar tópicos')
}

// DEPOIS:
if (data.success && data.topics) {
  setTopics(data.topics)
  setTotalPages(data.pagination.totalPages)
  setTotalTopics(data.pagination.total)
} else {
  setTopics([]) // ✅ Fallback para array vazio
  toast.error('Erro ao buscar tópicos')
}
```

---

### Fix 2: Instagram Status (⚠️ MIGRATION NECESSÁRIA)

**Migration criada:** `supabase/migrations/20251121_add_draft_scheduled_status.sql`

---

## 📝 AÇÃO OBRIGATÓRIA

Execute este SQL no Supabase Dashboard:

**URL:** https://supabase.com/dashboard/project/lbjekucdxgouwgegpdhi/sql/new

**SQL:**
```sql
-- 1. Remover constraint antiga
ALTER TABLE instagram_posts
DROP CONSTRAINT IF EXISTS instagram_posts_status_check;

-- 2. Criar nova constraint com 'draft' e 'scheduled'
ALTER TABLE instagram_posts
ADD CONSTRAINT instagram_posts_status_check 
CHECK (status IN (
  'pending',
  'approved', 
  'rejected', 
  'published', 
  'failed',
  'draft',
  'scheduled'
));
```

---

## ✅ Validação

### Teste 1: Topics Page
1. Acesse: `/admin/dashboard`
2. Clique em "Abrir Painel Completo"
3. Página deve carregar sem crash ✅

### Teste 2: Instagram SmartGenerate (após SQL)
```bash
# Testar INSERT direto:
curl -X POST "https://lbjekucdxgouwgegpdhi.supabase.co/rest/v1/instagram_posts" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nicho": "Tech",
    "titulo": "Test",
    "texto_imagem": "Test",
    "caption": "Test",
    "image_url": "https://test.jpg",
    "generation_method": "SMART_GENERATE",
    "status": "draft"
  }'
```

**Resultado esperado:** `201 Created` (não mais 400)

---

## 📊 Resumo

| Problema | Status | Ação |
|----------|--------|------|
| Topics crash | ✅ Corrigido | Deploy automático |
| Instagram 400 | ⏳ Pendente | Executar SQL manual |

**Commit:** `1e0448e` (pushed para GitHub)
