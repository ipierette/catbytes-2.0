# Newsletter Debug Checklist

## Problema Reportado
Quando gera post do blog, newsletter não é enviada aos assinantes.

## Possíveis Causas

### 1. Sem assinantes verificados ✅ VERIFICAR
```sql
-- Execute no Supabase SQL Editor
SELECT COUNT(*) FROM newsletter_subscribers 
WHERE verified = true AND subscribed = true;

-- Ver detalhes dos assinantes
SELECT email, name, verified, subscribed, locale 
FROM newsletter_subscribers;
```

### 2. Resend não configurado ✅ VERIFICAR
```bash
# Verificar variáveis de ambiente
grep RESEND .env.local
```

Se `RESEND_API_KEY` não existir, a newsletter não será enviada (código verifica `if (resend)`).

### 3. Erro no envio (sem logs) ✅ VERIFICAR
O código usa `catch` mas só loga. Verificar logs da Vercel:
```bash
vercel logs --limit 100 | grep -i "newsletter\|Generate"
```

## Código Relevante

### app/api/blog/generate/route.ts (linha 243-304)
```typescript
// ====== STEP 4: Send to newsletter subscribers ======
if (resend) {
  try {
    console.log('[Generate] Fetching verified newsletter subscribers...')
    
    const { data: subscribers, error: subError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, name, locale')
      .eq('verified', true)
      .eq('subscribed', true)

    if (subError) {
      console.error('[Generate] Error fetching subscribers:', subError)
    } else if (subscribers && subscribers.length > 0) {
      // Envia emails em batches de 50
      // ...
    } else {
      console.log('[Generate] No verified subscribers to notify')
    }
  } catch (emailError) {
    console.error('[Generate] Error sending newsletter emails:', emailError)
  }
}
```

## Como Testar

1. **Adicionar assinante de teste:**
```bash
# Via API
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@teste.com","name":"Teste"}'

# Depois verificar o email e clicar no link de verificação
```

2. **Verificar Resend está configurado:**
```bash
# .env.local deve ter:
RESEND_API_KEY=re_...
```

3. **Gerar post de teste:**
```bash
curl -X POST http://localhost:3000/api/blog/generate \
  -H "Content-Type: application/json" \
  -d '{"theme":"Programação e IA"}'
```

4. **Verificar logs:**
- Ver console do terminal onde `npm run dev` está rodando
- Procurar por linhas com `[Generate]`
- Especialmente: "Fetching verified newsletter subscribers..."
- E: "Newsletter emails sent successfully!" ou "No verified subscribers"

## Solução Esperada

Se problema for **sem assinantes**, adicionar na Supabase:
```sql
INSERT INTO newsletter_subscribers (email, name, verified, subscribed, locale)
VALUES ('seu-email@gmail.com', 'Seu Nome', true, true, 'pt-BR');
```

Se problema for **Resend não configurado**, adicionar ao `.env.local`:
```bash
RESEND_API_KEY=re_sua_chave_aqui
```

Se problema for **erro no envio**, verificar:
- Domínio verificado no Resend (catbytes.site)
- Email remetente configurado (contato@catbytes.site)
- Quota do Resend não excedida

## Status
- [ ] Verificar assinantes no Supabase
- [ ] Verificar RESEND_API_KEY configurado
- [ ] Testar geração de post e verificar logs
- [ ] Confirmar recebimento de email
