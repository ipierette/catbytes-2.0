# 📊 Analytics Backend - Gaps e Melhorias

**Data:** 07/11/2025  
**Objetivo:** Identificar gaps entre a interface de analytics existente e o backend necessário

---

## 🔍 **Análise da Situação Atual**

### ✅ **O que JÁ EXISTE:**

#### 1. **Tabelas de Analytics no Banco:**
```sql
-- ✅ Implementadas
- analytics_page_views (page, referrer, user_agent, session_id, locale, timestamp)
- analytics_blog_views (post_id, post_slug, post_title, read_time_seconds, scroll_depth_percent)
- analytics_events (event_name, properties, session_id, timestamp)
```

#### 2. **Funções de Tracking (Client-side):**
```typescript
// ✅ Implementadas em lib/analytics.ts
- trackPageView(data: PageViewData)
- trackBlogPostView(data: BlogPostViewData)
- trackEvent(eventName: string, properties?: Record<string, any>)
```

#### 3. **Hooks React:**
```typescript
// ✅ Implementados em components/analytics/analytics-tracker.tsx
- usePageViewTracking() - tracking automático de páginas
- useBlogPostTracking() - tracking de leitura de posts
- PerformanceTracker - tracking de performance
```

#### 4. **APIs de Analytics:**
```typescript
// ✅ GET /api/analytics/google - Analytics do Google Analytics
// ✅ GET /api/analytics/blog - Analytics do blog (usa dados próprios)
```

#### 5. **Queries Server-side:**
```typescript
// ✅ Implementadas em lib/analytics.ts
- getBlogAnalytics(period: string) - analytics de blog posts
- getPageViewsAnalytics(period: string) - analytics de page views
- getTopContent(limit: number) - top posts por visualizações
- getRealTimeStats() - estatísticas em tempo real
```

---

## ❌ **O que FALTA Implementar:**

### **Problema 1: Tracking NÃO Estava Ativo** ✅ **CORRIGIDO**
- ❌ Hook `useBlogPostTracking()` não era usado nas páginas de blog
- ✅ **SOLUÇÃO:** Adicionado no `post-modal.tsx` (07/11/2025)
- ✅ Agora rastreia: tempo de leitura, scroll depth, sessão

---

### **Problema 2: API de Blog Analytics Retorna Dados Mock**

#### **API Atual:** `GET /api/analytics/blog`
```typescript
// Problema: Retorna dados simulados quando não tem dados reais
if (!blogAnalytics || !pageAnalytics) {
  return NextResponse.json({
    success: true,
    data: generateFallbackData(period), // ❌ DADOS MOCK
    note: 'Usando dados simulados'
  })
}
```

#### **❌ Gaps Identificados:**

1. **Falta Criar API Específica para Blog Stats**
   ```typescript
   // NOVO: GET /api/admin/blog-analytics
   // Deve usar os dados reais de analytics_blog_views
   Response: {
     totalViews: number // Da tabela blog_posts
     totalReads: number // Da tabela analytics_blog_views
     avgReadTime: number // Média de read_time_seconds
     avgScrollDepth: number // Média de scroll_depth_percent
     topPosts: Array<{
       id: string
       title: string
       slug: string
       views: number // Da blog_posts
       reads: number // Da analytics_blog_views (leituras > 30s)
       avgReadTime: number
       bounceRate: number // reads / views
     }>
     viewsByDay: Array<{
       date: string
       views: number
       reads: number
     }>
     viewsByLanguage: {
       'pt-BR': number
       'en-US': number
     }
     engagementMetrics: {
       totalSessions: number
       qualityReads: number // > 30s
       completionRate: number // scroll > 80%
     }
   }
   ```

2. **Falta Integração Entre `blog_posts.views` e `analytics_blog_views`**
   ```typescript
   // Problema: 
   // - blog_posts tem campo "views" mas não é incrementado
   // - analytics_blog_views registra tracking mas não atualiza blog_posts
   
   // SOLUÇÃO: Criar função no banco ou trigger
   CREATE OR REPLACE FUNCTION sync_blog_views()
   RETURNS void AS $$
   BEGIN
     UPDATE blog_posts
     SET views = (
       SELECT COUNT(DISTINCT session_id)
       FROM analytics_blog_views
       WHERE analytics_blog_views.post_id = blog_posts.id
     );
   END;
   $$ LANGUAGE plpgsql;
   ```

