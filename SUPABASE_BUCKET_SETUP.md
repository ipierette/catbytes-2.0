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

### 5. Verificação

Após criar o bucket, você pode testar:

```bash
# No terminal do projeto
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

---

## ⚠️ Importante

- O código já cria o bucket automaticamente se não existir
- As políticas de acesso devem ser configuradas manualmente
- Mantenha o bucket como **público** para que as URLs funcionem no Instagram
- O sistema limpa automaticamente imagens de posts rejeitados

---

## 📊 Estrutura de Arquivos

```
instagram-images/
├── {post-id}-{timestamp}.png
├── {post-id}-{timestamp}.png
└── ...
```

Cada arquivo é nomeado com o ID do post + timestamp para evitar conflitos.
