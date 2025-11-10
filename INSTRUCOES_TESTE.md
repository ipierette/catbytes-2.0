# 🧪 INSTRUÇÕES DE TESTE - Analytics

## ✅ TESTE 1: Ver os Tooltips

1. **Abra o localhost**: http://localhost:3000
2. **Faça login** em `/admin/login`
3. **Vá em Analytics**
4. **Passe o mouse DEVAGAR** sobre o ícone **ℹ️** ao lado de "Usuários"
   - Se aparecer uma caixa explicativa → **FUNCIONOU!** ✅
   - Se NÃO aparecer nada → **Não funcionou** ❌

## 🔍 TESTE 2: Ver Logs de Tracking no Console

1. **Abra uma aba anônima/privada**
2. **Abra DevTools** (F12 ou Cmd+Option+I)
3. **Vá na aba Console**
4. **Acesse**: http://localhost:3000
5. **Procure por logs coloridos:**

```
Você DEVE ver:
🔧 [Analytics] Initialization: { clientConfigured: true, ... }
🚀 [Analytics] New page loaded: /pt-BR (em VERDE)
📊 [Analytics] Tracking page view: /pt-BR (em AZUL)
✅ [Analytics] Page view saved successfully! (em VERDE)
```

6. **Navegue para outra página** (ex: clique no Blog)
7. **Deve aparecer novos logs**

## ❌ SE NÃO VIR LOGS:

Procure por:
- `❌ [Analytics] Supabase client not initialized` (em VERMELHO)
- `⚠️ [Analytics] Check NEXT_PUBLIC_SUPABASE_URL`

Isso significa que as variáveis de ambiente não estão disponíveis no browser.

## 📸 TIRE SCREENSHOTS:

1. **Screenshot do tooltip** (se aparecer)
2. **Screenshot do console** mostrando os logs
3. **Screenshot de qualquer erro** em vermelho

---

## 🔧 DEBUG RÁPIDO

Cole isso no **Console do navegador** (F12):

```javascript
// Verificar se Supabase está inicializado
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Window location:', window.location.href)

// Forçar tracking manual
import('@/lib/analytics').then(({ trackPageView }) => {
  console.log('🧪 TESTE MANUAL: Chamando trackPageView...')
  trackPageView({
    page: '/teste-manual',
    locale: 'pt-BR'
  })
})
```

**Me envie os resultados!** 🎯