3. **Falta API para Real-Time Analytics**
   ```typescript
   // NOVO: GET /api/admin/analytics/realtime
   Response: {
     activeUsers: number // Últimos 5 minutos
     activePosts: Array<{
       title: string
       slug: string
       liveReaders: number
     }>
     recentEvents: Array<{
       type: 'page_view' | 'blog_read' | 'custom'
       timestamp: string
       page: string
     }>
   }
   ```

4. **Falta Analytics de Engagement**
   ```typescript
   // NOVO: GET /api/admin/analytics/engagement
   Response: {
     byPost: Array<{
       postId: string
       title: string
       avgReadTime: number
       avgScrollDepth: number
       completionRate: number // % que leu >80%
       bounceRate: number // % que saiu <30s
       returnRate: number // % que voltou
     }>
     byDevice: {
       mobile: { sessions: number, avgTime: number }
       desktop: { sessions: number, avgTime: number }
       tablet: { sessions: number, avgTime: number }
     }
     byTimeOfDay: Array<{
       hour: number
       sessions: number
       avgReadTime: number
     }>
   }
   ```

5. **Falta Export de Relatórios**
   ```typescript
   // NOVO: GET /api/admin/analytics/export
   // Query params: ?period=30d&format=csv|pdf
   
   // Gera relatório completo:
   // - Top posts
   // - Métricas de engajamento
   // - Crescimento temporal
   // - Fontes de tráfego
   ```

---

## 🎯 **Roadmap de Implementação**

### **Fase 3.1: Sync e Correções (1-2 dias)** ⏳ **URGENTE**

1. ✅ **Ativar Tracking** - FEITO (07/11/2025)
   - Adicionado `useBlogPostTracking()` no `post-modal.tsx`

2. ⏳ **Criar Função de Sync**
   ```sql
   -- Sincronizar views de blog_posts com analytics_blog_views
   CREATE OR REPLACE FUNCTION sync_blog_post_views()
   RETURNS TRIGGER AS $$
   BEGIN
     UPDATE blog_posts
     SET views = (
       SELECT COUNT(DISTINCT session_id)
       FROM analytics_blog_views
       WHERE post_id = NEW.post_id
     )
     WHERE id = NEW.post_id;
     
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER update_blog_views
   AFTER INSERT ON analytics_blog_views
   FOR EACH ROW
   EXECUTE FUNCTION sync_blog_post_views();
   ```

3. ⏳ **Criar API `/api/admin/blog-analytics`**
   - Substituir dados mock por dados reais
   - Usar queries nas tabelas analytics_*
   - Retornar métricas calculadas

---

### **Fase 3.2: APIs de Analytics Avançado (3-5 dias)** ⏳ **PRÓXIMA**

1. ⏳ **GET /api/admin/analytics/realtime**
   - Usuários ativos (últimos 5 min)
   - Posts sendo lidos agora
   - Eventos recentes

2. ⏳ **GET /api/admin/analytics/engagement**
   - Métricas de engajamento por post
   - Análise por dispositivo
   - Análise por horário

3. ⏳ **GET /api/admin/analytics/traffic-sources**
   - De onde vêm os leitores
   - Referrers
   - Campanhas (UTM tracking)

4. ⏳ **GET /api/admin/analytics/funnel**
   - Funil de conversão (visita → leitura → newsletter)
   - Taxa de conversão em cada etapa
   - Abandono

---

### **Fase 3.3: Visualizações e Dashboards (5-7 dias)** ⏳ **FUTURA**

1. ⏳ **Componente `BlogAnalyticsDashboard`**
   - Gráficos de visualizações ao longo do tempo
   - Heatmap de horários populares
   - Comparação entre posts

2. ⏳ **Componente `RealtimeAnalytics`**
   - Mapa de visitantes ativos
   - Feed de eventos em tempo real
   - Alertas de picos

3. ⏳ **Componente `EngagementCharts`**
   - Gráfico de tempo de leitura
   - Scroll depth visualization
   - Taxa de conclusão

---

### **Fase 3.4: Export e Relatórios (2-3 dias)** ⏳ **FUTURA**

1. ⏳ **GET /api/admin/analytics/export**
   - Export CSV
   - Export PDF com gráficos
   - Export JSON para integração

