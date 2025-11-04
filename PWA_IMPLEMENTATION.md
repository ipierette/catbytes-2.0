# 📱 PWA Implementation - CatBytes 2.0

## 🎯 Objetivo

Criar uma experiência PWA **premium e profissional**, completamente separada das versões mobile e desktop, com:
- ✅ Design minimalista (Starbucks-inspired)
- ✅ Identidade visual própria
- ✅ Hierarquia clara de informações
- ✅ Performance otimizada
- ✅ Zero impacto em mobile/desktop

---

## 📂 Arquitetura

### **Componentes PWA-Exclusivos** (`components/pwa/`)

```
components/pwa/
├── onboarding-professional.tsx  # Onboarding 3 slides (primeira vez)
├── pwa-wrapper.tsx              # Orquestrador principal com lógica condicional
├── pwa-appbar.tsx               # Header com blur e menu overlay
├── pwa-home-hero.tsx            # Hero objetivo-driven com CTA WhatsApp
└── pwa-cards.tsx                # Cards hierárquicos (Projetos, Blog, IA)
```

### **Hooks** (`hooks/`)

```
hooks/
├── use-pwa-onboarding.ts        # Controla onboarding (localStorage, complete)
└── use-pwa-detection.ts         # Detecta PWA standalone mode
```

---

## 🧩 Componentes Detalhados

### 1. **PWAWrapper** (Orquestrador)

**Responsabilidade:** Decidir o que renderizar com base em `isPWA` e `showOnboarding`.

```tsx
// Lógica condicional
{isPWA && <PWAAppBar />}

{isPWA ? (
  // Layout PWA customizado
  <div className="pt-14">
    <PWAHomeHero />
    <PWACards />
    <div className="px-5">{children}</div>
  </div>
) : (
  // Layout normal (mobile/desktop)
  children
)}
```

**Fluxo:**
1. **Loading** → Spinner minimalista enquanto verifica PWA
2. **Onboarding** → Se `isPWA=true` e primeira vez
3. **PWA Layout** → Se `isPWA=true` e onboarding completo
4. **Normal Layout** → Se `isPWA=false` (browser comum)

---

### 2. **PWAAppBar** (Header Inteligente)

**Specs:**
- **Altura:** 56px + `safe-area-inset-top` (iOS)
- **Background:** 
  - 0-24px scroll: `rgba(124, 58, 237, 0)` + `blur(10px)`
  - >24px scroll: `rgba(44, 14, 120, 0.95)` + `blur(20px)`
- **Transições:** Framer Motion `useScroll` + `useTransform`
- **Menu:** Overlay fullscreen gradient purple, 6 itens, animação staggered

**Elementos:**
```tsx
// Logo
<Image src="/images/catbytes-logo.png" width={32} height={32} />
<span>CatBytes</span>

// Menu Button
<button className="w-10 h-10 rounded-xl bg-white/10">
  <Menu | X />
</button>
```

---

### 3. **PWAHomeHero** (Objetivo Claro)

**Conteúdo:**
```
H1: "Crio PWAs e automações de IA que geram resultado"
Subtitle: "Desenvolvimento full-stack especializado..."
Stack: [React·Next.js] [TypeScript] [Supabase]
CTA: [WhatsApp icon] "Fale comigo no WhatsApp"
```

**Design:**
- **H1:** `text-3xl` (28-32px), `font-semibold`, `tracking-tight`
- **Chips:** Max 3 visíveis, gradientes contextuais (cyan, blue, green)
- **CTA:** `h-12` (48px), gradient green→emerald, `rounded-2xl`, shadow
- **Separator:** Linha gradiente horizontal ao final

**Diferenciais:**
- ❌ NÃO usa "Olá, sou Izadora" genérico
- ✅ USA proposta de valor direta
- ✅ WhatsApp como CTA primário (não flutuante)

---

### 4. **PWACards** (Hierarquia Visual)

**Layout:**
```
┌──────────────────────────┐
│  Projetos (GRANDE)       │  ← Card principal, elevation 2
│  [Mini-mockup decorativo]│
└──────────────────────────┘

┌────────────┐ ┌────────────┐
│ Blog       │ │ IA Felina  │  ← Grid 2 colunas, menores
│ +30 artigos│ │ Sparkles   │
└────────────┘ └────────────┘
```

**Cores Exclusivas:**
- **Projetos:** `violet-500 → purple-600` (prioridade máxima)
- **Blog:** `cyan-500 → blue-600` (secundário)
- **IA Felina:** `amber-500 → orange-600` (exclusivo, não reciclado!)

**Specs:**
- **Principal:** `p-6`, `shadow-xl`, icon badge top-right, mini-mockup decorativo
- **Secundários:** `p-5`, `min-h-[160px]`, `shadow-lg`, ícones 32px (w-8 h-8)
- **Hover:** `scale-1.02`, `whileTap: 0.98`

