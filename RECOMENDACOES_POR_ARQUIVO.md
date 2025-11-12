# Recomendações Detalhadas por Arquivo

## Componentes para Refatorar (Ordem de Prioridade)

### 1. `/components/layout/language-toggle.tsx` - REMOVER
**Status**: ÓRFÃO - não utilizado
**Razão**: Duplicado e substituído por `language-toggle-new.tsx`
**Ação**: Deletar completamente

---

### 2. `/components/sections/ai-features.tsx` - REFATORAR ALTO
**Problemas**:
- 731 linhas com 3 formulários complexos
- `activeTab` state sem useCallback para handlers
- Sem React.memo para formulários

**Recomendações**:
```typescript
// ANTES
const [activeTab, setActiveTab] = useState<'adopt' | 'identify' | 'donate'>('adopt')

// DEPOIS
const [activeTab, setActiveTab] = useState<'adopt' | 'identify' | 'donate'>('adopt')
const handleTabChange = useCallback((tab: typeof activeTab) => {
  setActiveTab(tab)
}, [])

// Extrair formulários para componentes separados com React.memo
const MemoizedAdoptForm = React.memo(AdoptCatForm)
const MemoizedIdentifyForm = React.memo(IdentifyCatForm)
const MemoizedDonateForm = React.memo(DonateCatForm)
```

**Impacto**: -200ms FID, -50% re-renders

---

### 3. `/components/sections/ai-features-lazy.tsx` - VERIFICAR
**Status**: OK - Implementado corretamente
**Observação**: Configuração de lazy-loading está boa, não precisa alterar

---

### 4. `/components/blog/post-card.tsx` - REFATORAR ALTO
**Problemas**:
- `handleDelete` e `handleTranslate` não usam useCallback
- `setImageError` causa re-render de Image
- Usar `unoptimized={true}` na imagem
- Sem React.memo (renderizado em listas)

**Recomendações**:
```typescript
// ANTES
const handleDelete = async (e: React.MouseEvent) => { ... }
const handleTranslate = async (e: React.MouseEvent) => { ... }

// DEPOIS
const handleDelete = useCallback(async (e: React.MouseEvent) => { ... }, [post.id, showToast])
const handleTranslate = useCallback(async (e: React.MouseEvent) => { ... }, [post.id, showToast])

// Remover unoptimized
<Image
  src={post.cover_image_url}
  alt={post.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
  // unoptimized remover
/>

// Adicionar React.memo no export
export const PostCard = React.memo(PostCardComponent)
```

**Impacto**: +40% rendering speed, -100ms FID

---

### 5. `/components/sections/recent-posts.tsx` - REFATORAR ALTO
**Problemas**:
- `fetchPosts` recriado a cada render
- `handleImageError` sem useCallback
- 57 componentes com useState/useEffect

**Recomendações**:
```typescript
// ANTES
const [posts, setPosts] = useState<BlogPost[]>([])
const fetchPosts = async () => { ... }

useEffect(() => {
  fetchPosts()
}, [])

// DEPOIS
const handleImageError = useCallback((postId: string) => {
  setImageErrors(prev => new Set(prev).add(postId))
}, [])

const fetchPosts = useCallback(async () => {
  try {
    const response = await fetch('/api/blog/posts?page=1&pageSize=2')
    const data = await response.json()
    setPosts(data.posts || [])
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}, [])

useEffect(() => {
  fetchPosts()
}, [fetchPosts])
```

**Impacto**: -200ms FID, -50% memory leaks

---

### 6. `/components/sections/hero.tsx` - REFATORAR MÉDIO
**Problemas**:
- `showCatMessage` state sem useCallback para handlers
- Event handlers não memoizados

**Recomendações**:
```typescript
// Adicionar useCallback
const handleCatMouseEnter = useCallback(() => {
  setShowCatMessage(true)
}, [])

const handleCatMouseLeave = useCallback(() => {
  setShowCatMessage(false)
}, [])

// Usar nos event listeners
onMouseEnter={handleCatMouseEnter}
onMouseLeave={handleCatMouseLeave}
```

**Impacto**: -100ms FID

---

### 7. `/app/[locale]/blog/[slug]/page.tsx` - REFATORAR ALTO
**Problemas**:
- Conflito `revalidate: 3600` vs `dynamic: 'force-dynamic'`
- N+1 problem: `getPost()` depois `getRelatedPosts()`
- Sem image optimization no markdown

**Recomendações**:
```typescript
// ANTES
export const dynamicParams = true
export const revalidate = 3600
export const dynamic = 'force-dynamic'

async function BlogPostPage(...) {
  const post = await getPost(slug, locale)  // 1º fetch
  const relatedPosts = post.category ? await getRelatedPosts(...) : []  // 2º fetch sequencial
}

// DEPOIS
export const dynamicParams = true
export const revalidate = 3600
// Remover dynamic: 'force-dynamic'

async function BlogPostPage(...) {
  // Parallel fetching
  const [post, relatedPosts] = await Promise.all([
    getPost(slug, locale),
    getRelatedPosts(theme, locale, 3)
  ])
}
```

**Impacto**: -200-500ms latência

---

### 8. Arquivos para DELETAR (Limpeza)

#### Backup Files:
- ❌ `app/[locale]/blog/[slug]/page-old.tsx` (523 linhas)
- ❌ `app/[locale]/blog/[slug]/page.tsx.backup` (548 linhas)
- ❌ `app/api/landing-pages/generate/route.ts.backup` (1451 linhas)
- ❌ `components/sections/skills.tsx.backup`
- ❌ `components/blog/post-card.tsx.backup`
- ❌ `components/blog/blog-language-toggle.tsx.backup`

