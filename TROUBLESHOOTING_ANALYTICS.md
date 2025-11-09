# 🔧 Troubleshooting Analytics - CatBytes

## Problema: Analytics não está rastreando visitas

### ✅ **TOOLTIPS - Onde Encontrar**

Os tooltips explicativos estão no **painel administrativo**:

1. Acesse: `/admin/login`
2. Faça login
3. Vá em: `Analytics`
4. Passe o mouse sobre o ícone **ℹ️** ao lado de cada métrica

Você verá explicações como:
- **Google Analytics**: Conta TODOS os visitantes incluindo bots...
- **Leituras Engajadas**: Conta apenas quando visitante permanece >30s...
- **Visualizações de Blog**: Conta cada visita que permanece >10s...

---

## 🔍 **Diagnóstico Passo a Passo**

### 1️⃣ Verificar Console do Navegador

1. Abra **DevTools** (F12 ou Cmd+Option+I)
2. Vá na aba **Console**
3. Navegue pelo site
4. Procure por logs:

```
✅ SUCESSO (está funcionando):
[Analytics] 🔧 Initialization: { clientConfigured: true, ... }
[Analytics] ✅ Tracking page view: /pt-BR
[Analytics] ✅ Page view saved successfully

❌ ERRO (algo está errado):
[Analytics] ❌ Supabase client not initialized
[Analytics] ❌ Page view tracking failed: {...}
```

### 2️⃣ Verificar Variáveis de Ambiente

Execute no terminal:

```bash
cd /Users/Izadora1/Desktop/programacao/projetos/catbytes-2.0
grep "NEXT_PUBLIC_SUPABASE" .env.local
```

Deve retornar:
```
NEXT_PUBLIC_SUPABASE_URL="https://lbjekucdxgouwgegpdhi.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

Se **NÃO** retornar nada:
```bash
echo 'NEXT_PUBLIC_SUPABASE_URL="https://lbjekucdxgouwgegpdhi.supabase.co"' >> .env.local
echo 'NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."' >> .env.local
```

⚠️ **IMPORTANTE**: Reinicie o servidor dev após alterar `.env.local`

### 3️⃣ Verificar Tabelas no Supabase

1. Acesse: https://supabase.com/dashboard/project/lbjekucdxgouwgegpdhi
2. Vá em: **Table Editor**
3. Verifique se existem:
   - ✅ `analytics_page_views`
   - ✅ `analytics_blog_views`
   - ✅ `analytics_events`

**Se NÃO existirem:**
1. Vá em: **SQL Editor**
2. Abra o arquivo: `lib/supabase-analytics-schema.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**

### 4️⃣ Verificar RLS (Row Level Security)

As políticas RLS devem permitir **inserções públicas**:

```sql
-- Execute no SQL Editor do Supabase:

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('analytics_page_views', 'analytics_blog_views', 'analytics_events');

-- Se não houver política "Allow public inserts", crie:
CREATE POLICY "Allow public inserts" ON analytics_page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts" ON analytics_blog_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public inserts" ON analytics_events
    FOR INSERT WITH CHECK (true);
```

### 5️⃣ Testar Inserção Direta

Crie um arquivo `test.html` e abra no navegador:

```html
<!DOCTYPE html>
<html>
<body>
    <h1>Test Analytics</h1>
    <div id="status">Testando...</div>
    
    <script>
        const url = "https://lbjekucdxgouwgegpdhi.supabase.co"
        const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        
        fetch(`${url}/rest/v1/analytics_page_views`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': key,
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                page: '/test',
                session_id: 'test-' + Date.now(),
                locale: 'pt-BR',
                timestamp: new Date().toISOString()
            })
        })
        .then(r => r.ok ? '✅ OK' : '❌ ERRO: ' + r.status)
        .then(msg => {
            document.getElementById('status').innerHTML = msg
            console.log(msg)
        })
    </script>
</body>
</html>
```

---

## 🐛 **Erros Comuns e Soluções**

### Erro: "Supabase client not initialized"