2. ⏳ **Agendamento de Relatórios**
   - Relatórios semanais automáticos
   - Email com resumo
   - Alertas de anomalias

---

## 📝 **Schema Adicional Sugerido**

### **Tabela: analytics_sessions** (NOVA)
```sql
CREATE TABLE analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  device_type VARCHAR(20), -- mobile, desktop, tablet
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(50),
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  total_page_views INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_sessions_device ON analytics_sessions(device_type);
```

### **Tabela: analytics_conversion_funnel** (NOVA)
```sql
CREATE TABLE analytics_conversion_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  step VARCHAR(50) NOT NULL, -- visit, read, newsletter, contact
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_funnel_session ON analytics_conversion_funnel(session_id);
CREATE INDEX idx_funnel_step ON analytics_conversion_funnel(step);
CREATE INDEX idx_funnel_timestamp ON analytics_conversion_funnel(timestamp);
```

---

## 🔧 **Melhorias de Infraestrutura**

### **1. Materializing Views para Performance**
```sql
-- View materializada para estatísticas diárias
CREATE MATERIALIZED VIEW analytics_daily_blog_stats AS
SELECT 
  DATE(timestamp) as date,
  post_id,
  post_title,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_readers,
  AVG(read_time_seconds) as avg_read_time,
  AVG(scroll_depth_percent) as avg_scroll_depth,
  COUNT(*) FILTER (WHERE read_time_seconds > 30) as quality_reads
FROM analytics_blog_views
GROUP BY DATE(timestamp), post_id, post_title
ORDER BY date DESC;

-- Refresh automático (cron job diário)
CREATE OR REPLACE FUNCTION refresh_analytics_daily()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW analytics_daily_blog_stats;
END;
$$ LANGUAGE plpgsql;
```

### **2. Índices para Performance**
```sql
-- Índices adicionais para queries rápidas
CREATE INDEX idx_blog_views_timestamp_session ON analytics_blog_views(timestamp, session_id);
CREATE INDEX idx_blog_views_post_timestamp ON analytics_blog_views(post_id, timestamp);
CREATE INDEX idx_page_views_locale ON analytics_page_views(locale);
```

### **3. Cleanup de Dados Antigos**
```sql
-- Arquivar dados com mais de 1 ano
CREATE TABLE analytics_blog_views_archive (LIKE analytics_blog_views);

CREATE OR REPLACE FUNCTION archive_old_analytics()
RETURNS void AS $$
BEGIN
  -- Mover para arquivo
  INSERT INTO analytics_blog_views_archive
  SELECT * FROM analytics_blog_views
  WHERE timestamp < NOW() - INTERVAL '1 year';
  
  -- Deletar originais
  DELETE FROM analytics_blog_views
  WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 **Prioridades**

### **🔴 ALTA (Implementar Agora):**
1. ✅ Ativar tracking no post-modal
2. ⏳ Criar trigger de sync blog_posts.views
3. ⏳ Criar API `/api/admin/blog-analytics` com dados reais

### **🟡 MÉDIA (Próxima Semana):**
4. ⏳ API de realtime analytics
5. ⏳ API de engagement metrics
6. ⏳ Dashboard visual com gráficos

### **🟢 BAIXA (Futuro):**
7. ⏳ Export de relatórios
8. ⏳ Agendamento automático
9. ⏳ Alertas inteligentes

---

## 📊 **Conclusão**

### **Status Atual:**
- ✅ Infraestrutura de tracking: **PRONTA**
- ✅ Tracking ativado: **FEITO** (07/11/2025)
- ⚠️ APIs de consulta: **PARCIAL** (usa dados mock)
- ❌ Dashboard visual: **PRECISA DADOS REAIS**
- ❌ Sync automático: **NÃO IMPLEMENTADO**

### **Próximos Passos:**
1. Criar trigger de sync (blog_posts.views ← analytics_blog_views)
2. Criar API `/api/admin/blog-analytics` com dados reais
3. Substituir dados mock na interface
4. Criar dashboard visual com gráficos
5. Implementar real-time analytics

### **Impacto:**
- 📈 **Analytics funcionais:** Dados reais de leitura, tempo, scroll
- 🎯 **Decisões baseadas em dados:** Ver o que funciona
- 📊 **Dashboard completo:** Visualizar tendências
- 🚀 **Otimização de conteúdo:** Criar posts melhores baseado em métricas