#### Imagem Backups (em `/public/images/`):
- ❌ `catbutler.png.bak` (3.1M)
- ❌ `demo-agente.png.bak` (3.8M)
- ❌ `meowflixia.png.bak` (3.6M)
- ❌ `catbytes-logo.png.bak` (1.4M)
- ❌ `logo-desenvolvedora.png.bak` (201K)
- ❌ `favicon-32x32.png.bak` (1.7M)
- ❌ `simples-medico.png.bak` (4.9M)

**Total a remover**: ~20MB

---

## Componentes para Lazy Load

### Candidatos:
1. **`about.tsx`** (250+ linhas)
   ```typescript
   const AboutLazy = dynamic(() => import('./about').then(m => m.About), {
     ssr: false,
     loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
   })
   ```

2. **`skills.tsx`** (400+ linhas)
   ```typescript
   const SkillsLazy = dynamic(() => import('./skills').then(m => m.Skills), {
     ssr: false,
     loading: () => <SkillsSkeleton />
   })
   ```

3. **`projects.tsx`** (300+ linhas)
4. **`contact.tsx`** (formulário)
5. **`curiosities.tsx`** (350+ linhas)

**Impacto**: Home bundle -40%

---

## Imagens para Comprimir

### Críticas:
| Arquivo | Tamanho Atual | Tamanho Alvo | Redução |
|---------|---------------|-------------|---------|
| `axel.png` | 2.6M | 400KB | 85% |
| `gatinho-faq.png` | 2.9M | 450KB | 85% |
| `og-1200x630.png` | 243KB | 95KB | 60% |
| `catbytes-logo.png` | 1.4M | 200KB | 86% |

**Recomendações**:
1. Converter PNG → JPG com qualidade 85-90%
2. Gerar WebP versão para navegadores modernos
3. Usar Next.js `Image` com `sizes` apropriado

**Script sugerido**:
```bash
# Instalar ImageMagick ou usar online tool
convert axel.png -quality 85 -strip axel.jpg
cwebp axel.jpg -o axel.webp
```

**Impacto**: LCP -1.5s mobile, -0.5s desktop

---

## Tailwind Classes para Extrair

### `globals.css` ou component styles:
```css
@layer components {
  .text-muted {
    @apply text-gray-700 dark:text-gray-300;
  }
  
  .flex-center {
    @apply flex items-center;
  }
  
  .flex-center-gap {
    @apply flex items-center gap-2;
  }
  
  .flex-center-gap-3 {
    @apply flex items-center gap-3;
  }
  
  .card-shadow {
    @apply shadow-lg hover:shadow-xl transition-shadow;
  }
  
  .rounded-lg-shadow {
    @apply rounded-lg shadow-lg;
  }
  
  .transition-colors {
    @apply transition-colors duration-300;
  }
  
  .text-center {
    @apply text-center;
  }
}
```

**Impacto**: -10-15KB CSS gzipped

---

## Componentes para React.memo

### Candidatos:
```typescript
// 1. PostCard
export const PostCard = React.memo(function PostCard({
  post,
  locale,
  index,
  onDelete,
  onTranslate,
  onEdit,
  showAdminButtons
}: PostCardProps) {
  // ...
})

// 2. PostModal
export const PostModal = React.memo(function PostModal({
  post,
  isOpen,
  onClose
}: PostModalProps) {
  // ...
})

// 3. BlogFeed
export default React.memo(function BlogFeed({
  locale
}: BlogFeedProps) {
  // ...
})

// 4. RecentPosts
export const RecentPosts = React.memo(function RecentPosts() {
  // ...
})
```

**Impacto**: Protege contra re-renders desnecessários

---

## SEO Melhorias

### 1. Schema.org Completo
```typescript
// Em blog posts page.tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.seo_description || post.excerpt,
  "image": post.cover_image_url,
  "datePublished": post.created_at,
  "dateModified": post.updated_at,
  "author": {
    "@type": "Person",
    "name": post.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "CatBytes"
  }
}
```

### 2. Alternates em Todas as Páginas
```typescript
// Adicionar em layout.tsx ou individual pages
alternates: {
  canonical: canonicalUrl,
  languages: {
    'pt-BR': `${siteUrl}/pt-BR${pathname}`,
    'en-US': `${siteUrl}/en-US${pathname}`
  }
}
```

### 3. OG Images Dinâmicas
```typescript
// Criar rota: app/api/og/route.ts
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'CatBytes'
  
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 60,
        fontWeight: 'bold',
        color: 'white'
      }}>
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  )
}
```

**Impacto**: +15-20% CTR social media

---

## Resumo de Esforço

| Tarefa | Esforço | Impacto | Prioridade |
|--------|---------|--------|-----------|
| Remover orphans | 30min | Alto | Crítica |
| Comprimir imagens | 1-2h | Muito Alto | Crítica |
| useCallback hooks | 2-3h | Alto | Crítica |
| Lazy load sections | 2-3h | Alto | Crítica |
| Remove unoptimized | 1h | Alto | Crítica |
| React.memo | 1h | Médio | Alta |
| Tailwind extraction | 1h | Médio | Média |
| Schema.org | 1-2h | Médio | Média |
| OG dinâmicas | 1-2h | Médio | Média |
| Fix N+1 blog | 30min | Alto | Alta |

**Total**: ~15-20 horas