**Causa**: Variáveis `NEXT_PUBLIC_SUPABASE_*` não estão disponíveis

**Solução**:
1. Verifique `.env.local`
2. Certifique-se que as variáveis começam com `NEXT_PUBLIC_`
3. Reinicie o servidor: `npm run dev`

### Erro: "new row violates row-level security policy"

**Causa**: RLS está bloqueando inserções

**Solução**:
```sql
-- Execute no Supabase SQL Editor:
CREATE POLICY "Allow public inserts" ON analytics_page_views
    FOR INSERT WITH CHECK (true);
```

### Erro: "relation analytics_page_views does not exist"

**Causa**: Tabelas não foram criadas

**Solução**:
1. Copie `lib/supabase-analytics-schema.sql`
2. Execute no SQL Editor do Supabase

### Tracking funciona em desenvolvimento mas não em produção

**Causa**: Variáveis de ambiente não configuradas no Vercel

**Solução**:
1. Acesse: Vercel Dashboard → Seu Projeto → Settings → Environment Variables
2. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy

---

## 📊 **Verificar se Está Funcionando**

### Teste Completo

1. **Abra o site** em modo anônimo/privado
2. **Abra DevTools** (F12) → Console
3. **Navegue** pela home
4. **Leia** um artigo por >30 segundos
5. **Verifique logs:**

```
Expected Output:
[Analytics] 🔧 Initialization: { clientConfigured: true, ... }
[Analytics] ✅ Tracking page view: /pt-BR
[Analytics] ✅ Page view saved successfully
[Analytics] 📖 Tracking blog view: meu-artigo (35s read time)
[Analytics] ✅ Blog view saved successfully
```

6. **Verifique Supabase:**
   - Table Editor → `analytics_page_views`
   - Deve haver registros com timestamp recente

7. **Verifique Admin Dashboard:**
   - `/admin/analytics`
   - Deve mostrar números atualizados

---

## 🎯 **Checklist Rápido**

- [ ] Variáveis `NEXT_PUBLIC_SUPABASE_*` configuradas
- [ ] Servidor reiniciado após mudanças em `.env.local`
- [ ] Tabelas criadas no Supabase
- [ ] Políticas RLS permitem inserções públicas
- [ ] Console mostra logs ✅ verdes
- [ ] Registros aparecem no Supabase Table Editor
- [ ] Admin dashboard mostra dados

---

## 🆘 **Ainda Não Funciona?**

### Debug Avançado

Adicione este código em `lib/analytics.ts` temporariamente:

```typescript
// No início do arquivo, após os imports
if (typeof window !== 'undefined') {
  (window as any).testAnalytics = async () => {
    const { trackPageView } = await import('@/lib/analytics')
    console.log('🧪 Testing trackPageView...')
    await trackPageView({
      page: '/test-manual',
      locale: 'pt-BR'
    })
  }
}
```

Depois, no console do navegador:
```javascript
testAnalytics()
```

Veja os logs detalhados.

---

## 📝 **Informações do Projeto**

- **Supabase URL**: `https://lbjekucdxgouwgegpdhi.supabase.co`
- **Projeto ID**: `lbjekucdxgouwgegpdhi`
- **Tabelas**: `analytics_page_views`, `analytics_blog_views`, `analytics_events`
- **Tracking Components**: 
  - Client: `components/analytics/analytics-tracker.tsx`
  - Functions: `lib/analytics.ts`
  - Admin: `app/admin/analytics/page.tsx`

---

## ✅ **Status Esperado**

Quando tudo estiver funcionando:

```bash
# Console do Navegador
[Analytics] 🔧 Initialization: { clientConfigured: true, supabaseClient: true }
[Analytics] ✅ Tracking page view: /pt-BR
[Analytics] ✅ Page view saved successfully

# Supabase Table Editor
analytics_page_views: 150 rows
analytics_blog_views: 45 rows
analytics_events: 300 rows

# Admin Dashboard
Usuários Totais: 120
Visualizações: 450
Leituras de Blog: 45
```