---

## 🎨 Design System

### **Color Mode: DARK ONLY** 🌙

O PWA funciona **exclusivamente em modo escuro** para economia de bateria e UX premium mobile:

```tsx
// Background principal
bg-zinc-950  // #0a0a0a - Preto suave OLED

// Textos
text-white       // Títulos e headings
text-zinc-300    // Corpo de texto
text-zinc-400    // Subtítulos e labels
text-zinc-500    // Placeholders

// Borders e separadores
border-zinc-800  // Borders sutis
via-zinc-800     // Gradientes de separação

// Elementos interativos
bg-zinc-800      // Backgrounds secundários
bg-zinc-700      // Hover states
```

**Contraste WCAG AAA:**
- White on zinc-950: 20.4:1 ✅
- zinc-300 on zinc-950: 14.2:1 ✅
- zinc-400 on zinc-950: 10.5:1 ✅

### **Typography**

| Elemento | Classe Tailwind | Pixel | Line Height |
|----------|----------------|-------|-------------|
| H1 Hero  | `text-3xl`     | 28-32px | `leading-tight` |
| H2 Cards | `text-2xl`     | 22-24px | default |
| H3 Small | `text-lg`      | 18px | default |
| Body     | `text-base`    | 16px | `leading-relaxed` (1.5) |
| Caption  | `text-sm`      | 14px | `leading-snug` |

### **Images & Icons** 🖼️

**Problema resolvido:** Orelhas do gato cortadas em containers quadrados.

```tsx
// ❌ ANTES (cortava orelhas)
<div className="relative w-32 h-32">
  <Image src="/gato-sentado.webp" fill className="object-contain" />
</div>

// ✅ AGORA (altura aumentada +25%)
<div className="relative w-32 h-40">
  <Image src="/gato-sentado.webp" fill className="object-contain" />
</div>
```

**Specs:**
- **Onboarding slides:** `w-32 h-40` (128x160px)
- **AppBar logo:** `w-8 h-10` (32x40px)
- **Aspect ratio:** ~1:1.25 (vertical bias para orelhas)
- **object-contain:** Mantém proporção, nunca corta

**Imagens afetadas:**
- ✅ `catbytes-logo.png` - Logo com orelhas
- ✅ `gato-sentado.webp` - Gato com orelhas altas
- ✅ `logo-desenvolvedora.png` - Mascote completo

### **Spacing (8-pt Grid)**

```
px-5  = 20px (padding horizontal mobile)
py-12 = 48px (padding vertical sections)
gap-4 = 16px (espaçamento entre cards)
mb-8  = 32px (margin bottom)
```

### **Colors**

```tsx
// Primary (Projetos, AppBar)
violet-500 (#8B5CF6) → purple-600 (#9333EA)

// Secondary (Blog)
cyan-500 (#06B6D4) → blue-600 (#2563EB)

// Accent (IA Felina)
amber-500 (#F59E0B) → orange-600 (#EA580C)

// Neutral
zinc-900 (texto dark) / zinc-600 (texto light)
white / zinc-950 (backgrounds)
```

### **Shadows**

```
shadow-xl = 0 20px 25px -5px rgb(0 0 0 / 0.1)
shadow-lg = 0 10px 15px -3px rgb(0 0 0 / 0.1)

// Contextuais
shadow-violet-500/20  (Projetos)
shadow-cyan-500/10    (Blog)
shadow-amber-500/10   (IA Felina)
```

---

## 🔒 Lógica de Detecção

### **usePWADetection**

```typescript
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
const isInWebAppiOS = (navigator as any).standalone === true
const isPWA = isStandalone || isInWebAppiOS
```

**Suporte:**
- ✅ Android (Chrome, Samsung Browser)
- ✅ iOS (Safari)
- ✅ Desktop (Chrome, Edge)

### **Renderização Condicional por Rota** 🛣️

```tsx
// PWAWrapper usa usePathname() do Next.js
const pathname = usePathname()
const isHomePage = pathname === '/' || pathname === '/pt-BR' || pathname === '/en-US'

{isPWA ? (
  <>
    {/* Hero + Cards APENAS na home */}
    {isHomePage && (
      <div className="pt-14 bg-zinc-950">
        <PWAHomeHero />
        <PWACards />
      </div>
    )}
    
    {/* Conteúdo das páginas */}
    <div className={isHomePage ? '' : 'pt-14'}>
      {children}
    </div>
  </>
) : (
  children  // Mobile/Desktop normal
)}
```

**Comportamento:**
- **Home PWA** (`/`, `/pt-BR`, `/en-US`): Hero + Cards + Seções (About, Skills, etc)
- **Blog PWA** (`/blog`): AppBar + Conteúdo do Blog (sem Hero/Cards)
- **Projetos PWA** (`/projetos`): AppBar + Galeria de projetos
- **IA PWA** (`/ia-felina`): AppBar + Features de IA
- **Browser normal**: Layout padrão (Header, Footer, conteúdo)

