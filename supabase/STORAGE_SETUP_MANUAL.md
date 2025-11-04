# Setup Manual do Supabase Storage (via Dashboard)

Se o script SQL não funcionar, siga este guia para criar o bucket manualmente.

## Passo 1: Criar o Bucket

1. Acesse o **Dashboard do Supabase**
2. Vá em **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure:
   - **Name**: `blog-images`
   - **Public bucket**: ✅ ATIVADO (marque esta opção!)
   - **Allowed MIME types**: deixe vazio ou adicione: `image/jpeg, image/png, image/webp, image/gif`
   - **File size limit**: `50 MB` (opcional)
5. Clique em **Save**

## Passo 2: Configurar Política de Leitura

Depois de criar o bucket:

1. No bucket `blog-images`, vá na aba **Policies**
2. Clique em **New policy**
3. Escolha **For full customization** (ao invés dos templates)
4. Configure:
   - **Policy name**: `Public read access`
   - **Allowed operation**: Marque apenas **SELECT**
   - **Target roles**: deixe como `public` (padrão)
   - **USING expression**:
     ```sql
     bucket_id = 'blog-images'
     ```
5. Clique em **Save policy**

## ⚠️ IMPORTANTE: Não crie política de INSERT!

**NÃO PRECISA** criar políticas de INSERT, UPDATE ou DELETE!

Por quê? Porque nossa API route (`app/api/blog/generate/route.ts`) usa o **Service Role Key**, que automaticamente BYPASSA todas as políticas RLS. Ele já tem acesso total para fazer upload, atualizar e deletar arquivos.

## Verificação

Para verificar se está funcionando:

1. Tente criar um novo artigo do blog
2. Verifique em **Storage > blog-images** se a imagem foi salva
3. Clique na imagem e copie a URL pública
4. Cole a URL em uma aba anônima - deve carregar a imagem

## Estrutura de Pastas

As imagens serão salvas automaticamente em:
```
blog-images/
  └── blog-covers/
      ├── titulo-do-post-1234567890.webp
      ├── outro-post-1234567891.webp
      └── ...
```

## Troubleshooting

### Erro: "new row violates row-level security policy"
- Verifique se você está usando a `SUPABASE_SERVICE_ROLE_KEY` (não a anon key) no arquivo `.env.local`

### Erro: "Bucket not found"
- Verifique se o bucket `blog-images` existe em Storage
- Verifique se o nome está exatamente como: `blog-images` (sem espaços)

### Imagens não carregam na página
- Verifique se o bucket está marcado como **público**
- Verifique se a política de SELECT foi criada
- Teste a URL da imagem diretamente no navegador
