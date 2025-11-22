# Como Republicar Post no Instagram (Post Deletado Acidentalmente)

## Problema
Instagram não permite republicar a mesma imagem que já foi postada anteriormente.

## Soluções

### Opção 1: Modificar a Imagem (Recomendado)
Adicione uma pequena alteração visual:
- Adicionar data no canto: "📅 22 Nov 2025"
- Adicionar borda colorida (1-2px)
- Adicionar watermark discreto
- Crop mínimo (99.9% da imagem original)

### Opção 2: Criar Carrossel
Instagram permite se você criar um carrossel com a mesma imagem + outra:
- Imagem 1: Post original
- Imagem 2: Screenshot de parte do artigo ou quote

### Opção 3: Formato Diferente
- Se era imagem 1:1, postar como 4:5 (portrait)
- Se era portrait, postar como landscape

## Script Automático (TODO)

```javascript
// Adicionar ao endpoint /api/instagram/publish
// Opção: add_date_overlay=true

if (add_date_overlay) {
  // Usar Sharp para adicionar data no canto
  const modifiedImageUrl = await addDateOverlay(image_url)
  image_url = modifiedImageUrl
}
```

## Solução Manual Rápida

1. Baixe a imagem do post
2. Abra no editor (Canva, Photoshop, etc)
3. Adicione texto discreto: "📅 22/11/2025"
4. Salve com novo nome
5. Poste normalmente

## Para Este Caso Específico

**Artigo:** Decifre o Comportamento do Seu Gato: A Linguagem Corporal Felina

**Opções:**
1. Baixar a imagem e adicionar data manualmente
2. Criar post de carrossel com 2 slides
3. Aguardar próximo artigo (segunda-feira)

**Imagem original:**
https://lbjekucdxgouwgegpdhi.supabase.co/storage/v1/object/public/blog-images/blog-covers/decifre-o-comportamento-do-seu-gato-a-linguagem-co-1763814993545.webp