**pt-14 (56px):** Compensa altura do AppBar fixo em páginas não-home

---

## 📱 Safe Areas (iOS)

```css
/* AppBar */
padding-top: env(safe-area-inset-top);

/* Onboarding Footer */
padding-bottom: max(1rem, env(safe-area-inset-bottom));

/* Menu Overlay */
padding-top: calc(56px + env(safe-area-inset-top));
padding-bottom: env(safe-area-inset-bottom);
```

---

## 🧪 Testing

### **Browser (Desktop/Mobile)**

```bash
npm run dev
```

**Esperado:**
- ❌ NÃO deve aparecer onboarding
- ❌ NÃO deve aparecer PWAAppBar
- ❌ NÃO deve aparecer PWAHomeHero/PWACards
- ✅ DEVE aparecer layout normal (Header, Footer, conteúdo padrão)

### **PWA Instalado**

**Android:**
1. Chrome → Menu (⋮) → "Install app"
2. Abrir do launcher
3. **Esperado:**
   - ✅ Onboarding 3 slides (primeira vez)
   - ✅ PWAAppBar no topo (blur)
   - ✅ PWAHomeHero ("Crio PWAs...")
   - ✅ PWACards (Projetos grande, Blog/IA menores)

**iOS:**
1. Safari → Share → "Add to Home Screen"
2. Abrir do home screen
3. **Esperado:** Mesmos comportamentos acima

---

## 🚀 Performance

### **Build Stats**

```
✓ Compiled successfully in 6.3s
✓ Generating static pages (27/27)

Route /[locale]     11.1 kB   214 kB First Load JS
Zero errors, zero warnings críticos
```

### **Otimizações**

- ✅ **Lazy Loading:** PWA components só carregam quando `isPWA=true`
- ✅ **Static Pages:** 27 páginas pré-renderizadas
- ✅ **Image Optimization:** Next.js `<Image>` com `fill` + `object-contain`
- ✅ **Framer Motion:** Apenas animações críticas (entrada, scroll)
- ✅ **localStorage:** `catbytes-pwa-onboarding-v2` (reset manual via dev tools)

---

## 📝 Commits

### **v2.0 - Onboarding Profissional** (2f70f2f)
- ✅ Removeu WhatsAppButton e BackToTop
- ✅ Criou onboarding minimalista 3 slides
- ✅ Design system 8-pt grid

### **v2.1 - Componentes PWA Exclusivos** (20c9a67)
- ✅ PWAAppBar com blur inteligente
- ✅ PWAHomeHero objetivo-driven
- ✅ PWACards hierárquicos
- ✅ Lógica condicional `isPWA`

### **v2.2 - Dark Mode + Fixes Críticos** (7a4080b)
- ✅ **Modo escuro completo:** bg-zinc-950, text-white/zinc-300/400
- ✅ **Imagens sem corte:** h-40 onboarding, h-10 AppBar (+25% altura)
- ✅ **Páginas funcionais:** usePathname(), Hero/Cards só na home
- ✅ **Rotas corretas:** Blog, Projetos, IA renderizam com pt-14

---

## 🎯 Próximos Passos

- [ ] A/B Testing: headline Hero (testar variações)
- [ ] Analytics: eventos PWA (install, onboarding_complete, cta_click)
- [ ] Push Notifications: engajamento (opcional)
- [ ] Offline Mode: cache estratégico (Service Worker)
- [ ] Animações: micro-interações cards (haptic feedback?)

---

## 🔧 Manutenção

### **Resetar Onboarding (Dev)**

```js
// Console do browser PWA
localStorage.removeItem('catbytes-pwa-onboarding-v2')
location.reload()
```

### **Verificar PWA Mode (Debug)**

```js
// Console
console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches)
console.log('iOS:', window.navigator.standalone)
```

### **Modificar Slides**

```tsx
// components/pwa/onboarding-professional.tsx
const slides = [
  {
    id: 'web-apps',
    title: 'Aplicações Web Modernas',
    subtitle: 'PWAs rápidas...',
    // ...
  }
]
```

---

## ⚠️ Avisos Importantes

1. **NÃO modificar componentes originais** (Header, Hero, Cards do site)
2. **Sempre verificar `isPWA`** antes de renderizar componentes PWA
3. **Testar em ambos** (browser E PWA instalado)
4. **Safe areas obrigatórias** para iOS (notch/home indicator)
5. **Build antes de commit** (`npm run build`)

---

## 📚 Referências

- [Next.js PWA](https://github.com/shadowwalker/next-pwa)
- [Framer Motion - useScroll](https://www.framer.com/motion/use-scroll/)
- [MDN - display-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/display-mode)
- [iOS Safari - standalone](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

---

**Desenvolvido com 💜 por Izadora - CatBytes 2.0**
