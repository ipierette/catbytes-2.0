# Configuração do Supabase Storage para Imagens do Blog

## 📋 Pré-requisitos

- Projeto Supabase configurado
- Credenciais (URL e Service Role Key) no `.env.local`

## 🚀 Criar Bucket de Imagens

### Passo 1: Acessar Supabase Dashboard

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Storage** no menu lateral

### Passo 2: Criar o Bucket

1. Clique em **"New bucket"** ou **"Create bucket"**
2. Preencha os dados:
   - **Name:** `blog-images`
   - **Public bucket:** ✅ **ATIVAR** (importante!)
   - **File size limit:** 50 MB (padrão)
   - **Allowed MIME types:** deixe vazio (aceita todos)

3. Clique em **"Create bucket"**

### Passo 3: Configurar Políticas de Acesso (RLS)

Por padrão, o bucket será público para **leitura**, mas vamos garantir:

1. Clique no bucket `blog-images`
2. Vá para **"Policies"** (ou **"Configuration"** → **"Policies"**)
3. Verifique se existe uma política de leitura pública:

```sql
-- Se não existir, crie esta política:
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Para upload apenas com Service Role (já configurado automaticamente)
CREATE POLICY "Service role can upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'blog-images');
```

## ✅ Verificação

Após criar o bucket, a estrutura ficará assim:

```
blog-images/                    ← Bucket público
└── blog-covers/                ← Pasta automática criada pelo código
    ├── titulo-do-post-1234567890.webp
    ├── outro-post-1234567891.webp
    └── ...
```

## 🔧 Como Funciona o Upload

Quando um novo post é gerado:

1. **DALL-E gera imagem** → URL temporária (expira em 1h)
2. **Sistema baixa a imagem** automaticamente
3. **Upload para Supabase Storage**
   - Bucket: `blog-images`
   - Path: `blog-covers/{slug}-{timestamp}.webp`
   - Cache: 1 ano (31536000s)
4. **URL pública permanente** é salva no banco
5. **Imagem NUNCA expira** ✅

## 📝 Exemplo de URL Gerada

```
https://[seu-projeto].supabase.co/storage/v1/object/public/blog-images/blog-covers/melhorando-performance-react-1699123456789.webp
```

## 🐛 Troubleshooting

### Erro: "Bucket not found"

**Solução:** Verifique se o bucket `blog-images` foi criado corretamente.

```bash
# Verificar no código se o nome está correto:
# lib/supabase.ts → linha ~210
.from('blog-images')
```

### Erro: "Permission denied"

**Solução:** Certifique-se que o bucket está marcado como **público**.

1. Supabase Dashboard → Storage → blog-images
2. Settings → Public bucket: ✅

### Erro: "Upload failed"

**Solução:** Verifique se o `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 Monitoramento

Para verificar se as imagens estão sendo salvas:

1. Supabase Dashboard → Storage → blog-images → blog-covers
2. Você verá as imagens listadas
3. Clique em qualquer imagem para visualizar

## 🎯 Próximos Passos

Após criar o bucket:

1. ✅ Bucket configurado
2. ✅ Código já implementado
3. ✅ Próximos posts terão URLs permanentes
4. ⚠️ Posts antigos ainda usam URLs DALL-E expiradas (fallback ativo)

## 💡 Dicas

- **Limpeza:** Configure lifecycle rules para deletar imagens não utilizadas
- **Backup:** Supabase faz backup automático do storage
- **CDN:** Supabase já usa CDN global para performance
- **Otimização:** Imagens são salvas como WebP para economia de espaço

---

**✅ Pronto!** Agora todos os novos posts terão imagens permanentes hospedadas no Supabase! 🎉
