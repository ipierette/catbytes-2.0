# 📦 Configuração do Bucket Instagram - Supabase

## Passo a Passo para Criar o Bucket

### 1. Acesse o Supabase Dashboard
- Entre em: https://supabase.com/dashboard
- Selecione seu projeto CatBytes

### 2. Navegue até Storage
- No menu lateral, clique em **Storage**
- Clique no botão **"New bucket"**

### 3. Configure o Bucket
```
Nome do bucket: instagram-images
```

**Configurações importantes:**
- ✅ **Public bucket**: ATIVADO (marque esta opção)
  - Isso permite que as imagens sejam acessadas publicamente via URL
  
- ✅ **File size limit**: 10 MB
  - Limite adequado para imagens do Instagram
  
- ✅ **Allowed MIME types**: 
  - `image/png`
  - `image/jpeg`
  - `image/webp`

### 4. Políticas de Acesso (Storage Policies)

Após criar o bucket, configure as políticas:

#### Política 1: Permitir Leitura Pública
```sql
-- Nome: Allow public read access
-- Operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'instagram-images');
```

#### Política 2: Permitir Upload Autenticado
```sql
-- Nome: Allow authenticated uploads
-- Operation: INSERT
-- Target roles: authenticated, service_role

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated, service_role
WITH CHECK (bucket_id = 'instagram-images');
```

#### Política 3: Permitir Delete Autenticado
```sql
-- Nome: Allow authenticated deletes
-- Operation: DELETE
-- Target roles: authenticated, service_role

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated, service_role
USING (bucket_id = 'instagram-images');
```

### 5. Verificação e Teste

Após criar o bucket, você pode testar com o script automático:

```bash
# No terminal do projeto
npm run test:bucket
```

O script irá verificar:
- ✅ Cliente Supabase configurado
- ✅ Bucket existe e é público
- ✅ Upload funciona
- ✅ URL pública acessível
- ✅ Delete funciona
- ✅ Listagem de arquivos

**Exemplo de saída esperada:**
```
🧪 Testando Bucket Instagram do Supabase...

1️⃣ Verificando cliente Supabase...
✅ Cliente Supabase configurado

2️⃣ Listando buckets existentes...
📦 Total de buckets: 2
   - blog-images (público)
   - instagram-images (público)

3️⃣ Verificando bucket instagram-images...
✅ Bucket instagram-images encontrado
   - Público: Sim ✅

4️⃣ Testando upload de arquivo...
✅ Upload realizado com sucesso!

5️⃣ Testando URL pública...
✅ URL pública gerada

6️⃣ Testando acesso público...
✅ Acesso público funcionando!

7️⃣ Testando delete (limpeza)...
✅ Delete funcionando!

8️⃣ Listando arquivos no bucket...
📁 Total de arquivos: 0

🎉 TUDO FUNCIONANDO PERFEITAMENTE!
```

Você também pode testar manualmente:

```bash
# Testar geração de posts (cria imagens no bucket automaticamente)
curl http://localhost:3000/api/instagram/generate-batch \
  -X POST \
  -H "x-admin-key: seu-admin-key"
```

O sistema criará o bucket automaticamente se não existir, mas é melhor criar manualmente com as políticas corretas.

---

## 🔧 Comandos SQL Úteis

### Verificar buckets existentes:
```sql
SELECT * FROM storage.buckets;
```

### Listar arquivos no bucket:
```sql
SELECT * FROM storage.objects 
WHERE bucket_id = 'instagram-images' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Verificar políticas:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects';
```

### Ver tamanho total do bucket:
```sql
SELECT 
  bucket_id,
  COUNT(*) as total_files,
  SUM((metadata->>'size')::bigint) as total_bytes,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects 
WHERE bucket_id = 'instagram-images'
GROUP BY bucket_id;
```

---

## ⚠️ Importante

- O código já cria o bucket automaticamente se não existir
- As políticas de acesso devem ser configuradas manualmente
- Mantenha o bucket como **público** para que as URLs funcionem no Instagram
- O sistema limpa automaticamente imagens de posts rejeitados
- Execute `npm run test:bucket` após qualquer alteração para verificar

---

## 📊 Estrutura de Arquivos

```
instagram-images/
├── {post-id}-{timestamp}.png
├── {post-id}-{timestamp}.png
└── ...
```

Cada arquivo é nomeado com o ID do post + timestamp para evitar conflitos.

---

## 🐛 Troubleshooting

### Erro: "supabaseUrl is required"
- Verifique se `.env.local` existe
- Confirme as variáveis: `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

### Erro no upload
- Verifique a política "Allow authenticated uploads"
- Confirme que o bucket existe
- Teste com `npm run test:bucket`

### URL pública não funciona (403)
- Configure a política "Allow public read access"
- Certifique-se que o bucket está marcado como público

### Erro ao deletar
- Configure a política "Allow authenticated deletes"
- Verifique as permissões do service role key

---

## ✅ Checklist Final

- [ ] Bucket `instagram-images` criado no Supabase
- [ ] Bucket configurado como **público**
- [ ] Política "Allow public read access" configurada
- [ ] Política "Allow authenticated uploads" configurada  
- [ ] Política "Allow authenticated deletes" configurada
- [ ] Teste executado: `npm run test:bucket` ✅
- [ ] Todos os testes passaram com sucesso 🎉