# 🚀 Instruções para Aplicar Migration de Analytics

## ⚠️ IMPORTANTE: Conexão CLI Instável
Como a conexão via Supabase CLI está lenta/instável, vamos aplicar a migration **manualmente pelo Dashboard**.

---

## 📋 Passo a Passo

### **1. Acesse o Supabase Dashboard**
- Vá para: https://supabase.com/dashboard/project/lbjekucdxgouwgegpdhi
- Entre com suas credenciais
- Navegue até: **SQL Editor** (ícone de código SQL no menu lateral)

### **2. Crie Nova Query**
- Clique em **"New Query"**
- Cole o conteúdo do arquivo: `supabase/migrations/20251107_add_analytics_sync_and_optimization.sql`

### **3. Execute a Migration**
- Clique em **"Run"** ou pressione `Ctrl + Enter` (Windows/Linux) ou `Cmd + Enter` (Mac)
- Aguarde a execução (pode levar 10-30 segundos)
- Verifique se aparecer "Success" sem erros

### **4. Verificação Rápida**
Execute estas queries para confirmar que tudo funcionou:

```sql
-- 1. Verificar se trigger foi criado
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_blog_views';

-- 2. Verificar se views foram criadas
SELECT table_name FROM information_schema.views 
WHERE table_name LIKE 'analytics_%';

-- 3. Verificar se materialized views foram criadas
SELECT matviewname FROM pg_matviews 
WHERE matviewname LIKE 'analytics_%';

-- 4. Verificar se funções foram criadas
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%analytics%';
```

---

## ✅ Resultados Esperados

Após executar, você deve ter:

### **Triggers:**
- ✅ `trigger_sync_blog_views` - Sincroniza views automaticamente

### **Views Materializadas:**
- ✅ `analytics_daily_summary` - Resumo diário de page views
- ✅ `analytics_blog_summary` - Resumo diário de blog posts

### **Views Helper:**
- ✅ `analytics_top_posts_30d` - Top 10 posts dos últimos 30 dias
- ✅ `analytics_realtime` - Estatísticas em tempo real (últimos 5 min)
- ✅ `analytics_engagement_by_post` - Métricas de engajamento por post

### **Funções:**
- ✅ `sync_blog_post_views()` - Sincroniza views
- ✅ `refresh_analytics_daily()` - Atualiza materialized views
- ✅ `archive_old_analytics()` - Arquiva dados antigos

### **Índices Adicionais:**
- ✅ 8 novos índices para performance de queries

---

## 🔧 Configuração de Cron Jobs (OPCIONAL)

Se quiser automatizar a atualização das views, execute no SQL Editor:

```sql
-- Atualizar views materializadas diariamente às 1h da manhã
SELECT cron.schedule(
  'refresh-analytics',
  '0 1 * * *',
  'SELECT refresh_analytics_daily();'
);

-- Arquivar dados antigos todo dia 1º do mês às 2h da manhã
SELECT cron.schedule(
  'archive-analytics',
  '0 2 1 * *',
  'SELECT archive_old_analytics();'
);
```

---

## 🧪 Testar o Trigger

Para testar se o trigger está funcionando:

```sql
-- 1. Verificar views atuais de um post
SELECT id, title, views FROM blog_posts LIMIT 1;

-- 2. Simular uma visualização (substitua os valores)
INSERT INTO analytics_blog_views (
  post_id,
  post_slug,
  post_title,
  read_time_seconds,
  scroll_depth_percent,
  session_id,
  locale
) VALUES (
  'SEU_POST_ID_AQUI',
  'slug-do-post',
  'Título do Post',
  45,
  75,
  'test-session-' || NOW()::TEXT,
  'pt-BR'
);

-- 3. Verificar se views foi incrementado
SELECT id, title, views FROM blog_posts WHERE id = 'SEU_POST_ID_AQUI';
```

---

## 📊 Consultas Úteis

### **Ver Top Posts:**
```sql
SELECT * FROM analytics_top_posts_30d;
```

### **Ver Usuários Ativos Agora:**
```sql
SELECT * FROM analytics_realtime;
```

### **Ver Engajamento por Post:**
```sql
SELECT 
  post_title,
  unique_readers,
  avg_read_time_seconds,
  avg_scroll_depth_percent,
  quality_read_rate,
  completion_rate,
  bounce_rate
FROM analytics_engagement_by_post
ORDER BY unique_readers DESC
LIMIT 10;
```

### **Atualizar Views Manualmente:**
```sql
SELECT refresh_analytics_daily();
```

---

## ❌ Troubleshooting

### Erro: "relation analytics_daily_summary already exists"
```sql
-- Drop e recrie
DROP MATERIALIZED VIEW IF EXISTS analytics_daily_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS analytics_blog_summary CASCADE;
-- Depois execute a migration novamente
```

### Erro: "function sync_blog_post_views already exists"
```sql
-- A migration já usa CREATE OR REPLACE, não deveria dar erro
-- Se der, force o drop:
DROP FUNCTION IF EXISTS sync_blog_post_views() CASCADE;
-- Depois execute a migration novamente
```

### Erro: "trigger already exists"
```sql
-- A migration já tem DROP TRIGGER IF EXISTS
-- Se der erro, force manualmente:
DROP TRIGGER IF EXISTS trigger_sync_blog_views ON analytics_blog_views;
-- Depois execute a migration novamente
```

---

## 🎯 Próximos Passos

Após aplicar a migration:
1. ✅ Verificar que tudo foi criado
2. ✅ Testar o trigger com uma inserção de teste
3. ✅ Criar as APIs de analytics (próximo passo)
4. ✅ Atualizar dashboard para usar dados reais

---

## 📝 Notas

- **Dados Existentes:** A migration sincroniza automaticamente todos os posts existentes com os dados de analytics
- **Performance:** As materialized views melhoram drasticamente a performance de queries complexas
- **Archive:** Os dados antigos (> 1 ano) podem ser arquivados para manter o banco leve
- **Cron Jobs:** Opcional, mas recomendado para manter as views atualizadas

---

## 🆘 Precisa de Ajuda?

Se encontrar erros:
1. Copie a mensagem de erro completa
2. Verifique se todas as tabelas `analytics_*` existem
3. Verifique se a tabela `blog_posts` tem a coluna `views`
4. Me envie o erro para debugar

---

## ✅ Checklist Final

- [ ] Migration executada sem erros
- [ ] Trigger `trigger_sync_blog_views` criado
- [ ] Views materializadas criadas
- [ ] Views helper criadas
- [ ] Funções criadas
- [ ] Índices criados
- [ ] Teste do trigger funcionando
- [ ] Cron jobs configurados (opcional)

---

**Arquivo da Migration:** `supabase/migrations/20251107_add_analytics_sync_and_optimization.sql`

**Tempo Estimado:** 2-5 minutos para executar tudo
